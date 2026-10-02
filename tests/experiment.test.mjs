import test from 'node:test';
import assert from 'node:assert/strict';
import {protocols} from '../data.js';
import {buildFamilies,selectVersions} from '../catalog.js';
import {reagentAmounts,resolveReagentSteps,experimentReport,experimentCSV} from '../experiment.js';
const byId=id=>protocols.find(p=>p.id===id);
test('commercial recipes remain grouped and manufacturers can be selected independently',()=>{
 const families=buildFamilies(protocols),plasmids=families.find(f=>f.id==='plasmid-miniprep');
 assert.equal(families.filter(f=>f.id==='phusion').length,1);assert.equal(families.find(f=>f.id==='phusion').versions.length,5);
 assert.equal(new Set(plasmids.versions.map(p=>p.manufacturer)).size,9);
 assert.deepEqual(selectVersions(plasmids.versions,{manufacturer:'neb'}).map(p=>p.id),['monarch-spin-t1110']);
 assert.equal(selectVersions(plasmids.versions,{material:'Plantas'}).length,0);
 const genomic=families.find(f=>f.id==='genejet-genomic');assert.equal(selectVersions(genomic.versions,{material:'Levaduras'})[0].id,'genejet-genomic-yeast');
});
test('Phusion stocks, alternative buffers and cycling are not conflated with hot-start activation',()=>{
 for(const id of ['phusion-thermo-hf','phusion-thermo-gc','phusion-neb-hf','phusion-neb-gc']){const p=byId(id);assert.equal(p.volume,50);assert.equal(p.components[0].volume,10);assert.equal(p.components.find(r=>r.name.includes('2 U/µL')).volume,0.5);assert.equal(p.thermal[0].temp,98);assert.equal(p.thermal[0].seconds,30);assert.equal(p.components.filter(r=>r.name.includes('Buffer')).length,1);}
 assert.equal(byId('mytaq-hs').thermal[0].seconds,60);
});
test('material-specific genomic extraction preserves distinct digestion and ethanol additions',()=>{
 const blood=byId('genejet-genomic-blood'),positive=byId('genejet-genomic-gram-positive'),yeast=byId('genejet-genomic-yeast');
 assert.equal(blood.reagents.find(r=>r.key==='eth').amount,200);assert.match(blood.reagents.find(r=>r.key==='eth').name,/96–100/);assert.ok(!blood.reagents.some(r=>r.key==='rna'));
 assert.equal(positive.reagents.filter(r=>r.name.startsWith('Lysis Solution')).reduce((n,r)=>n+r.amount,0),400);
 assert.equal(yeast.steps.find(s=>s.title==='Formar esferoplastos').seconds,3600);
});
test('miniprep manufacturers retain different neutralization, wash and protease quantities',()=>{
 assert.equal(byId('nucleospin-plasmid').reagents.find(r=>r.key==='a3').amount,300);
 assert.equal(byId('monarch-spin-t1110').reagents.find(r=>r.key==='b3').amount,400);
 assert.equal(byId('wizard-plus-sv').reagents.find(r=>r.key==='pro').amount,10);
 assert.equal(byId('genejet-plasmid').reagents.find(r=>r.key==='wash').amount,1000);
 assert.equal(byId('norgen-plasmid').reagents.find(r=>r.key==='we').amount,600);
});
test('measured lysate determines ratios and the executed instructions use edited quantities',()=>{
 const p=byId('dneasy-plant-mini'),rows=structuredClone(p.reagents);rows.find(r=>r.key==='clear').amount=320;
 assert.equal(reagentAmounts(rows).find(r=>r.key==='aw1').amount,480);
 assert.match(resolveReagentSteps(p.steps,rows).find(s=>s.title==='Medir y preparar unión').text,/480 µL/);
 assert.equal(p.reagents.find(r=>r.key==='clear').amount,450);
 assert.throws(()=>reagentAmounts([{key:'a',name:'A',relativeTo:'b',factor:1},{key:'b',name:'B',relativeTo:'a',factor:1}]),/circular/);
 assert.throws(()=>resolveReagentSteps([{text:'{{missing}}'}],[]),/Falta/);
});
test('every added extraction resolves quantities without unfilled placeholders',()=>{
 for(const p of protocols.filter(p=>p.reagents?.length)){const steps=resolveReagentSteps(p.steps,p.reagents);assert.ok(!JSON.stringify(steps).includes('{{'),p.id);assert.ok(p.materials.length,p.id);}
 const salt=byId('trizol-highsalt');assert.equal(salt.reagents.find(r=>r.key==='ipa').amount,250);assert.equal(salt.reagents.find(r=>r.key==='salt').amount,250);assert.ok(salt.citations.some(c=>c.source.includes('/faqs')));
});
test('notebook snapshot exports modified quantities, steps, notes and actual advance marks',()=>{
 const p=byId('genejet-plasmid'),reagents=structuredClone(p.reagents);reagents.find(r=>r.key==='elu').amount=35;
 const run={id:'snapshot',name:'Ensayo "A", réplica',appVersion:'2.2.0',protocolTitle:p.title,protocolId:p.id,source:p.source,version:p.version,materials:['Bacterias'],config:{reactions:3,components:[],reagents,thermal:[{label:'Cambio personal',temp:60,seconds:90,repeat:false}],cycles:1,edited:true},steps:resolveReagentSteps(p.steps,reagents),index:2,events:[{step:0,title:'Recoger células',date:'2026-10-02T10:00:00Z',remaining:12,skippedTimer:true}],stepNotes:{2:'Observación con | carácter'},protocolNotes:'Lote 42'};
 const report=experimentReport(run),csv=experimentCSV(run);assert.match(report,/Modificada por el usuario/);assert.match(report,/35 µL/);assert.match(report,/105/);assert.match(report,/12 s pendientes/);assert.match(report,/Lote 42/);assert.match(report,/En curso/);assert.match(report,/Sin avance registrado/);assert.match(csv,/Ensayo ""A"", réplica/);assert.match(csv,/"35","105","µL"/);assert.ok(!run.complete);
});
