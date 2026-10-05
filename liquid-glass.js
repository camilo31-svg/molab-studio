/* Optical lenses and interruptible springs. No application data is touched. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let nextId = 0;
const controllers = new Map();
const positions = new Map();
function normalMap(width, height) {
  const w=Math.max(2,Math.round(width)),h=Math.max(2,Math.round(height));
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(w,h),r=h/2,half=Math.max(0,(w-h)/2);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const dx=x-w/2,dy=y-h/2,nx=dx-Math.max(-half,Math.min(half,dx)),d=Math.hypot(nx,dy),q=d/r;
    const bevel=q<1?Math.pow(Math.max(0,(q-.45)/.55),1.35):0,i=(y*w+x)*4;
    pixels.data[i]=128+(d?nx/d:0)*bevel*116;pixels.data[i+1]=128+(d?dy/d:0)*bevel*116;pixels.data[i+2]=128;pixels.data[i+3]=255;
  }
  ctx.putImageData(pixels,0,0);return canvas.toDataURL();
}
function createController(container, primary=false) {
  const groupKey=primary?'nav':([...container.querySelectorAll(':scope > button')].map(b=>Object.keys(b.dataset).sort().join(',')).join('|')+':'+location.hash);
  const previous=positions.get(groupKey);
  const selector=document.createElement('span');selector.className='lg-selector';selector.setAttribute('aria-hidden','true');
  const id='molab-optics-'+(++nextId),ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');svg.classList.add('lg-optics');svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;width:0;height:0;pointer-events:none';
  const defs=document.createElementNS(ns,'defs'),filter=document.createElementNS(ns,'filter'),map=document.createElementNS(ns,'feImage'),displace=document.createElementNS(ns,'feDisplacementMap');
  filter.id=id;filter.setAttribute('x','0');filter.setAttribute('y','0');filter.setAttribute('width','1');filter.setAttribute('height','1');filter.setAttribute('color-interpolation-filters','sRGB');
  map.setAttribute('width','100%');map.setAttribute('height','100%');map.setAttribute('preserveAspectRatio','none');map.setAttribute('result','normal');
  displace.setAttribute('in','SourceGraphic');displace.setAttribute('in2','normal');displace.setAttribute('scale','19.5');displace.setAttribute('xChannelSelector','R');displace.setAttribute('yChannelSelector','G');
  filter.append(map,displace);defs.append(filter);svg.append(defs);document.body.append(svg);
  if(CSS.supports('backdrop-filter',`url("#${id}")`))selector.style.backdropFilter=`url("#${id}") blur(.7px) saturate(1.3)`;
  const body={x:0,y:0,w:100,h:48,lift:0,vx:0,vy:0,vw:0,vh:0,vl:0},goal={x:0,y:0,w:100,h:48,lift:0};
  let frame=0,last=0,ready=false,activeKey='',mapSize='',drag=null,suppress=false;
  const buttons=()=>[...container.children].filter(e=>e.tagName==='BUTTON');
  const active=()=>buttons().find(b=>b.classList.contains(primary?'active':'selected')||b.classList.contains('active')||b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-selected')==='true');
  const key=b=>b?.dataset.nav||b?.textContent.trim();
  function paint(){const stretch=reduced.matches?0:Math.min(.28,Math.hypot(body.vx,body.vy)/1700),lift=reduced.matches?0:body.lift;selector.style.width=body.w+'px';selector.style.height=body.h+'px';selector.style.transform=`translate(${body.x}px,${body.y}px) scale(${1+stretch+lift},${1-stretch*.26+lift})`;displace.setAttribute('scale',String(19.5+stretch*29.25+lift*39));}
  function tick(t){const dt=Math.min(.025,(t-last)/1000||.016);last=t;let energy=0;for(const[k,v]of[['x','vx'],['y','vy'],['w','vw'],['h','vh'],['lift','vl']]){body[v]+=(310*(goal[k]-body[k])-25*body[v])*dt;body[k]+=body[v]*dt;energy+=Math.abs(goal[k]-body[k])+Math.abs(body[v])*.05;}paint();if(energy>.008)frame=requestAnimationFrame(tick);else{Object.assign(body,goal,{vx:0,vy:0,vw:0,vh:0,vl:0});paint();frame=0;}}
  function start(){if(reduced.matches){if(frame)cancelAnimationFrame(frame);frame=0;Object.assign(body,goal,{vx:0,vy:0,vw:0,vh:0,vl:0});paint();}else if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}}
  function target(b){Object.assign(goal,{x:b.offsetLeft,y:b.offsetTop,w:b.offsetWidth,h:b.offsetHeight});const size=Math.round(goal.w)+'x'+Math.round(goal.h);if(size!==mapSize){mapSize=size;map.setAttribute('href',normalMap(goal.w,goal.h));}}
  function sync(){const b=active();if(!b){selector.remove();return;}if(!container.contains(selector))container.prepend(selector);selector.hidden=false;const changed=key(b)!==activeKey;target(b);if(!ready){Object.assign(body,previous&&previous.key!==key(b)?previous.body:goal);ready=true;paint();if(previous&&previous.key!==key(b))start();}else if(changed&&!drag)start();else if(!frame&&!drag){Object.assign(body,goal);paint();}activeKey=key(b);if(primary)buttons().forEach(button=>{if(button===b)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});}
  const observer=new MutationObserver(sync);observer.observe(container,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  const resize=new ResizeObserver(()=>{if(!drag){const b=active();if(b){target(b);start();}}});resize.observe(container);
  const nearest=e=>buttons().reduce((best,b)=>{const r=b.getBoundingClientRect(),distance=Math.hypot(e.clientX-r.x-r.width/2,e.clientY-r.y-r.height/2);return !best||distance<best.distance?{b,distance}:best;},null)?.b;
  function down(e){if(e.button!==0)return;const b=e.target.closest('button');if(!b||b.parentElement!==container)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,button:b};goal.lift=.16;container.setPointerCapture(e.pointerId);start();}
  function move(e){if(!drag||e.pointerId!==drag.id)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;if(!drag.moved)return;const r=container.getBoundingClientRect(),vertical=primary&&getComputedStyle(container).display!=='flex';if(vertical)goal.y=Math.max(0,Math.min(container.clientHeight-goal.h,e.clientY-r.top-goal.h/2));else goal.x=Math.max(0,Math.min(container.clientWidth-goal.w,e.clientX-r.left-goal.w/2));start();}
  function release(e,cancel=false){if(!drag||e.pointerId!==drag.id)return;const b=cancel?null:(drag.moved?nearest(e):drag.button);drag=null;goal.lift=0;if(container.hasPointerCapture(e.pointerId))container.releasePointerCapture(e.pointerId);if(b){b.click();if(primary){if(key(b)===activeKey){target(b);start();}}else{sync();start();}}else{const selected=active();if(selected)target(selected);start();}suppress=true;setTimeout(()=>suppress=false,0);}
  function click(e){if(suppress){e.stopImmediatePropagation();e.preventDefault();}}
  container.addEventListener('pointerdown',down);container.addEventListener('pointermove',move);const up=e=>release(e),cancel=e=>release(e,true);container.addEventListener('pointerup',up);container.addEventListener('pointercancel',cancel);container.addEventListener('click',click,true);
  const motion=()=>{goal.lift=0;start();};reduced.addEventListener('change',motion);sync();
  return {sync,destroy(){positions.set(groupKey,{key:activeKey,body:{...body}});observer.disconnect();resize.disconnect();if(frame)cancelAnimationFrame(frame);svg.remove();selector.remove();reduced.removeEventListener('change',motion);container.removeEventListener('pointerdown',down);container.removeEventListener('pointermove',move);container.removeEventListener('pointerup',up);container.removeEventListener('pointercancel',cancel);container.removeEventListener('click',click,true);}};
}
function refresh(){for(const[node,c]of controllers)if(!node.isConnected){c.destroy();controllers.delete(node);}const nav=document.getElementById('nav');if(nav&&!controllers.has(nav))controllers.set(nav,createController(nav,true));document.querySelectorAll('.toggle,.origin-tabs,.tabs,.category-row').forEach(node=>{if(!node.querySelector(':scope > button.active,:scope > button.selected,:scope > button[aria-pressed="true"],:scope > button[aria-selected="true"]'))return;if(!node.classList.contains('lg-group'))node.classList.add('lg-group');if(!controllers.has(node))controllers.set(node,createController(node));});}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh();});}
const app=document.getElementById('app');new MutationObserver(schedule).observe(app,{childList:true,subtree:true});refresh();
let page=location.hash;addEventListener('hashchange',()=>{const next=location.hash;if(next===page)return;page=next;requestAnimationFrame(()=>{if(!reduced.matches)app.animate([{opacity:.35,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'});schedule();});});
