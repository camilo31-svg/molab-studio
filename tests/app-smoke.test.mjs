import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as data from '../data.js';
import * as calculators from '../calc.js';
import * as catalog from '../catalog.js';
import * as experiment from '../experiment.js';
import {reagentCard} from '../bench.js';
import {literatureSearches} from '../literature-data.js';
import {restrictionView,bindRestriction} from '../restriction.js';
import {defaultDigest,digestText,digestCalculation} from '../restriction-calc.js';
import {digestWorkbook,programWorkbook} from '../excel.js';
import {programText,programCSV} from '../program-export.js';
const source=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import .+;$/gm,'');
function boot(hash){
 const nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'1',dataset:{},classList:{add(){},remove(){},toggle(){}},showModal(){},close(){},focus(){}});return nodes.get(id);};
 const document={querySelector:selector=>selector.startsWith('#')?node(selector):null,querySelectorAll:()=>[],addEventListener(){},createElement:()=>({click(){}})};
 document.documentElement={dataset:{}};
 const context=vm.createContext({...data,...calculators,...catalog,...experiment,reagentCard,literatureSearches,restrictionView,bindRestriction:()=>{},defaultDigest,digestText,digestCalculation,digestWorkbook,programWorkbook,programText,programCSV,stopBenchTick(){},baseProtocols:data.protocols,document,window:{addEventListener(){},print(){}},location:{hash},navigator:{},localStorage:{getItem:()=>null,setItem(){}},crypto,URL,Blob,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},fetch:()=>Promise.reject(new Error('Offline test'))});
 vm.runInContext(source,context,{timeout:1000});return {context,nodes};
}
test('client boots on every main screen without an exception',()=>{for(const route of ['protocols','favorites','calculators','media','notebook','sources','detail/q5','run']){const {nodes}=boot('#'+route);assert.ok(nodes.get('#app').innerHTML.length>100,route);assert.ok(nodes.get('#nav').innerHTML.includes('Protocolos'));}});
test('protocol configuration binds controls and renders numeric recipe',()=>{const {context,nodes}=boot('#detail/q5');vm.runInContext("state.detailTab='config';render();",context);assert.match(nodes.get('#app').innerHTML,/123,75/);assert.match(nodes.get('#app').innerHTML,/add-thermal/);assert.equal(typeof nodes.get('#start-protocol').onclick,'function');});
test('GoldenBraid is a single catalog card; bibliography has no protocol navigation',()=>{const {context,nodes}=boot('#protocols');vm.runInContext("state.query='GoldenBraid';render();",context);assert.equal((nodes.get('#app').innerHTML.match(/data-family="goldenbraid"/g)||[]).length,1);vm.runInContext("state.id='gb-2021';state.page='detail';state.detailTab='bibliography';render();",context);const html=nodes.get('#app').innerHTML;assert.match(html,/Bibliografía de GoldenBraid/);assert.doesNotMatch(html,/data-protocol="lit-/);});
test('external design step survives run creation; selected recipe is not merged with another version',()=>{const {context}=boot('#detail/gb-2021');const data=vm.runInContext('buildRunSteps(initialConfig(getProtocol()))',context);assert.equal(data[0].external.url,'https://goldenbraidpro.com/');assert.equal(data.filter(s=>s.thermalPhase).length,51);assert.equal(data.find(s=>s.thermalPhase).seconds,120);});
test('paper filter excludes commercial and reference-only catalog entries',()=>{const {context,nodes}=boot('#protocols');vm.runInContext("state.origin='paper';render();",context);const html=nodes.get('#app').innerHTML;assert.match(html,/data-family="goldenbraid"/);assert.doesNotMatch(html,/data-family="q5"|data-family="lipofectamine3000"|data-family="lit-/);});
test('modified methods have no contradictory empty message and the guided step shows its external task',()=>{const {context,nodes}=boot('#detail/gb-2021');vm.runInContext("state.detailTab='tips';render();",context);assert.doesNotMatch(nodes.get('#app').innerHTML,/Sin recomendaciones revisadas/);vm.runInContext("const c=initialConfig(getProtocol());saved.activeRun={name:'Verificación',config:c,steps:buildRunSteps(c),index:0,stepNotes:{},timer:{running:false,remaining:0}};state.page='run';render();",context);const html=nodes.get('#app').innerHTML;assert.match(html,/href="https:\/\/goldenbraidpro.com\//);assert.match(html,/Siguiente paso/);});
test('every extraction screen renders the actual recipe and configurable stage quantities',()=>{
 for(const p of data.protocols.filter(p=>p.reagents?.length)){const {context,nodes}=boot('#detail/'+p.id);assert.doesNotMatch(nodes.get('#app').innerHTML,/\{\{/);vm.runInContext("state.detailTab='config';render();",context);assert.match(nodes.get('#app').innerHTML,/data-reagent="/);assert.match(nodes.get('#app').innerHTML,/Material de este experimento/);}
});
test('theme can be toggled and material filters do not show an incompatible method',()=>{
 const {context,nodes}=boot('#protocols');vm.runInContext("document.querySelector('#theme-toggle').onclick();",context);assert.equal(vm.runInContext('document.documentElement.dataset.theme',context),'dark');
 vm.runInContext("state.material='Plantas';render();",context);assert.match(nodes.get('#app').innerHTML,/data-family="ctab"/);assert.doesNotMatch(nodes.get('#app').innerHTML,/data-family="plasmid-miniprep"/);
});
test('run snapshot uses modified reagent instructions and records material and source',()=>{
 const {context,nodes}=boot('#detail/genejet-plasmid');vm.runInContext("state.detailTab='config';render();saved.configs[state.id]=initialConfig(getProtocol());saved.configs[state.id].reagents.find(r=>r.key==='elu').amount=35;saved.configs[state.id].edited=true;startProtocol(getProtocol());",context);
 const run=vm.runInContext('saved.activeRun',context);assert.equal(run.appVersion,'2.3.0');assert.equal(run.materials[0],'Bacterias · cultivo de E. coli');assert.match(run.steps.find(s=>s.title==='Añadir eluyente').text,/35 µL/);
 vm.runInContext('exportExperiment(saved.activeRun.id)',context);assert.match(nodes.get('#modal').innerHTML,/data-experiment-format="csv"/);
});
test('restriction configuration uses the selected manufacturer and preserves its guided snapshot',()=>{
 const {context,nodes}=boot('#detail/digest-thermo');vm.runInContext("state.detailTab='config';render();",context);assert.match(nodes.get('#app').innerHTML,/FastDigest Green/);assert.match(nodes.get('#app').innerHTML,/data-enzyme="2"/);
 vm.runInContext("const c=defaultDigest('neb');c.volume=50;c.samples=[{name:'A',concentration:100},{name:'B',concentration:50}];startDigest(c,digestCalculation(c));",context);const run=vm.runInContext('saved.activeRun',context);assert.equal(run.restrictionResult.rows.length,2);assert.equal(run.restrictionResult.rows[1].dna,20);assert.equal(run.steps.length,5);assert.equal(run.config.thermal[0].temp,37);assert.match(experiment.experimentReport(run),/B \| 50 \| 1000 \| 20/);
});
test('program is downloadable before a run and keeps edited settings',()=>{
 const {context,nodes}=boot('#detail/q5');vm.runInContext("state.detailTab='config';render();var cfg=initialConfig(getProtocol());cfg.cycles=12;cfg.thermal[0].temp=95;exportProgram('Programa editado',cfg);",context);assert.match(nodes.get('#app').innerHTML,/id="export-program"/);assert.match(nodes.get('#modal').innerHTML,/Ciclos del bloque repetido: 12/);assert.match(nodes.get('#modal').innerHTML,/program-xlsx/);assert.match(nodes.get('#modal').innerHTML,/95/);
});
test('all notebook export buttons dispatch the corresponding complete record format',()=>{
 const {context}=boot('#detail/genejet-plasmid'),buttons=['md','txt','csv','json'].map(format=>({dataset:{experimentFormat:format}}));
 context.document.querySelectorAll=selector=>selector==='[data-experiment-format]'?buttons:[];
 vm.runInContext("saved.runs=[{id:'export-check',name:'Exportación de prueba',protocolId:'genejet-plasmid',config:initialConfig(getProtocol()),steps:getProtocol().steps,stepNotes:{},events:[]}];var downloaded=[];download=(name,body,type)=>downloaded.push({name,body,type});exportExperiment('export-check');",context);
 for(const button of buttons)button.onclick();const result=vm.runInContext('downloaded',context);
 assert.equal(result.length,4);assert.match(result[0].name,/\.md$/);assert.match(result[1].body,/# Exportación de prueba/);assert.match(result[2].body,/"Elution Buffer","50","400","µL"/);assert.equal(JSON.parse(result[3].body).config.reagents.find(r=>r.key==='elu').amount,50);
});

