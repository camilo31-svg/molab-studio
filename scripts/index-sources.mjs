import {sources,protocols,media} from '../data.js';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),cache=path.join(root,'.index-work');
await mkdir(cache,{recursive:true});
const args=process.argv.slice(2),discover=args.includes('--discover');
const limitArg=args.indexOf('--limit'),limit=limitArg>=0?Number(args[limitArg+1]):60;
if(!Number.isInteger(limit)||limit<1||limit>1000)throw new Error('Limit must be an integer from 1 to 1000');
const domains=['neb.com','thermofisher.com','bio-rad.com','bio-rad-antibodies.com','promega.com','qiagen.com','sigmaaldrich.com','zymoresearch.com','mn-net.com','agilent.com','takarabio.com','himedialabs.com','atcc.org','duchefa-biochemie.com'];
const allowed=url=>{try{const u=new URL(url);return u.protocol==='https:'&&domains.some(d=>u.hostname===d||u.hostname.endsWith('.'+d));}catch{return false;}};
const robotsCache=new Map(),agent='MolabCatalog/1.0 (research metadata index; no automatic protocol execution)';
async function getRobots(url){const origin=new URL(url).origin;if(robotsCache.has(origin))return robotsCache.get(origin);let rules=[];try{const response=await fetch(origin+'/robots.txt',{headers:{'User-Agent':agent},signal:AbortSignal.timeout(12000),redirect:'manual'});if(response.ok){const body=await response.text();let active=false;for(const raw of body.split(/\r?\n/)){const line=raw.split('#')[0].trim();const colon=line.indexOf(':');if(colon<0)continue;const k=line.slice(0,colon).toLowerCase(),v=line.slice(colon+1).trim();if(k==='user-agent')active=v==='*'||v.toLowerCase().includes('molabcatalog');else if(active&&['allow','disallow'].includes(k)&&v)rules.push({allow:k==='allow',path:v});}}else if(response.status===401||response.status===403)rules=[{allow:false,path:'/'}];}catch{rules=[{allow:false,path:'/'}];}robotsCache.set(origin,rules);return rules;}
function permitted(url,rules){const p=new URL(url).pathname+new URL(url).search;const hits=rules.filter(r=>{const pattern=r.path.replace(/[.+?^{}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\$$/,'$');return new RegExp('^'+pattern).test(p);}).sort((a,b)=>b.path.length-a.path.length||Number(b.allow)-Number(a.allow));return hits[0]?.allow!==false;}
async function get(url){let current=url;for(let i=0;i<6;i++){if(!allowed(current))throw new Error('Redirect outside permitted official domains');if(!permitted(current,await getRobots(current)))throw new Error('robots.txt does not permit retrieval');const response=await fetch(current,{headers:{'User-Agent':agent,'Accept':'application/pdf,text/html;q=0.9,*/*;q=0.1'},signal:AbortSignal.timeout(20000),redirect:'manual'});if(response.status>=300&&response.status<400){const loc=response.headers.get('location');if(!loc)throw new Error('Redirect without location');current=new URL(loc,current).href;continue;}if(!response.ok)throw new Error('HTTP '+response.status);const len=Number(response.headers.get('content-length'));if(len>15000000)throw new Error('Document exceeds 15 MB');const chunks=[];let total=0;for await(const chunk of response.body){total+=chunk.length;if(total>15000000)throw new Error('Document exceeds 15 MB');chunks.push(Buffer.from(chunk));}return {url:current,response,buffer:Buffer.concat(chunks)};}throw new Error('Too many redirects');}
const queue=[],seen=new Set();
function add(item){if(!allowed(item.url)||seen.has(item.url))return;seen.add(item.url);queue.push(item);}
protocols.forEach(p=>add({id:p.id,manufacturer:p.manufacturer,title:p.title,url:p.source,expected:p.sourceType,category:p.category}));
media.forEach(m=>add({id:'media:'+m.id,manufacturer:m.manufacturer,title:m.name,url:m.source,expected:/\.pdf(\?|$)/i.test(m.source)?'PDF':'Web',category:'Medios de cultivo'}));
if(discover)sources.forEach(s=>add({id:'vendor:'+s.id,manufacturer:s.id,title:s.name,url:s.url,expected:'Web',category:'Descubrimiento'}));
const docs=[];
for(let i=0;i<queue.length&&i<limit;i++){
 const item=queue[i],entry={...item,checkedAt:new Date().toISOString()};
 try{const fetched=await get(item.url);entry.finalUrl=fetched.url;const isPDF=fetched.buffer.subarray(0,5).toString()==='%PDF-';entry.contentType=fetched.response.headers.get('content-type')||'';entry.bytes=fetched.buffer.length;entry.sha256=createHash('sha256').update(fetched.buffer).digest('hex');entry.documentType=isPDF?'PDF':'Web';entry.status=item.expected==='PDF'&&!isPDF?'redirected-to-web':'verified-link';
 if(isPDF){entry.localPdf=entry.sha256+'.pdf';await writeFile(path.join(cache,entry.localPdf),fetched.buffer);}
 if(discover&&!isPDF){const text=fetched.buffer.toString('utf8');let match;const links=/href\s*=\s*["']([^"']+)["']/gi;while((match=links.exec(text))){const raw=match[1].replace(/&amp;/g,'&');let url;try{url=new URL(raw,fetched.url).href;}catch{continue;}if(/\.pdf(?:\?|$)/i.test(url)&&allowed(url)){const filename=decodeURIComponent(new URL(url).pathname.split('/').at(-1));const id='discovered-'+createHash('sha256').update(url).digest('hex').slice(0,12);add({id,manufacturer:item.manufacturer,title:filename.replace(/\.pdf$/i,'').replace(/[-_]/g,' '),url,expected:'PDF',category:'Pendiente de clasificar',discovered:true});}}}
 }catch(err){entry.status='unavailable';entry.error=err.message;}
 docs.push(entry);console.log(`${i+1}/${Math.min(limit,queue.length)} ${entry.status}: ${item.title}`);
 await new Promise(resolve=>setTimeout(resolve,400));
}
const result={generatedAt:new Date().toISOString(),exhaustive:false,limit,discover,queued:queue.length,documents:docs};
await writeFile(path.join(root,'catalog-index.json'),JSON.stringify(result,null,2));
console.log(`Saved ${docs.length} records; ${docs.filter(d=>d.documentType==='PDF').length} PDF files; ${queue.length-docs.length} queued for a later run.`);
