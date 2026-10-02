import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {thermoConventional,thermoConventionalSources} from '../thermo-conventional-data.js';
import {defaultDigest,recommendBuffer,digestCalculation,activityMinimum,digestText} from '../restriction-calc.js';
import {compatibilityView,restrictionView} from '../restriction.js';
import {digestWorkbook} from '../excel.js';
const config=(ids=['EcoRV'])=>{const c=defaultDigest('thermo-conventional');c.volume=50;c.enzymes=ids.map(id=>({id,volume:1,stock:10}));c.samples=[{name:'A',concentration:100}];return c;};

test('conventional EcoRV chooses its Red buffer and specific products choose their own supplied buffers',()=>{
 const r=digestCalculation(config());assert.equal(r.valid,true);assert.equal(r.buffer.id,'r');assert.equal(r.buffer.minimum,100);assert.match(r.buffer.color,/rojo/);assert.equal(r.bufferVolume,5);
 for(const id of ['EcoRI','BamHI','KpnI']){const r=recommendBuffer('thermo-conventional',[id]);assert.equal(r.best.id,'specific-'+id);assert.equal(r.best.minimum,100);}
 assert.equal(recommendBuffer('thermo',['EcoRV']).best.id,'fd');
});
test('EcoRV plus HindIII chooses Red at 100 percent for both enzymes',()=>{
 const r=digestCalculation(config(['EcoRV','HindIII']));assert.equal(r.valid,true);assert.equal(r.buffer.id,'r');assert.deepEqual(r.buffer.activities.map(a=>a.value),['100','100']);
});
test('triple digestion chooses Tango 2X and doubles buffer volume in the reaction and XLSX formula',async()=>{
 const c=config(['EcoRV','EcoRI','BglII']),r=digestCalculation(c);assert.equal(r.valid,true);assert.equal(r.buffer.id,'tango2');assert.equal(r.buffer.final,2);assert.equal(r.bufferVolume,10);assert.equal(r.rows[0].dna,10);assert.equal(r.rows[0].water,27);assert.deepEqual(r.buffer.activities.map(a=>a.value),['100','100','100']);
 const scope={window:{}};vm.runInNewContext(await readFile(new URL('../vendor/xlsx.mini.min.js',import.meta.url),'utf8'),scope);const X=scope.window.XLSX,b=X.read(digestWorkbook(c,r,X),{type:'array',cellFormula:true});
 assert.equal(b.Sheets.Condiciones.B7.v,2);assert.equal(b.Sheets.Digestiones.E2.v,10);assert.equal(b.Sheets.Digestiones.J2.v,27);assert.equal(b.Sheets.Digestiones.E2.f,"'Condiciones'!$B$4*'Condiciones'!$B$7/'Condiciones'!$B$6");
 assert.match(X.utils.sheet_to_csv(b.Sheets.Condiciones),/EcoRI actividad en buffer elegido,100/);
});
test('NR, unknown compatibility and star warnings remain distinct and cannot start an invalid assay',()=>{
 const c=config(['EcoRI']);c.buffer='g';let r=digestCalculation(c);assert.equal(r.valid,false);assert.equal(r.buffer.notRecommended,true);assert.ok(r.errors.some(e=>e.startsWith('NR:')));assert.equal(r.buffer.minimum,null);
 c.buffer='specific-KpnI';r=digestCalculation(c);assert.equal(r.valid,false);assert.equal(r.buffer.notRecommended,false);assert.ok(r.errors.some(e=>e.includes('No hay datos publicados')));
 c.buffer='r';r=digestCalculation(c);assert.equal(r.valid,false);assert.ok(r.errors.some(e=>e.includes('star')));
 assert.equal(activityMinimum('NR'),null);assert.equal(activityMinimum(undefined),null);assert.equal(activityMinimum('50–100'),50);assert.equal(activityMinimum('0–20'),0);
});
test('partial common activities are not interpolated and a buffer cannot override incompatible temperatures',()=>{
 const c=config(['EcoRV','BamHI']);let r=digestCalculation(c);assert.equal(r.buffer.id,'g');assert.equal(r.buffer.minimum,50);assert.equal(r.valid,false);assert.ok(r.warnings.some(e=>e.includes('50–100')));c.ackPartial=true;assert.equal(digestCalculation(c).valid,true);
 const low=digestCalculation(config(['EcoRV','KpnI']));assert.equal(low.valid,false);assert.ok(low.errors.some(e=>e.includes('digestión secuencial')));
 const temp=digestCalculation(config(['EcoRV','BclI']));assert.equal(temp.valid,false);assert.ok(temp.errors.some(e=>e.includes('37 / 55')));
});
test('all configured conventional products have sourced temperatures, intact ranges and a documented buffer',()=>{
 assert.equal(thermoConventional.enzymes.length,162);assert.equal(thermoConventionalSources.matrixProducts,190);assert.equal(new Set(thermoConventional.enzymes.map(e=>e.id)).size,162);
 for(const e of thermoConventional.enzymes){assert.ok(thermoConventional.buffers.some(b=>b.id===e.recommendedBuffer),e.name);assert.ok([30,37,50,55,65].includes(e.temp),e.name);assert.ok(e.site);assert.match(e.product,/thermofisher.com\/order\/catalog\/product\/ER/);assert.match(e.source,/reaction-conditions/);assert.ok(e.conditionsSource);for(const id of ['b','g','o','r','tango','tango2'])assert.match(e.activities[id],/^(?:NR|\d+(?:–\d+)?)$/);}
 assert.equal(thermoConventional.enzymes.filter(e=>e.id==='EcoRV').length,1);
});
test('UI exposes each individual buffer, all activity cells and different Tango final concentrations',()=>{
 const c=config(['EcoRV','EcoRI','BglII']),r=digestCalculation(c),html=compatibilityView(r);assert.match(html,/Eco32I \(EcoRV\).*Buffer R · Red \(rojo\)/);assert.match(html,/Tango · amarillo · 2X/);assert.match(html,/NR · no recomendado/);assert.match(html,/Sin datos/);assert.match(html,/Manual PDF/);assert.match(html,/Temperaturas y sitios por producto/);
 const view=restrictionView({getConfig:()=>c});assert.match(view,/2X final \(stock 10X\)/);assert.match(view,/Usar buffer recomendado/);assert.match(view,/Convencionales/);
});
test('notebook exports retain chosen and individual buffers, activity ranges and specific product manuals',()=>{
 const c=config(['EcoRV','EcoRI','BglII']),r=digestCalculation(c),report=digestText(c,r);assert.match(report,/Tango · amarillo 2X/);assert.match(report,/EcoRI 100 %/);assert.match(report,/buffer individual Buffer EcoRI/);assert.match(report,/MAN0012096_Eco32I/);assert.match(report,/MAN0012092_EcoRI/);
});
