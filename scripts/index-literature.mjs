import {writeFile} from 'node:fs/promises';
const queries=[
 ['Cloning','GoldenBraid','TITLE_ABS:GoldenBraid'],['Cloning','Golden Gate','TITLE_ABS:"Golden Gate" AND TITLE_ABS:cloning'],
 ['Cloning','MoClo','TITLE_ABS:MoClo'],['Cloning','GreenGate','TITLE_ABS:GreenGate'],['Cloning','Loop assembly','TITLE_ABS:"Loop assembly"'],
 ['Cloning','Start-Stop assembly','TITLE_ABS:"Start-Stop assembly"'],['Cloning','Yeast toolkit','TITLE_ABS:"yeast toolkit"'],
 ['Cloning','Gibson assembly','TITLE_ABS:"Gibson assembly" AND TITLE_ABS:protocol'],['Cloning','SLIC / LIC','TITLE_ABS:"ligation independent cloning"'],
 ['Cloning','SLiCE / CPEC','TITLE_ABS:"SLiCE" AND TITLE_ABS:cloning OR TITLE_ABS:"circular polymerase extension cloning"'],
 ['Cloning','Gateway / TOPO','TITLE_ABS:"Gateway cloning" OR TITLE_ABS:"TOPO cloning"'],['Cloning','Mutagénesis','TITLE_ABS:"site-directed mutagenesis" AND TITLE_ABS:protocol'],
 ['PCR','PCR optimización','TITLE_ABS:"polymerase chain reaction" AND TITLE_ABS:protocol AND TITLE_ABS:optimization'],
 ['qPCR','MIQE / PCR cuantitativa','TITLE_ABS:MIQE OR (TITLE_ABS:"quantitative PCR" AND TITLE_ABS:protocol)'],
 ['RT-qPCR','Retrotranscripción','TITLE_ABS:"reverse transcription" AND TITLE_ABS:protocol'],
 ['PCR digital','ddPCR','TITLE_ABS:"droplet digital PCR" AND TITLE_ABS:protocol'],
 ['Extracción DNA','DNA vegetal / CTAB','TITLE_ABS:"DNA extraction" AND (TITLE_ABS:CTAB OR TITLE_ABS:plant) AND TITLE_ABS:protocol'],
 ['Extracción DNA','DNA / plásmidos','TITLE_ABS:"DNA isolation" AND TITLE_ABS:protocol OR TITLE_ABS:"plasmid purification" AND TITLE_ABS:protocol'],
 ['Extracción RNA','RNA vegetal / animal','TITLE_ABS:"RNA extraction" AND TITLE_ABS:protocol'],
 ['Western blot','Western blot','TITLE_ABS:"western blot" AND TITLE_ABS:protocol'],
 ['Proteínas','Purificación / electroforesis','(TITLE_ABS:"protein purification" OR TITLE_ABS:"SDS-PAGE") AND TITLE_ABS:protocol'],
 ['Cultivo celular','Cultivo / criopreservación','(TITLE_ABS:"cell culture" OR TITLE_ABS:cryopreservation) AND TITLE_ABS:protocol'],
 ['Cultivo in vitro','Micropropagación','TITLE_ABS:micropropagation AND TITLE_ABS:protocol'],
 ['Cultivo in vitro','Embriogénesis / regeneración','(TITLE_ABS:"somatic embryogenesis" OR TITLE_ABS:"plant regeneration") AND TITLE_ABS:protocol'],
 ['Micología','Levadura / hongos','(TITLE_ABS:yeast OR TITLE_ABS:fungal) AND TITLE_ABS:culture AND TITLE_ABS:protocol'],
 ['Microbiología','Medios y cultivo','TITLE_ABS:"culture medium" AND TITLE_ABS:protocol NOT TITLE_ABS:virus NOT TITLE_ABS:pathogen'],
 ['Secuenciación','RNA-seq / bibliotecas','(TITLE_ABS:"RNA-seq" OR TITLE_ABS:"library preparation") AND TITLE_ABS:protocol'],
 ['Epigenética','ChIP / ATAC / CUT&Tag','(TITLE_ABS:"ChIP-seq" OR TITLE_ABS:"ATAC-seq" OR TITLE_ABS:"CUT&Tag") AND TITLE_ABS:protocol'],
 ['Microscopía','Inmunofluorescencia','TITLE_ABS:immunofluorescence AND TITLE_ABS:protocol'],
 ['Citometría','Flow cytometry','TITLE_ABS:"flow cytometry" AND TITLE_ABS:protocol'],
 ['Bioquímica','ELISA / actividad enzimática','(TITLE_ABS:ELISA OR TITLE_ABS:"enzyme assay") AND TITLE_ABS:protocol']
];
const records=new Map(), searches=[];
for(const [category,method,query] of queries){
 const url=new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');url.search=new URLSearchParams({query:query+' AND FIRST_PDATE:[1900-01-01 TO 2026-10-01]',format:'json',pageSize:'25',resultType:'lite',sort:'RELEVANCE'});
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();let accepted=0;
  for(const r of data.resultList?.result||[]){
   if(!r.title||r.isRetracted==='Y'||/virus|pathogen|SARS|HIV|influenza|tuberculosis|anthrax|coronavirus/i.test(r.title))continue;
   const key=r.doi?.toLowerCase()||`${r.source}-${r.id}`;const existing=records.get(key);if(existing){if(!existing.tags.includes(method))existing.tags.push(method);continue;}
   records.set(key,{id:`lit-${r.source.toLowerCase()}-${r.id}`,category,method,title:r.title,authors:r.authorString||'',journal:r.journalTitle||'',year:r.pubYear||'',doi:r.doi||'',pmid:r.source==='MED'?r.id:'',pmcid:r.pmcid||'',source:r.source==='MED'?`https://pubmed.ncbi.nlm.nih.gov/${r.id}/`:r.doi?`https://doi.org/${r.doi}`:`https://europepmc.org/article/${r.source}/${r.id}`,openAccess:r.isOpenAccess==='Y',tags:[category,method],checked:'2026-10-01',review:'metadata-only'});accepted++;
  }
  searches.push({category,method,query,url:url.href,totalHits:data.hitCount,retrieved:data.resultList?.result?.length||0,newRecords:accepted,status:'ok'});console.log(method+': '+accepted+' nuevos');
 }catch(err){searches.push({category,method,query,url:url.href,status:'error',error:err.message});console.log(method+': '+err.message);}
}
const report={generatedAt:new Date().toISOString(),provider:'Europe PMC · metadatos bibliográficos',scope:'Búsquedas dirigidas, 25 resultados por consulta, deduplicadas por DOI/identificador. La coincidencia en una consulta no verifica pasos ni aplicabilidad. Sin resúmenes completos ni texto completo republicado.',searches,records:[...records.values()]};
await writeFile(new URL('../literature-index.json',import.meta.url),JSON.stringify(report,null,2));
await writeFile(new URL('../literature-data.js',import.meta.url),'// Generated by scripts/index-literature.mjs; metadata, not executable protocols.\nexport const literature='+JSON.stringify(report.records,null,1)+';\nexport const literatureSearches='+JSON.stringify(searches,null,1)+';\n');
console.log('TOTAL '+records.size);
