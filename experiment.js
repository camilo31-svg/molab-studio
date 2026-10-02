import {masterMix} from './calc.js?v=2.5.1';
import {digestText} from './restriction-calc.js?v=2.5.1';

export const APP_VERSION='2.5.1';
export function reagentAmounts(rows=[]){
 const seen=new Set();
 function amount(r){
  if(seen.has(r.key))throw new Error('Dependencia circular de reactivos.');
  seen.add(r.key);
  let n=Number(r.amount);
  if(r.relativeTo){const base=rows.find(x=>x.key===r.relativeTo);if(!base)throw new Error('Falta la medida base de '+r.name);n=amount(base)*Number(r.factor);}
  seen.delete(r.key);
  if(!Number.isFinite(n)||n<0)throw new Error('Cantidad inválida: '+r.name);
  return n;
 }
 return rows.map(r=>({...r,amount:amount(r)}));
}
export function resolveReagentSteps(steps,rows=[]){
 const values=new Map(reagentAmounts(rows).map(r=>[r.key,r.amount]));
 const substitute=text=>String(text||'').replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g,(_,key)=>{if(!values.has(key))throw new Error('Falta el reactivo '+key);return Number(values.get(key).toFixed(4)).toLocaleString('es-ES',{maximumFractionDigits:4});});
 return steps.map(s=>({...s,text:substitute(s.text),conditions:substitute(s.conditions)}));
}
const clean=value=>String(value??'').replace(/\r/g,'');
const tableCell=value=>clean(value).replace(/\|/g,' / ').replace(/\n/g,'; ');
const table=(heads,rows)=>['| '+heads.join(' | ')+' |','| '+heads.map(()=> '---').join(' | ')+' |',...rows.map(row=>'| '+row.map(tableCell).join(' | ')+' |')].join('\n');
export function experimentReport(run){
 const c=run.config||{},lines=[`# ${clean(run.name||run.title||'Experimento Molab')}`,'',`Molab Studio ${run.appVersion||'versión no registrada'} · ID: ${run.id||'—'}`,`Informe generado con v${APP_VERSION}`,`Estado: ${run.complete?'Finalizado':'En curso / instantánea'}`,`Inicio: ${run.date||'—'}`,`Fin: ${run.finishedAt||'—'}`,`Protocolo: ${run.protocolTitle||run.protocolId||'—'}`,`Versión del documento: ${run.version||'—'}`,`Fabricante / autores: ${run.manufacturerName||'—'}`,`Material de partida: ${(run.materials||[]).join(', ')||'No especificado'}`,`Límite de partida: ${run.inputLimit||'No registrado'}`,`Fuente: ${run.source||'—'}`,`Configuración: ${c.edited?'Modificada por el usuario':'Valores iniciales'}`,''];
 if(run.kind==='calculation'){lines.push(clean(run.result));return lines.join('\n');}
 if(run.restrictionResult)lines.push('## Digestión calculada',digestText(c.restriction,run.restrictionResult),'');
 lines.push(`Muestras: ${c.reactions}`,`Controles: ${c.components?.length?c.controls:'No aplica'}`,`Exceso de mezcla: ${c.components?.length?c.excess+' %':'No aplica'}`,'');
 if(c.components?.length){lines.push('## Mezcla de reacción',`Volumen final: ${c.volume} µL por reacción`,'');try{const mix=masterMix(c,c.components);lines.push(table(['Reactivo','Por reacción (µL)','Total (µL)','Destino'],mix.rows.map(r=>[r.name,r.per,r.total,r.template?'Añadir por tubo':'Mezcla común'])));}catch(err){lines.push('Cálculo no disponible: '+err.message);}lines.push('');}
 if(c.reagents?.length){lines.push('## Reactivos por etapa',`Totales para ${c.reactions} muestras independientes. Cada fila se utiliza en su etapa; no es una mezcla común.`,'',table(['Reactivo / medida','Por muestra','Total','Unidad','Detalle'],reagentAmounts(c.reagents).map(r=>[r.name,r.amount,r.measurement?'Medir cada muestra':r.amount*c.reactions,r.unit,r.note||''])),'');}
 if(c.thermal?.length){lines.push('## Programa térmico',`Ciclos del bloque repetido: ${c.cycles}`,'',table(['Fase','Temperatura (°C)','Duración (s)','Repetición'],c.thermal.map(t=>[t.label,t.temp,t.seconds,t.repeat?'Cada ciclo':'Una vez'])),'');}
 if(run.protocolNotes)lines.push('## Notas del protocolo',clean(run.protocolNotes),'');
 if(run.quantityChanges?.length){lines.push('## Cambios durante la ejecución','La tabla de reactivos muestra la última configuración. Las instrucciones de pasos anteriores se conservaron al modificar cantidades.','');for(const event of run.quantityChanges){lines.push(`En paso ${event.step+1} · ${event.date}`,...event.changes.map(r=>`- ${r.name}: ${r.from} → ${r.to} ${r.unit}`),'');}}
 lines.push('## Pasos de la ejecución','Los horarios son marcas de avance de la guía. Los tiempos y temperaturas planificados no prueban las condiciones reales del equipo.','');
 for(const [i,s] of (run.steps||[]).entries()){
  const ev=(run.events||[]).filter(x=>x.step===i).at(-1),status=ev?'Avance registrado':run.complete?'Sin marca de avance':i===run.index?'Paso actual':'Sin avance registrado';
  lines.push(`### ${i+1}. ${clean(s.title)}`,clean(s.text),`Condiciones planificadas: ${clean(s.conditions)||'No especificadas'}`,`Duración planificada: ${s.seconds||0} s`,`${status}${ev?' · '+ev.date:''}`);
  if(ev?.skippedTimer)lines.push(`Avanzado con ${Math.ceil(ev.remaining)} s pendientes en el cronómetro.`);
  if(s.external)lines.push(`Herramienta externa: ${s.external.url}`);
  if(run.stepNotes?.[i])lines.push(`Observaciones: ${clean(run.stepNotes[i])}`);
  lines.push('');
 }
 if(run.notes)lines.push('## Observaciones generales',clean(run.notes),'');
 return lines.join('\n');
}
export function experimentCSV(run){
 const rows=[['Sección','Nombre','Valor por muestra','Total','Unidad','Detalle']],c=run.config||{};
 rows.push(['Experimento',run.name||run.title,run.id,'','',''],['Versión app',run.appVersion||'No registrada','','','',''],['Estado',run.complete?'Finalizado':'En curso','','','',''],['Inicio',run.date,'','','',''],['Fin',run.finishedAt,'','','',''],['Documento',run.protocolTitle||run.protocolId,run.version,'','',run.source],['Fabricante / autores',run.manufacturerName,'','','',''],['Material',(run.materials||[]).join('; '),'','','',''],['Límite',run.inputLimit,'','','',''],['Muestras','Cantidad',c.reactions,'','',''],['Controles','Cantidad',c.components?.length?c.controls:'No aplica','','',''],['Exceso','Mezcla común',c.components?.length?c.excess:'No aplica','','%',''],['Volumen','Reacción',c.components?.length?c.volume:'No aplica','','µL',''],['Configuración',c.edited?'Modificada':'Inicial','','','',''],['Notas del protocolo',run.protocolNotes,'','','',''],['Observaciones generales',run.notes,'','','','']);
 if(c.components?.length){const m=masterMix(c,c.components);for(const r of m.rows)rows.push(['Mezcla',r.name,r.per,r.total,'µL',r.template?'Por tubo':'Mezcla común']);}
 for(const r of reagentAmounts(c.reagents))rows.push(['Etapa',r.name,r.amount,r.measurement?'Medir':r.amount*c.reactions,r.unit,r.note]);
 for(const t of c.thermal||[])rows.push(['Programa',t.label,t.temp,t.seconds,'°C / s',t.repeat?c.cycles+' ciclos':'Única']);
 for(const [i,s] of (run.steps||[]).entries())rows.push(['Paso '+(i+1),s.title,s.seconds,'','s',s.text+' | '+s.conditions+' | '+(run.stepNotes?.[i]||'')]);
 for(const ev of run.events||[])rows.push(['Avance',ev.title,ev.remaining,'','s pendientes',ev.date]);
 for(const event of run.quantityChanges||[])for(const r of event.changes)rows.push(['Cambio en paso '+(event.step+1),r.name,r.from,r.to,r.unit,event.date]);
 if(run.kind==='calculation')rows.push(['Cálculo',run.result,'','','','']);
 if(run.restrictionResult){const r=run.restrictionResult;rows.push(['Digestión','Buffer',r.bufferVolume,'','µL',r.buffer.name+' · '+r.buffer.color],['Digestión','Volumen final',r.volume,'','µL',r.mode],['Digestión','DNA objetivo',r.target,'','ng',r.mode==='pool'?'Total del pool':'Por muestra']);for(const s of r.rows){rows.push(['Muestra '+s.name,'Concentración',s.concentration,'','ng/µL',s.error],['Muestra '+s.name,'DNA',s.dna,'','µL',s.mass+' ng'],['Muestra '+s.name,'Agua',s.water,'','µL',r.mode==='pool'?'Solo en el tubo del pool':'Por tubo']);}for(const en of r.enzymes)rows.push(['Digestión','Enzima '+en.name,en.volume,'','µL',en.stock===null?'Stock no indicado':en.stock+' U/µL']);if(r.bsaVolume)rows.push(['Digestión','BSA acetilada',r.bsaVolume,'','µL','Stock 10 µg/µL']);if(r.mode==='pool')rows.push(['Pool','DNA',r.poolDna,'','µL',''],['Pool','Agua',r.poolWater,'','µL','']);}
 return '\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
}
