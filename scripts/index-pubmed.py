import sys,json,importlib.util,time,re,argparse
from pathlib import Path
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Index protocol-associated PubMed metadata through the installed NCBI Entrez skill.')
parser.add_argument('--skill-script',type=Path,required=True)
args=parser.parse_args();skill=args.skill_script.resolve()
spec=importlib.util.spec_from_file_location('entrez',skill);entrez=importlib.util.module_from_spec(spec);spec.loader.exec_module(entrez)
queries=json.loads((root/'scripts/literature-queries.json').read_text(encoding='utf-8'))
records={};searches=[]
for cat,method,q in queries:
 term=re.sub(r'TITLE_ABS:("[^"]+"|[\w-]+)',r'\1[Title/Abstract]',q)+' AND ("1900/01/01"[Date - Publication] : "2026/10/01"[Date - Publication])'
 out=entrez.execute({'endpoint':'esearch','params':{'db':'pubmed','term':term,'retmode':'json','retmax':20,'sort':'relevance'},'max_items':20})
 ids=out.get('records',[])
 summary=entrez.execute({'endpoint':'esummary','params':{'db':'pubmed','id':','.join(ids),'retmode':'json'},'record_path':'result','max_items':100,'max_depth':10}) if ids else {}
 new=0
 for uid in ids:
  r=summary.get('summary',{}).get(uid,{})
  title=r.get('title','')
  if not title or re.search(r'virus|pathogen|SARS|HIV|influenza|tuberculosis|anthrax|coronavirus|retracted',title,re.I):continue
  if uid in records:
   if method not in records[uid]['tags']:records[uid]['tags'].append(method)
   continue
  identifiers=r.get('articleids',[]);doi=next((x.get('value','') for x in identifiers if isinstance(x,dict) and x.get('idtype')=='doi'),'');pmc=next((x.get('value','') for x in identifiers if isinstance(x,dict) and x.get('idtype')=='pmc'),'')
  records[uid]={'id':'lit-pubmed-'+uid,'category':cat,'method':method,'title':title,'authors':', '.join(a.get('name','') for a in r.get('authors',[]) if isinstance(a,dict)),'journal':r.get('source',''),'year':r.get('pubdate',''),'doi':doi,'pmid':uid,'pmcid':pmc,'source':r.get('canonical_url','https://pubmed.ncbi.nlm.nih.gov/'+uid+'/'),'openAccess':False,'tags':[cat,method],'checked':'2026-10-01','review':'metadata-only'};new+=1
 searches.append({'category':cat,'method':method,'query':term,'retrieved':len(ids),'newRecords':new,'status':'ok' if out.get('ok') and summary.get('ok') else 'error','checked_sources':out.get('checked_sources',[])+summary.get('checked_sources',[]),'sources':out.get('sources',[])+summary.get('sources',[])})
 print(method+': '+str(new)+' nuevos',flush=True);time.sleep(.4)
seen=set();excluded=[];selected=[]
for r in records.values():
 reason=''
 if r['method']=='Loop assembly' and not re.search(r'DNA|circuit|genetic|genom|uLoop',r['title'],re.I):reason='Loop coincidence outside DNA assembly'
 if r['category']=='Cloning' and re.search(r'molybdat|chlorid|oxido|pyridinium',r['title'],re.I):reason='Inorganic chemistry MoClO coincidence'
 unique=(r['doi'] or r['pmid']).lower()
 if unique in seen:reason='Duplicate DOI'
 if reason:excluded.append({'id':r['id'],'title':r['title'],'reason':reason});continue
 seen.add(unique);selected.append(r)
report={'generatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'provider':'PubMed · NCBI Entrez','scope':'31 búsquedas dirigidas, hasta 20 resultados por consulta, ordenados por relevancia y deduplicados por PMID. Metadatos bibliográficos; no equivalen a pasos ejecutables ni revisión del texto completo.','searches':searches,'records':selected,'excludedRecords':excluded}
app=root
(app/'literature-index.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
(app/'literature-data.js').write_text('// PubMed metadata, not executable protocols.\nexport const literature='+json.dumps(report['records'],ensure_ascii=False)+';\nexport const literatureSearches='+json.dumps([{k:v for k,v in s.items() if k not in ['sources','checked_sources']} for s in searches],ensure_ascii=False)+';\n',encoding='utf-8')
print('TOTAL '+str(len(records)),flush=True)
