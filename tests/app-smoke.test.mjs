import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as data from '../data.js';
import * as calculators from '../calc.js';
const source=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import .+;$/gm,'');
function boot(hash){
 const nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'1',dataset:{},classList:{add(){},remove(){},toggle(){}},showModal(){},close(){},focus(){}});return nodes.get(id);};
 const document={querySelector:selector=>selector.startsWith('#')?node(selector):null,querySelectorAll:()=>[],addEventListener(){},createElement:()=>({click(){}})};
 const context=vm.createContext({...data,...calculators,baseProtocols:data.protocols,document,window:{addEventListener(){},print(){}},location:{hash},navigator:{},localStorage:{getItem:()=>null,setItem(){}},crypto,URL,Blob,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},fetch:()=>Promise.reject(new Error('Offline test'))});
 vm.runInContext(source,context,{timeout:1000});return {context,nodes};
}
test('client boots on every main screen without an exception',()=>{for(const route of ['protocols','favorites','calculators','media','notebook','sources','detail/q5','run']){const {nodes}=boot('#'+route);assert.ok(nodes.get('#app').innerHTML.length>100,route);assert.ok(nodes.get('#nav').innerHTML.includes('Protocolos'));}});
test('protocol configuration binds controls and renders numeric recipe',()=>{const {context,nodes}=boot('#detail/q5');vm.runInContext("state.detailTab='config';render();",context);assert.match(nodes.get('#app').innerHTML,/123,75/);assert.match(nodes.get('#app').innerHTML,/add-thermal/);assert.equal(typeof nodes.get('#start-protocol').onclick,'function');});

