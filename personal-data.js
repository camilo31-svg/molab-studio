export const personalFields=['favorites','compoundFavorites','mediaFavorites','notes','configs','customCompounds','customProtocols','runs','activeRun','bench'];
export const blankPersonal=()=>({favorites:[],compoundFavorites:[],mediaFavorites:[],notes:{},configs:{},customCompounds:[],customProtocols:[],runs:[],activeRun:null,bench:{}});
export const copy=x=>JSON.parse(JSON.stringify(x));
export function personalData(data){return Object.fromEntries(personalFields.map(k=>[k,copy(data[k]??blankPersonal()[k])]));}
export function validatePersonal(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Datos personales no reconocidos.');
 const inspect=(x,depth=0)=>{if(depth>40)throw new Error('Datos demasiado anidados.');if(x&&typeof x==='object')for(const [k,v] of Object.entries(x)){if(['__proto__','constructor','prototype'].includes(k))throw new Error('Campo no permitido.');inspect(v,depth+1);}};inspect(data);
 for(const k of ['favorites','compoundFavorites','mediaFavorites','customCompounds','customProtocols','runs'])if(!Array.isArray(data[k]))throw new Error('Copia incompleta: '+k);
 for(const k of ['favorites','compoundFavorites','mediaFavorites'])if(data[k].some(id=>typeof id!=='string'))throw new Error('Favoritos inválidos.');
 for(const k of ['notes','configs','bench'])if(!data[k]||Array.isArray(data[k])||typeof data[k]!=='object')throw new Error('Campo incorrecto: '+k);
 for(const note of Object.values(data.notes))if(typeof note!=='string')throw new Error('Notas inválidas.');
 for(const p of data.customProtocols){if(!p.id||!p.title||!p.category||!Array.isArray(p.steps)||!p.steps.length||!Array.isArray(p.tags)||!Array.isArray(p.tips))throw new Error('Protocolo personal inválido.');for(const s of p.steps)if(!s.title||!s.text||!Number.isFinite(s.seconds)||s.seconds<0)throw new Error('Paso inválido.');}
 for(const c of data.customCompounds)if(!c.id||!c.name||!c.formula||!Number.isFinite(c.mw)||c.mw<=0)throw new Error('Compuesto inválido.');
 for(const c of Object.values(data.configs))if(!c||!Array.isArray(c.steps)||!Array.isArray(c.components)||!Array.isArray(c.thermal))throw new Error('Configuración inválida.');
 for(const r of data.runs)if(!r.id||typeof r.id!=='string')throw new Error('Registro sin identificador.');
 if(data.activeRun&&(!data.activeRun.id||!Array.isArray(data.activeRun.steps)||!data.activeRun.timer||!Number.isInteger(data.activeRun.index)||data.activeRun.index<0||data.activeRun.index>=data.activeRun.steps.length))throw new Error('Experimento activo inválido.');
 return personalData(data);
}
