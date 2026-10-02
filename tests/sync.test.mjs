import test from 'node:test';
import assert from 'node:assert/strict';
import {blankPersonal,personalData,validatePersonal,copy} from '../personal-data.js';
import {emptyDocument,captureChanges,mergeDocuments,materialize,syncConflicts,resolveConflict,validateDocument} from '../sync-data.js';
import {GitHubSync,encodeUTF8,decodeUTF8,repositoryName} from '../github-sync.js';
import {PersonalSession} from '../sessions.js';
const date='2026-10-02T10:00:00.000Z';
const configured=()=>({reactions:12,controls:1,components:[],reagents:[],steps:[{title:'Incubar',text:'Según receta',seconds:60}],thermal:[{label:'Fase',temp:37,seconds:60}],cycles:1,volume:50});
const protocol={id:'personal-a',title:'Mi receta',category:'Restricción',tags:['DNA'],tips:[],steps:[{title:'Incubar',text:'Mezclar según receta',seconds:60}]};
const token='github_test_token_for_mock_only';
const store=()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k),values};};
function remoteServer(){let document=null,sha=0,privateRepo=true,conflict=null;const requests=[];return {requests,setPrivate:p=>privateRepo=p,setConflict:d=>conflict=d,get document(){return document;},fetcher:async(url,options)=>{requests.push({url,options});const body=options.body?JSON.parse(options.body):null;const path=new URL(url).pathname;const response=(data,status=200)=>({status,ok:status>=200&&status<300,json:async()=>copy(data)});if(path==='/repos/test/molab-data')return response({private:privateRepo,full_name:'test/molab-data',default_branch:'main',permissions:{push:true}});if(options.method==='GET')return document?response({type:'file',size:JSON.stringify(document).length,sha:'sha-'+sha,encoding:'base64',content:encodeUTF8(JSON.stringify(document))}):response({},404);if(conflict){document=copy(conflict);sha++;conflict=null;return response({},409);}if((document&&body.sha!=='sha-'+sha)||(!document&&body.sha))return response({},409);document=JSON.parse(decodeUTF8(body.content));sha++;return response({content:{sha:'sha-'+sha}},201);}};}
function device(server,data=blankPersonal(),options={}){const local=store(),temporary=store();let current=copy(data),editing=false;const session=new PersonalSession({getData:()=>current,applyData:d=>current=copy(d),fetcher:server.fetcher,isEditing:()=>editing,toast(){}},{storage:local,temporary});return {session,local,temporary,get data(){return current;},edit:fn=>{fn(current);session.changed();},setEditing:x=>editing=x,connect:()=>session.connect({repository:'test/molab-data',token,remember:!!options.remember})};}
test('migration retains all local personal records and excludes access credentials from snapshots',()=>{
 const data=blankPersonal();data.customProtocols=[copy(protocol)];data.configs['personal-a']=configured();data.favorites=['personal-a'];data.notes['personal-a']='ñ · observación';data.runs=[{id:'run-a',name:'Ensayo',config:configured()}];data.token='must-not-export';
 const document=captureChanges(emptyDocument(),data,'desktop',date),result=materialize(document);
 assert.equal(result.customProtocols[0].id,'personal-a');assert.equal(result.configs['personal-a'].reactions,12);assert.equal(result.notes['personal-a'],'ñ · observación');assert.equal(result.runs[0].id,'run-a');assert.equal(JSON.stringify(document).includes('must-not-export'),false);assert.deepEqual(validateDocument(document),document);
});
test('two offline devices combine edits to separate notes, protocols, favorites and runs',()=>{
 const base=blankPersonal();base.notes.shared='inicial';const seed=captureChanges(emptyDocument(),base,'seed',date),a=materialize(seed),b=materialize(seed);
 a.notes.a='Nota en ordenador';a.customProtocols.push(copy(protocol));a.favorites.push('personal-a');b.notes.b='Nota en móvil';b.runs.push({id:'run-mobile',name:'Desde móvil'});
 const da=captureChanges(seed,a,'desktop',date),db=captureChanges(seed,b,'phone',date),merged=mergeDocuments(da,db),result=materialize(merged);
 assert.equal(result.notes.a,'Nota en ordenador');assert.equal(result.notes.b,'Nota en móvil');assert.equal(result.customProtocols.length,1);assert.equal(result.runs.length,1);assert.deepEqual(result.favorites,['personal-a']);assert.equal(syncConflicts(merged).length,0);assert.deepEqual(mergeDocuments(merged,merged),merged);
});
test('concurrent edits to the same configuration retain both copies and explicit resolution converges',()=>{
 const base=blankPersonal();base.configs.q5=configured();const seed=captureChanges(emptyDocument(),base,'seed',date),a=materialize(seed),b=materialize(seed);a.configs.q5.reactions=16;b.configs.q5.reactions=24;
 const da=captureChanges(seed,a,'desktop',date),db=captureChanges(seed,b,'phone',date),merged=mergeDocuments(da,db),conflicts=syncConflicts(merged);
 assert.equal(conflicts.length,1);assert.deepEqual(conflicts[0].versions.map(e=>e.value.reactions).sort((a,b)=>a-b),[16,24]);assert.deepEqual(materialize(mergeDocuments(da,db)),materialize(mergeDocuments(db,da)));
 const chosen=conflicts[0].versions.findIndex(e=>e.value.reactions===16),resolved=resolveConflict(merged,conflicts[0].key,chosen,'desktop');assert.equal(materialize(resolved).configs.q5.reactions,16);assert.equal(syncConflicts(mergeDocuments(db,resolved)).length,0);
});
test('removing a favorite propagates and old devices cannot resurrect the deleted value',()=>{
 const base=blankPersonal();base.favorites=['q5'];base.notes.q5='Vieja';const old=captureChanges(emptyDocument(),base,'a',date),updated=materialize(old);updated.favorites=[];delete updated.notes.q5;const next=captureChanges(old,updated,'a',date);assert.deepEqual(materialize(mergeDocuments(old,next)).favorites,[]);assert.equal(materialize(mergeDocuments(old,next)).notes.q5,undefined);
});
test('concurrent active experiments remain available as separate copies',()=>{
 const a=blankPersonal(),b=blankPersonal();a.activeRun={id:'run-a',name:'A',steps:protocol.steps,index:0,timer:{running:false,remaining:60}};b.activeRun={id:'run-b',name:'B',steps:protocol.steps,index:0,timer:{running:false,remaining:60}};const merged=mergeDocuments(captureChanges(emptyDocument(),a,'a',date),captureChanges(emptyDocument(),b,'b',date));assert.equal(syncConflicts(merged)[0].versions.length,2);assert.doesNotThrow(()=>validateDocument(merged));
});
test('remote documents validate every alternative, reject unsafe keys and malformed configs',()=>{
 const invalid={format:'molab-sync-v1',records:{'["notes","__proto__"]':[{v:{a:1},device:'a',at:date,deleted:false,value:'x'}]}};assert.throws(()=>validateDocument(invalid),/no permitido/);
 const d=emptyDocument();d.records['["configs","q5"]']=[{v:{a:1},device:'a',at:date,deleted:false,value:{steps:[]}}];assert.throws(()=>validateDocument(d),/Configuración/);assert.throws(()=>validatePersonal({}),/incompleta/);
});
test('GitHub transport verifies privacy before sending any data and only calls the API origin',async()=>{
 const server=remoteServer();server.setPrivate(false);const client=new GitHubSync({repository:'test/molab-data',token,fetcher:server.fetcher});await assert.rejects(client.exchange(emptyDocument,()=>{}),/privado/);assert.equal(server.requests.length,1);assert.equal(server.document,null);assert.ok(server.requests.every(r=>r.url.startsWith('https://api.github.com/')));assert.equal(repositoryName('https://github.com/test/molab-data'),'test/molab-data');assert.throws(()=>repositoryName('https://evil.example/x'),/usuario/);
});
test('GitHub SHA conflicts are re-read and combined without deleting another device additions',async()=>{
 const server=remoteServer(),a=blankPersonal(),b=blankPersonal();a.notes.a='Uno';b.notes.b='Dos';const da=captureChanges(emptyDocument(),a,'a',date),db=captureChanges(emptyDocument(),b,'b',date);server.setConflict(db);let local=da;const client=new GitHubSync({repository:'test/molab-data',token,fetcher:server.fetcher});await client.exchange(()=>local,merged=>local=merged);assert.equal(materialize(server.document).notes.a,'Uno');assert.equal(materialize(server.document).notes.b,'Dos');assert.equal(server.requests.filter(r=>r.options.method==='PUT').length,2);assert.equal(server.requests.at(-1).options.cache,'no-store');
});
test('a second session downloads saved protocols, settings and notebook without removing its local notes',async()=>{
 const server=remoteServer(),initial=blankPersonal();initial.customProtocols=[copy(protocol)];initial.configs['personal-a']=configured();initial.runs=[{id:'record-a',name:'Registro inicial'}];const a=device(server,initial),b=device(server);b.edit(d=>d.notes.mobile='Local del móvil');try{await a.connect();await b.connect();await a.session.sync({force:true});assert.equal(b.data.customProtocols[0].title,'Mi receta');assert.equal(b.data.configs['personal-a'].reactions,12);assert.equal(b.data.runs[0].id,'record-a');assert.equal(a.data.notes.mobile,'Local del móvil');assert.equal(a.session.conflicts().length,0);}finally{a.session.stop();b.session.stop();}
});
test('session credentials stay outside personal copies and closing a session removes browser access',async()=>{
 const server=remoteServer(),a=device(server,blankPersonal(),{remember:true});try{await a.connect();assert.ok([...a.local.values.values()].some(v=>v.includes(token)));assert.equal(JSON.stringify(personalData(a.data)).includes(token),false);assert.equal(JSON.stringify(server.document).includes(token),false);a.session.disconnect();assert.equal([...a.local.values.values()].some(v=>v.includes(token)),false);assert.equal(a.session.access.token,'');}finally{a.session.stop();}
});
test('a rejected upload keeps local data and reports a real error instead of success',async()=>{
 const server=remoteServer(),a=device(server);a.edit(d=>d.notes.a='No perder');const fail=async(url,options)=>options.method==='PUT'?{ok:false,status:403,json:async()=>({})}:server.fetcher(url,options);a.session.context.fetcher=fail;try{await assert.rejects(a.connect(),/rechazado/);assert.equal(a.data.notes.a,'No perder');assert.equal(a.session.status.state,'error');assert.equal(server.document,null);}finally{a.session.stop();}
});
test('edits made while remote data is pending do not delete unseen remote records',async()=>{
 const server=remoteServer(),a=device(server),b=device(server);try{await a.connect();await b.connect();a.edit(d=>d.notes.remote='Desde ordenador');await a.session.sync({force:true});b.setEditing(false);let calls=0;const fetcher=b.session.context.fetcher;b.session.context.fetcher=async(...args)=>{const result=await fetcher(...args);if(++calls===2)b.setEditing(true);return result;};await b.session.sync();assert.equal(b.session.pendingApply,true);assert.equal(b.data.notes.remote,undefined);b.edit(d=>d.notes.local='Mientras edito');b.setEditing(false);b.session.applyPending();assert.equal(b.data.notes.remote,'Desde ordenador');assert.equal(b.data.notes.local,'Mientras edito');await b.session.sync({force:true});assert.equal(materialize(server.document).notes.remote,'Desde ordenador');assert.equal(materialize(server.document).notes.local,'Mientras edito');}finally{a.session.stop();b.session.stop();}
});
test('UTF-8 transfers preserve accents and molecular units',()=>{const text='µL · °C · ñ · reacción 🧬';assert.equal(decodeUTF8(encodeUTF8(text)),text);});
