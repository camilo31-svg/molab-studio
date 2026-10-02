// Families are assigned after reviewing methods, never inferred from shared authors alone.
const commercial=new Set(['neb','thermo','biorad','promega','qiagen','sigma','zymo','mn','takara','himedia','phytotech']);
const assignments={
 'gb-ecoli-2025':['goldenbraid','GoldenBraid',['GoldenBraid']],
 'gb-2021':['goldenbraid','GoldenBraid',['GoldenBraid']],
 'gg-bsai':['golden-gate-neb','Golden Gate · NEBridge',['Golden Gate']],
 'gg-bsmbi':['golden-gate-neb','Golden Gate · NEBridge',['Golden Gate']],
 'start-stop':['start-stop','Start-Stop Assembly',['Start-Stop assembly']],
 'greengate-2013':['greengate','GreenGate',['GreenGate']],
 'loop-bsai-2019':['loop','Loop / uLoop',['Loop assembly']],
 'uloop-sapi-2020':['loop','Loop / uLoop',['Loop assembly']],
 q5:['q5','Q5® High-Fidelity PCR',['PCR optimización']],
 dreamtaq:['dreamtaq','DreamTaq™ PCR Master Mix',['PCR optimización']],
 gotaq:['gotaq','GoTaq® qPCR Master Mix',['MIQE / PCR cuantitativa']],
 hifi:['hifi','NEBuilder® HiFi DNA Assembly',['Gibson assembly']],
 western:['western','Western blot · Criterion TGX',['Western blot']],
 quickdna:['quickdna','Quick-DNA™ Miniprep Plus',['DNA / plásmidos']]
};
export function hasRecipe(p){return p.status!=='reference'&&Array.isArray(p.steps)&&p.steps.length>0&&p.steps.every(s=>s.title&&s.text);}
const norm=s=>String(s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function citationKey(r){return r.doi?'doi:'+r.doi.toLowerCase():r.pmid?'pmid:'+r.pmid:norm(r.title)||r.source;}
function uniqueCitations(records){const result=[];for(const r of records){const existing=result.find(x=>citationKey(x)===citationKey(r)||norm(x.title)===norm(r.title));if(existing){if(r.role==='primary')Object.assign(existing,r);}else result.push({...r});}return result;}
export function curateProtocols(raw,literature=[]){
 const seen=new Set();
 return raw.filter(hasRecipe).filter(p=>{if(seen.has(p.id))return false;seen.add(p.id);return true;}).map(p=>{
  const a=assignments[p.id];
  const origin=p.origin||(commercial.has(p.manufacturer)?'commercial':p.manufacturer==='personal'?'personal':['pubmed','goldenbraid'].includes(p.manufacturer)?'paper':'academic');
  const family=p.family||a?.[0]||p.id;
  const primary={title:p.title,authors:p.version,doi:p.doi,source:p.source,role:'primary',sourceType:p.sourceType};
  const matches=literature.filter(r=>r.doi&&p.doi&&r.doi.toLowerCase()===p.doi.toLowerCase()||r.source===p.source||a?.[2].includes(r.method));
  const citations=uniqueCitations([primary,...(p.citations||[]),...matches.map(r=>({...r,role:r.doi&&r.doi===p.doi||r.source===p.source?'primary':'related'})),...(p.modifications||[]).map(m=>({title:m.authors+' · modificación del método',authors:m.authors,source:m.url,doi:m.url?.includes('doi.org/')?m.url.split('doi.org/')[1]:undefined,role:'modification'}))]);
  return {...p,origin,family,familyTitle:p.familyTitle||a?.[1]||p.title,citations};
 });
}
export function matchesOrigin(p,origin='all'){return origin==='all'||p.origin===origin;}
export function selectVersions(versions,{material='',manufacturer=''}={}){return versions.filter(p=>(!material||(p.materials||[]).includes(material))&&(!manufacturer||p.manufacturer===manufacturer));}
export function buildFamilies(protocols,origin='all'){
 const families=new Map();
 for(const p of protocols.filter(hasRecipe).filter(p=>matchesOrigin(p,origin))){const id=p.family||p.id;if(!families.has(id))families.set(id,{id,title:p.familyTitle||p.title,category:p.category,versions:[],tags:[]});const f=families.get(id);f.versions.push(p);f.tags=[...new Set([...f.tags,...(p.tags||[])])];}
 return [...families.values()];
}
export const legacyAliases={'gb-domestication':'gb-2021','gb-multipartite':'gb-2021','gb-binary':'gb-2021',greengate:'greengate-2013',greengate2:'greengate-2013',loop:'loop-bsai-2019',uloop:'uloop-sapi-2020','gg-sapi':'start-stop'};
