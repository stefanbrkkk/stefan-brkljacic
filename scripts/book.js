import {BookState} from './book-state.js';
import {spreadHTML,bookCopy,chapters,projects} from './book-content.js';
import {copy} from './content.js';

const $=id=>document.getElementById(id);
export async function initBook() {
 const state=new BookState(6),host=$('deskScene'),reader=$('spreadReader'),root=document.documentElement;
 let scene=null,rendered=-1,lastLang='',reading=false,lastTime=0,raf=0,caseOpener=null,lastRender='';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const lang=()=>root.lang==='sr'?'sr':'en';
 const small=()=>innerWidth<1100||innerHeight<700;
 const localize=()=>{
  const b=bookCopy[lang()];
  document.querySelectorAll('[data-book-copy]').forEach(el=>el.textContent=b[el.dataset.bookCopy]);
  document.querySelectorAll('[data-book-label]').forEach(el=>el.setAttribute('aria-label',b[el.dataset.bookLabel]));
  $('interactionHint').textContent=b[innerWidth<700?'mobileHint':'hint'];
  $('chapterMenu').innerHTML=chapters[lang()].map((title,i)=>`<button type="button" data-spread="${i}"><small>0${i+1}</small><span>${title}</span><i>↗</i></button>`).join('');
  $('chapterMenu').setAttribute('aria-label',b.contents);$('deskScene').setAttribute('aria-label',b.open);
 };
 const render=()=>{
  const l=lang(),open=state.phase!=='closed' && state.phase!=='closing';
  const signature=[state.phase,state.spread,state.target,l,small(),!!scene,root.classList.contains('static-book')].join('|');
  if(signature===lastRender)return;lastRender=signature;
  root.dataset.bookState=state.phase;root.dataset.spread=String(state.spread);
  root.classList.toggle('book-open',open);
  $('bookControls').hidden=!open;
  $('previousSpread').disabled=state.target===0;
  $('nextSpread').disabled=state.target===5;
  $('spreadLabel').textContent=`0${state.spread+1} / 06`;
  $('chapterName').textContent=chapters[l][state.spread];
  if(state.phase==='open')$('bookStatus').textContent=`${bookCopy[l].page} ${state.spread+1}: ${chapters[l][state.spread]}`;
  $('bookControls').setAttribute('aria-label',`${bookCopy[l].page} ${state.spread+1}: ${chapters[l][state.spread]}`);
  reader.hidden=!open || (!small() && !root.classList.contains('static-book'));
  if(rendered!==state.spread||lastLang!==l){
   const html=spreadHTML(state.spread,l);reader.innerHTML=html.join('');scene?.setPages(html,state.spread,l);rendered=state.spread;lastLang=l;
  }
 };
 const request=index=>{
  state.go(index);$('chapterMenu').hidden=true;$('chapterToggle').setAttribute('aria-expanded','false');
  if(!scene||reduced.matches)for(let i=0;i<15;i++)state.tick(2);
  render();
  history.replaceState(null,'',`#book/${state.target+1}`);
  if(small())window.scrollTo({top:0,behavior:'instant'});
 };
 const action=type=>{
  if(type==='open')request(state.spread);
  else if(type==='next')request(state.target+1);
  else if(type==='prev')request(state.target-1);
  else if(type==='close'){state.close();if(!scene)state.tick(2);history.replaceState(null,'','#top');render();$('openBook').focus({preventScroll:true});}
 };
 const setReading=(value,target=null)=>{
  reading=value;root.classList.toggle('reading-mode',value);$('readingContent').hidden=!value;$('readingToolbar').hidden=!value;
  if(value){(target||$('readingContent')).focus({preventScroll:true});(target||$('readingContent')).scrollIntoView({behavior:'instant',block:'start'});}
  else{window.scrollTo({top:0,behavior:'instant'});$('readingToggle').focus({preventScroll:true});}
 };
 const openCase=(id,opener)=>{
  const p=projects.find(p=>p.id===id);if(!p)return;const d=copy[lang()];
  $('caseContent').innerHTML=`<div class="page-kicker">${d[id+'Status']}</div><h2 id="caseTitle">${p.title}</h2><dl>${['Problem','Role','Constraints','Solution','Deliverables'].map((field,i)=>`<div><dt>${d[['caseProblem','caseContribution','caseConstraint','caseSolution','caseDeliverables'][i]]}</dt><dd>${d[id+field]}</dd></div>`).join('')}</dl><a class="page-contact" href="${p.url}" target="_blank" rel="noopener noreferrer">${bookCopy[lang()].live}</a>`;
  caseOpener=opener;$('caseDialog').showModal();$('caseClose').focus();
 };
 document.addEventListener('click',event=>{
  const target=event.target.closest('button,a');if(!target)return;
  if(target.hasAttribute('data-spread'))request(Number(target.dataset.spread));
  if(target.hasAttribute('data-close-book'))action('close');
  if(target.hasAttribute('data-case'))openCase(target.dataset.case,target);
  // Generated semantic pages share the preserved inquiry controller's opener.
  if(target.hasAttribute('data-inquiry') && target.closest('.physical-page,.spread-reader')){
   event.preventDefault();document.querySelector('.header-contact').click();
  }
  if(target.classList.contains('skip-link')){event.preventDefault();setReading(true);}
 });
 $('openBook').addEventListener('click',()=>action('open'));
 $('nextSpread').addEventListener('click',()=>action('next'));$('previousSpread').addEventListener('click',()=>action('prev'));
 $('closeBook').addEventListener('click',()=>action('close'));$('resetView').addEventListener('click',()=>scene?.reset());
 $('chapterToggle').addEventListener('click',()=>{const show=$('chapterMenu').hidden;$('chapterMenu').hidden=!show;$('chapterToggle').setAttribute('aria-expanded',String(show));if(show)$('chapterMenu').querySelector('button').focus();});
 $('readingToggle').addEventListener('click',()=>setReading(true));$('readingBack').addEventListener('click',()=>setReading(false));
 $('caseDialog').addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...$('caseDialog').querySelectorAll('button,a[href]')].filter(el=>el.getClientRects().length);event.preventDefault();const index=controls.indexOf(document.activeElement);controls[(index+(event.shiftKey?-1:1)+controls.length)%controls.length].focus();});
 $('caseClose').addEventListener('click',()=>$('caseDialog').close());$('caseDialog').addEventListener('close',()=>caseOpener?.focus());
 $('caseDialog').addEventListener('click',e=>{if(e.target===$('caseDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
 document.addEventListener('keydown',e=>{
  if(document.querySelector('dialog[open]')||e.target.closest('input,textarea,select')||reading)return;
  if(e.key==='ArrowRight'){e.preventDefault();action('next');}
  if(e.key==='ArrowLeft'){e.preventDefault();action('prev');}
  if(e.key==='Escape'){if(!$('chapterMenu').hidden){$('chapterMenu').hidden=true;$('chapterToggle').setAttribute('aria-expanded','false');$('chapterToggle').focus();}else action('close');}
  if(e.key==='Enter'&&e.target===document.body)action('open');
 });
 const hash=()=>{
  const match=location.hash.match(/^#book\/([1-6])$/);if(match)request(Number(match[1])-1);
  else if(location.hash && location.hash!=='#top'){const target=document.getElementById(location.hash.slice(1));if(target&&$('readingContent').contains(target))setReading(true,target);}
 };
 addEventListener('hashchange',hash);
 const fallback=()=>{
  if(raf)cancelAnimationFrame(raf);scene?.dispose();scene=null;root.classList.remove('scene-ready');root.classList.add('static-book');$('sceneLoading').hidden=true;
  $('interactionHint').textContent=bookCopy[lang()].fallback;
  for(let i=0;i<15;i++)state.tick(2);render();
 };
 root.classList.add('book-ready');$('readingContent').hidden=true;localize();render();hash();
 document.addEventListener('portfolio-language',()=>{localize();render();if(!scene)$('interactionHint').textContent=bookCopy[lang()].fallback;});
 addEventListener('resize',()=>{localize();render();},{passive:true});
 if(reduced.matches){fallback();return;}
 try {
  await document.fonts.ready;
  const {BookScene}=await import('./book-scene.js');scene=new BookScene(host,action,fallback);
  rendered=-1;render();scene.update(state,1);root.classList.add('scene-ready');$('sceneLoading').hidden=true;
  const frame=time=>{
   const dt=Math.min(.2,(time-(lastTime||time))/1000);lastTime=time;
   if(!document.hidden&&!reading&&!document.querySelector('dialog[open]')){state.tick(dt);render();scene?.update(state,dt);}
   raf=requestAnimationFrame(frame);
  };
  raf=requestAnimationFrame(frame);
  document.addEventListener('visibilitychange',()=>{lastTime=0;});
  reduced.addEventListener('change',()=>{if(reduced.matches)fallback();});
  addEventListener('pagehide',event=>{cancelAnimationFrame(raf);if(!event.persisted)scene?.dispose();});
  addEventListener('pageshow',event=>{if(event.persisted&&scene){lastTime=0;raf=requestAnimationFrame(frame);}});
 }catch(error){console.warn('3D edition unavailable; reading edition ready.',error);fallback();}
}
