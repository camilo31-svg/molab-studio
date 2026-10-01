import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as data from '../data.js';
import * as calculators from '../calc.js';
import * as catalog from '../catalog.js';
import {reagentCard} from '../bench.js';
import {literatureSearches} from '../literature-data.js';
const source=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import .+;$/gm,'');
function boot(hash){
 const nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'1',dataset:{},classList:{add(){},remove(){},toggle(){}},showModal(){},close(){},focus(){}});return nodes.get(id);};
 const document={querySelector:selector=>selector.startsWith('#')?node(selector):null,querySelectorAll:()=>[],addEventListener(){},createElement:()=>({click(){}})};
 const context=vm.createContext({...data,...calculators,...catalog,reagentCard,literatureSearches,stopBenchTick(){},baseProtocols:data.protocols,document,window:{addEventListener(){},print(){}},location:{hash},navigator:{},localStorage:{getItem:()=>null,setItem(){}},crypto,URL,Blob,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},fetch:()=>Promise.reject(new Error('Offline test'))});
 vm.runInContext(source,context,{timeout:1000});return {context,nodes};
}
test('client boots on every main screen without an exception',()=>{for(const route of ['protocols','favorites','calculators','media','notebook','sources','detail/q5','run']){const {nodes}=boot('#'+route);assert.ok(nodes.get('#app').innerHTML.length>100,route);assert.ok(nodes.get('#nav').innerHTML.includes('Protocolos'));}});
test('protocol configuration binds controls and renders numeric recipe',()=>{const {context,nodes}=boot('#detail/q5');vm.runInContext("state.detailTab='config';render();",context);assert.match(nodes.get('#app').innerHTML,/123,75/);assert.match(nodes.get('#app').innerHTML,/add-thermal/);assert.equal(typeof nodes.get('#start-protocol').onclick,'function');});
test('GoldenBraid is a single catalog card; bibliography has no protocol navigation',()=>{const {context,nodes}=boot('#protocols');vm.runInContext("state.query='GoldenBraid';render();",context);assert.equal((nodes.get('#app').innerHTML.match(/data-family="goldenbraid"/g)||[]).length,1);vm.runInContext("state.id='gb-2021';state.page='detail';state.detailTab='bibliography';render();",context);const html=nodes.get('#app').innerHTML;assert.match(html,/Bibliografía de GoldenBraid/);assert.doesNotMatch(html,/data-protocol="lit-/);});
test('external design step survives run creation; selected recipe is not merged with another version',()=>{const {context}=boot('#detail/gb-2021');const data=vm.runInContext('buildRunSteps(initialConfig(getProtocol()))',context);assert.equal(data[0].external.url,'https://goldenbraidpro.com/');assert.equal(data.filter(s=>s.thermalPhase).length,51);assert.equal(data.find(s=>s.thermalPhase).seconds,120);});
test('paper filter excludes commercial and reference-only catalog entries',()=>{const {context,nodes}=boot('#protocols');vm.runInContext("state.origin='paper';render();",context);const html=nodes.get('#app').innerHTML;assert.match(html,/data-family="goldenbraid"/);assert.doesNotMatch(html,/data-family="q5"|data-family="lipofectamine3000"|data-family="lit-/);});

