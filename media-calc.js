import {classicalMedia} from './media-data.js?v=2.6.0';
const copy=x=>JSON.parse(JSON.stringify(x));
const number=(value,label,zero=false)=>{if(String(value).trim()==='')throw new Error(label+' es obligatorio.');const n=Number(value);if(!Number.isFinite(n)||(zero?n<0:n<=0))throw new Error(label+(zero?' no puede ser negativo.':' debe ser mayor que cero.'));return n;};
export function defaultMedium(m){return {id:m.id,mode:'commercial',volume:500,dose:m.grams||classicalMedia[m.id]?.commercialDose||0,amounts:{},extras:[],notes:'',ph:'',lot:'',stocks:{}};}
export function commercialComponents(m,d){
 const recipe=classicalMedia[m.id];
 if(m.id==='atccmedia')return [];
 if(m.grams||recipe?.commercialDose||m.id==='m9'){
  const dose=d.dose;
  return [{id:'powder',name:'Polvo comercial · '+(recipe?.commercialCode||m.name),amount:number(dose,'Dosis comercial'),unit:'g/L'},...(m.id==='tb'?[{id:'glycerol',name:'Glicerol',amount:4,unit:'mL/L'}]:[]),...(m.id==='m9'?recipe.components.filter(c=>c.stock):[])];
 }
 return [{id:'ready',name:'Medio comercial listo para usar',amount:1000,unit:'mL/L',note:'Medio basal; suplementos de la línea por separado.'}];
}
export function mediumCalculation(m,d){
 const volume=number(d.volume,'Volumen final'),recipe=classicalMedia[m.id];
 if(!['classical','commercial'].includes(d.mode))throw new Error('Selecciona la preparación.');
 if(d.mode==='classical'&&!recipe)throw new Error('Esta entrada es una guía; no tiene receta clásica.');
 const components=d.mode==='classical'?recipe.components:commercialComponents(m,d);
 const rows=[...components,...(d.extras||[])].map(c=>{
  const rate=number(d.amounts?.[c.id]??c.amount,c.name,true);if(!['g/L','mL/L'].includes(c.unit))throw new Error('Unidad no admitida para '+c.name);
  return {...copy(c),base:c.amount,rate,quantity:rate*volume/1000,resultUnit:c.unit==='g/L'?'g':'mL',modified:rate!==Number(c.amount)};
 });
 const liquid=rows.filter(r=>r.resultUnit==='mL').reduce((n,r)=>n+r.quantity,0);
 if(liquid>volume+1e-8)throw new Error('Los líquidos y stocks superan el volumen final.');
 return {id:m.id,name:m.name,mode:d.mode,variant:d.mode==='classical'?recipe.variant:m.format,volume,rows,liquid,water:'Agua purificada c.s.p. '+volume+' mL finales (incluyendo los stocks y suplementos)',ph:d.ph||(d.mode==='classical'?recipe.ph:'Según producto'),lot:d.lot||'',notes:d.notes||'',source:d.mode==='classical'?recipe.source:m.source,additionalSources:d.mode==='classical'?recipe.additionalSources||[]:[],steps:d.mode==='classical'?recipe.steps:[m.preparation],recipeNotes:d.mode==='classical'?recipe.notes:'',stocks:copy(d.stocks||{}),modified:rows.some(r=>r.modified)||(d.extras||[]).length>0};
}
export function stockContext(m,d,componentId){
 const result=mediumCalculation(m,d),r=result.rows.find(r=>r.id===componentId);
 if(!r?.stock||r.quantity<=0)throw new Error('Esta fila no requiere una solución stock.');
 return {mediumId:m.id,mediumName:m.name,componentId:r.id,name:r.name,required:r.quantity,volume:d.stocks?.[r.id]?.volume>=r.quantity?d.stocks[r.id].volume:r.quantity,components:copy(r.stock.components),instructions:copy(r.stock.instructions),source:r.stock.source,notes:d.stocks?.[r.id]?.notes||''};
}
export function stockCalculation(s){
 const volume=number(s.volume,'Volumen del stock'),required=number(s.required,'Volumen que necesita el medio');
 if(volume+1e-8<required)throw new Error('Prepara al menos '+required+' mL del stock que necesita el medio.');
 return {...copy(s),volume,rows:s.components.map(c=>({...c,quantity:number(c.amount,c.name)*volume/1000,resultUnit:'g'})),remaining:volume-required};
}
export function completeMedium(m,d,{id,date,version}={}){
 const result=mediumCalculation(m,d);return {id:id||crypto.randomUUID(),kind:'medium',name:m.name,date:date||new Date().toISOString(),finishedAt:new Date().toISOString(),complete:true,appVersion:version||'2.6.0',notes:d.notes||'',result:(d.mode==='classical'?'Preparación clásica':'Preparación comercial')+' · '+result.volume+' mL',mediumResult:result};
}
export function mediaReturnRoute(bench){const context=bench.mediaSolution,active=bench.mediaActive;return context&&context.mediumId===active?'media/'+active:'media';}
const round=n=>Number(Number(n).toPrecision(10));
const textCell=s=>String(s??'').replace(/\|/g,' / ').replace(/\r?\n/g,'; ');
export function mediumText(r){
 const lines=['# '+r.name,'',r.mode==='classical'?'Preparación clásica':'Preparación comercial',r.variant,'Volumen final: '+r.volume+' mL','pH: '+r.ph,'Lote / etiqueta: '+(r.lot||'Sin indicar'),'Fuente: '+r.source,...r.additionalSources,'','| Componente | Referencia | Configurado | Cantidad calculada | Detalle |','| --- | --- | --- | --- | --- |',...r.rows.map(c=>'| '+[c.name,c.base+' '+c.unit,c.rate+' '+c.unit,round(c.quantity)+' '+c.resultUnit,c.note||c.stock?.components.map(s=>s.name+': '+s.amount+' g/L en stock').join('; ')||''].map(textCell).join(' | ')+' |'),'','Agua: '+r.water,'',r.recipeNotes,'','## Preparación',...r.steps.map((s,i)=>(i+1)+'. '+s),'','## Mis notas',r.notes||'Sin notas'];
 for(const stock of Object.values(r.stocks)){lines.push('','## Stock preparado: '+stock.name,'Preparado: '+stock.volume+' mL; al medio: '+stock.required+' mL',...stock.rows.map(c=>'- '+c.name+': '+round(c.quantity)+' g'),...stock.instructions.map((s,i)=>(i+1)+'. '+s),stock.notes||'');}
 return lines.join('\n');
}
const csvCell=s=>{let v=String(s??'');if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';};
export function mediumCSV(r){return '\ufeff'+[['Medio','Preparación','Volumen final (mL)','Componente','Referencia','Configurado','Unidad por litro','Cantidad calculada','Unidad','Detalle'],...r.rows.map(c=>[r.name,r.mode,r.volume,c.name,c.base,c.rate,c.unit,round(c.quantity),c.resultUnit,c.note||'']),[r.name,r.mode,r.volume,'Agua','','','','','c.s.p.',r.water],['Notas',r.notes],['Lote',r.lot],['pH',r.ph],['Fuente',r.source],...r.additionalSources.map(s=>['Fuente adicional',s])].map(row=>row.map(csvCell).join(',')).join('\r\n');}
export function mediumWorkbook(r,X=globalThis.XLSX){
 if(!X?.utils)throw new Error('Excel no está disponible; recarga la app.');const b=X.utils.book_new(),table=[['Componente','Referencia / L','Configurado / L','Unidad / L','Cantidad calculada','Unidad','Detalle'],...r.rows.map(c=>[c.name,c.base,c.rate,c.unit,c.quantity,c.resultUnit,c.note||''])],s=X.utils.aoa_to_sheet(table);s['!cols']=[{wch:45},{wch:20},{wch:20},{wch:14},{wch:23},{wch:10},{wch:65}];s['!autofilter']={ref:s['!ref']};
 const meta=X.utils.aoa_to_sheet([['Parámetro','Valor'],['Medio',r.name],['Preparación',r.mode==='classical'?'Clásica':'Comercial'],['Variante',r.variant],['Volumen final (mL)',r.volume],['pH',r.ph],['Lote',r.lot],['Agua',r.water],['Notas',r.notes],['Fuente',r.source],...r.additionalSources.map(s=>['Fuente adicional',s]),['Nota de formulación',r.recipeNotes],...r.steps.map((s,i)=>['Paso '+(i+1),s])]);meta['!cols']=[{wch:27},{wch:100}];
 r.rows.forEach((c,i)=>s['E'+(i+2)]={t:'n',f:`C${i+2}*'Preparación'!$B$5/1000`,v:c.quantity,z:'0.000000'});X.utils.book_append_sheet(b,s,'Componentes');X.utils.book_append_sheet(b,meta,'Preparación');
 const stocks=[['Solución','Compuesto','Stock (g/L)','Volumen preparado (mL)','Cantidad (g)','Al medio (mL)','Fuente'],...r.rows.filter(c=>c.stock).flatMap(c=>c.stock.components.map(s=>[c.name,s.name,s.amount,r.stocks[c.id]?.volume??c.quantity,s.amount*(r.stocks[c.id]?.volume??c.quantity)/1000,c.quantity,c.stock.source]))];if(stocks.length>1)X.utils.book_append_sheet(b,X.utils.aoa_to_sheet(stocks),'Stocks');b.Workbook={CalcPr:{calcMode:'auto'}};return X.write(b,{bookType:'xlsx',type:'array'});
}
