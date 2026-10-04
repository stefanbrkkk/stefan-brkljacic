import { copy } from './content.js';

export function initMotion() {
  let anatomyPhase = 0;
  let updateAnatomyLabel = () => {};
  document.querySelectorAll('.decomp').forEach(line => {
    const word = line.dataset.word;
    const n = [...word].length;
    line.innerHTML = [...word].map((char, i) => `<span class="name-letter" data-k="${i}" data-n="${n}">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const letters = [...document.querySelectorAll('.name-letter')];
  const grid = document.querySelector('.hero-grid');
  const webObject = document.querySelector('.hero-web-object');
  const webRig = document.getElementById('heroWebRig');
  const webLayers = [...document.querySelectorAll('[data-web-layer]')];
  const webCursor = document.querySelector('.web-cursor');
  const webTag = document.querySelector('.web-tag');
  let heroPointerX = 0, heroPointerY = 0;
  const coarsePointer = matchMedia('(pointer:coarse)');
  const hoverPointer = matchMedia('(hover:hover) and (pointer:fine)');
  let motionMode = null;
  let framePending = false;
  const pointerUpdates = new Map();
  let readSticky = () => null, renderSticky = () => {};
  const requestFrame = () => {
    if (!framePending) { framePending = true; requestAnimationFrame(renderFrame); }
  };

  const clamp = (n, min=0, max=1) => Math.min(max, Math.max(min, n));
  const pointerMotionActive = () => !motionMode?.static && hoverPointer.matches;
  const renderHero = geometry => {
    const maxScroll = Math.max(1, geometry.height - innerHeight);
    const p = clamp(-geometry.rect.top / maxScroll);
    const e = p * p * (3 - 2 * p);
    letters.forEach((letter) => {
      const k = +letter.dataset.k, n = +letter.dataset.n;
      const row = letter.closest('.name-line').classList.contains('alt') ? 1 : -1;
      const c = n > 1 ? (k - (n - 1) / 2) / ((n - 1) / 2) : 0;
      const spreadX = c * 64 * e;
      const spreadY = row * (18 + (k % 3) * 8) * e;
      const rot = c * 9 * e;
      const z = (k % 2 ? 1 : -1) * 80 * e;
      letter.style.transform = `translate3d(${spreadX}px, ${spreadY}px, ${z}px) rotate(${rot}deg) scale(${1 - e*.045})`;
      letter.style.opacity = String(1 - Math.max(0, (p - .72) / .28) * .6);
      letter.style.filter = `blur(${Math.max(0, p - .78) * 9}px)`;
    });
    grid.style.transform = `scale(${1 + e*.1}) rotate(${e*1.2}deg)`;

    /* Website object: composed interface -> exploded architecture -> recomposed wireframe. */
    const explode = clamp((p - .08) / .52);
    const settle = clamp((p - .67) / .28);
    const breathe = 1 - settle;
    const tiltX = (-7 + e*20 + heroPointerY*3*breathe);
    const tiltY = (9 - e*34 + heroPointerX*5*breathe);
    if (webObject) {
      webObject.style.setProperty('--web-glow', String(.3 + explode*.85));
      webObject.style.transform = `translate(-50%,-50%) translate3d(${(-e*2.8).toFixed(2)}vw,${(e*1.8).toFixed(2)}vh,0) scale(${(1 + explode*.055 - settle*.09).toFixed(3)})`;
      webObject.style.opacity = String((1 - Math.max(0,p-.91)/.09*.58).toFixed(3));
    }
    if (webRig) webRig.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotateZ(${(-2 + e*3.6).toFixed(2)}deg)`;
    const layerMotion = {
      frame:[0,0,44,0],
      layout:[-62,-34,-18,-6],
      components:[64,42,-92,7],
      code:[-96,58,-154,-9],
      shadow:[96,-54,-220,10]
    };
    webLayers.forEach((layer,idx) => {
      const key=layer.dataset.webLayer;
      const m=layerMotion[key] || [0,0,-idx*45,0];
      const fan = explode*(1-settle);
      const rx=(idx%2?1:-1)*(2+idx*1.9)*fan;
      const ry=m[3]*fan;
      const x=m[0]*fan, y=m[1]*fan, z=m[2]*fan;
      const recomposeZ=settle*(idx*-3);
      layer.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${(z+recomposeZ).toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${(1-idx*.012*fan).toFixed(3)})`;
      layer.style.opacity=String((1-settle*(key==='frame'?0:.47)).toFixed(3));
      layer.style.filter=`saturate(${(1+explode*.22).toFixed(2)}) blur(${(settle*idx*.15).toFixed(2)}px)`;
    });
    if (webCursor) {
      const cx = -18*explode + 34*Math.sin(e*Math.PI*1.6)*explode;
      const cy = -22*explode + 16*Math.cos(e*Math.PI*1.35)*explode;
      webCursor.style.transform=`translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,90px) rotate(${(-13+e*22).toFixed(2)}deg) scale(${(1+explode*.32).toFixed(2)})`;
      webCursor.style.opacity=String((1-settle*.7).toFixed(2));
    }
    if (webTag) {
      const tagCopy = copy[document.documentElement.lang];
      webTag.textContent = p < .34 ? tagCopy.webTag : p < .68 ? tagCopy.webTagStructure : tagCopy.webTagRecompose;
      webTag.style.transform=`translate3d(${(explode*16-settle*16).toFixed(1)}px,${(-explode*12+settle*12).toFixed(1)}px,130px)`;
    }
  };
  hero.addEventListener('pointermove', ev => {
    if (!pointerMotionActive()) return;
    pointerUpdates.set(hero, { type:'hero', x:ev.clientX, y:ev.clientY });
    requestFrame();
  }, {passive:true});
  hero.addEventListener('pointerleave', () => {
    if (!pointerMotionActive()) return;
    pointerUpdates.set(hero, { type:'hero', x:innerWidth / 2, y:innerHeight / 2 });
    requestFrame();
  }, {passive:true});

  const revealObserver = typeof window.IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add('is-visible');
  });

  const projectVisuals = [...document.querySelectorAll('.project-visual')];
  const renderProjects = geometries => {
    geometries.forEach(({ element:v, rect:r, index:idx }) => {
      const center = r.top + r.height/2;
      const d = clamp((center - innerHeight/2) / innerHeight, -1, 1);
      const presence = clamp(1 - Math.abs(center-innerHeight/2)/(innerHeight*.86));
      const reveal = clamp((innerHeight*1.04-r.top)/(innerHeight*.78));
      const side = idx%2===0?1:-1;
      v.style.transform = `perspective(1450px) rotateX(${(d*2.2).toFixed(2)}deg) rotateY(${(d*-1.5+side*(1-presence)*.8).toFixed(2)}deg) translate3d(${(d*side*-4).toFixed(1)}px,${(d*-8).toFixed(1)}px,0) scale(${(.96+presence*.03).toFixed(3)})`;
      v.style.clipPath = `inset(${((1-reveal)*4.5).toFixed(2)}% ${((1-reveal)*2.7).toFixed(2)}% round ${Math.round(20+presence*12)}px)`;
      v.style.setProperty('--scan-y', `${(18+presence*64).toFixed(1)}%`);
    });
  };
  /* Pointer handlers queue input; geometry and style updates share the scroll frame. */
  const glowTargets = [...document.querySelectorAll('.project-visual,.service,.method-card,.build-layer,.start-step,.faq-item,.education-card,.device-proof,.contact-channel')];
  const magneticTargets = [...document.querySelectorAll('.cta,.text-link,.brand')];
  glowTargets.forEach(el => el.addEventListener('pointermove', event => {
    if (!pointerMotionActive()) return;
    pointerUpdates.set(el, {type:'glow', x:event.clientX, y:event.clientY});
    requestFrame();
  }, {passive:true}));
  magneticTargets.forEach(el => {
    el.addEventListener('pointermove', event => {
      if (!pointerMotionActive()) return;
      pointerUpdates.set(el, {type:'magnetic', x:event.clientX, y:event.clientY});
      requestFrame();
    }, {passive:true});
    el.addEventListener('pointerleave', () => {
      if (!pointerMotionActive()) return;
      pointerUpdates.set(el, {type:'reset'});
      requestFrame();
    }, {passive:true});
  });

  /* build anatomy: one normalized scroll driver, many synchronized layers */
  const anatomy=document.querySelector('.anatomy');
  const buildBrowser=document.getElementById('buildBrowser');
  const buildCanvas=document.getElementById('buildCanvas');
  const buildLayers=[...document.querySelectorAll('.build-layer')];
  const connector=document.getElementById('buildConnector');
  const shipBadge=document.getElementById('shipBadge');
  const phaseNum=document.getElementById('anatomyPhaseNum');
  const phaseText=document.getElementById('anatomyPhaseText');
  const anatomyProgress=document.getElementById('anatomyProgress');
  let connectorLines=[];
  const layerBase=[[-.235,-.20],[.235,-.20],[-.235,.12],[.235,.12],[0,.445]];
  const layerPos=[[-.62,-.34,90,-14,7],[.62,-.36,60,13,-6],[-.66,.32,110,-10,-5],[.61,.18,72,10,5],[0,.69,100,0,-4]];
  const rebuildConnectors=()=>{
    if(!connector||!buildCanvas)return;
    connector.innerHTML='';connectorLines=[];
    buildLayers.forEach(()=>{const line=document.createElementNS('http://www.w3.org/2000/svg','line');connector.appendChild(line);connectorLines.push(line);});
  };
  rebuildConnectors();
  const easeIO=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const anatomyCopy={
    en:['Decompose the system','Inspect the layers','Recompose the build','Ready to ship'],
    sr:['Rastavljanje sistema','Pregled slojeva','Sklapanje celine','Spremno za isporuku']
  };
  updateAnatomyLabel = () => {
    const language = document.documentElement.lang;
    if (phaseText) phaseText.textContent = anatomyCopy[language][anatomyPhase];
    const description = document.querySelector('[data-i18n="anatomyText"]');
    if (description) description.textContent = copy[language][motionMode?.static ? 'anatomyStaticText' : 'anatomyText'];
  };
  updateAnatomyLabel();
  const stageEl=document.getElementById('anatomyStage');
  const renderAnatomy = geometry => {
    const {rect:r, height, bw, bh, stageW, stageH, cardW, cardH} = geometry;
    const span = Math.max(1, height - innerHeight);
    const p = clamp(-r.top / span);
    const maxX=Math.max(60,stageW/2-cardW/2-46),maxY=Math.max(40,stageH/2-cardH/2-96);
    const explode=easeIO(clamp((p-.07)/.30));
    const returnP=easeIO(clamp((p-.53)/.25));
    const live=clamp((p-.79)/.16);
    const browserScale=1-explode*.14+live*.02;
    buildLayers.forEach((layer,i)=>{
      const l=layerPos[i];
      const stagger=clamp((explode-i*.055)/(1-i*.055));
      const back=clamp((returnP-i*.035)/(1-i*.035));
      const f=stagger*(1-back);
      const b=layerBase[i];
      let tx=l[0]*bw; let ty=l[1]*bh;
      tx=Math.sign(tx)*Math.min(Math.abs(tx),maxX);
      ty=Math.sign(ty)*Math.min(Math.abs(ty),maxY);
      let x=b[0]*bw+tx*f;
      let y=b[1]*bh+ty*f;
      const z=l[2]*f;
      const pv=1500/Math.max(600,1500-z*browserScale);
      const mxC=(maxX/(pv*browserScale)), myC=(maxY/(pv*browserScale));
      x=Math.sign(x)*Math.min(Math.abs(x),mxC);
      y=Math.sign(y)*Math.min(Math.abs(y),myC);
      const ry=l[3]*f,rx=l[4]*f;
      layer.style.transform=`translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) rotateX(${rx.toFixed(1)}deg) scale(${(1-live*.035).toFixed(3)})`;
      layer.style.opacity=String((1-live*.24).toFixed(3));
      layer.classList.toggle('is-hot',p>.70+i*.016 && p<.90);
      const line=connectorLines[i];
      if(line){line.setAttribute('x1',bw/2);line.setAttribute('y1',bh/2);line.setAttribute('x2',bw/2+x);line.setAttribute('y2',bh/2+y);line.setAttribute('opacity',f>.05?String(Math.min(.82,f)):'0');}
    });
    if(buildBrowser){
      buildBrowser.classList.toggle('is-live',p>.78);
      buildBrowser.classList.toggle('is-exploded',explode>.06&&returnP<.6);
      buildBrowser.style.transform=`translate(-50%,-50%) perspective(1300px) rotateY(${((p-.5)*8).toFixed(2)}deg) rotateX(${(Math.sin(p*Math.PI)*-2.2).toFixed(2)}deg) scale(${browserScale.toFixed(3)})`;
    }
    if(shipBadge){shipBadge.style.opacity=String(live);shipBadge.style.transform=`translate(-50%,-50%) scale(${(.35+live*.65).toFixed(3)}) rotate(${((1-live)*-5).toFixed(2)}deg)`;}
    if(anatomyProgress) anatomyProgress.style.transform=`scaleX(${p})`;
    const phase=p<.28?0:p<.56?1:p<.80?2:3;
    anatomyPhase = phase;
    if(phaseNum)phaseNum.textContent=`0${phase+1}`;
    if(phaseText){const lang=document.documentElement.lang==='sr'?'sr':'en';phaseText.textContent=anatomyCopy[lang][phase];}
  };

  const serviceCards=[...document.querySelectorAll('.service')];
  const renderServices = geometries => {
    geometries.forEach(({element:card, rect:r, index:i}) => {
      const center=r.top+r.height/2;
      const d=clamp((center-innerHeight/2)/innerHeight,-1,1);
      const vis=clamp(1-Math.abs(center-innerHeight/2)/(innerHeight*.9));
      card.style.transform=`perspective(1000px) translateY(${(d*-8).toFixed(1)}px) rotateX(${(d*2.8).toFixed(2)}deg) rotateY(${((i-1)*vis*1.3).toFixed(2)}deg)`;
    });
  };

  const animatedElements = [...new Set([
    ...letters, grid, webObject, webRig, ...webLayers, webCursor, webTag,
    ...projectVisuals, ...serviceCards, buildBrowser, ...buildLayers, shipBadge,
    anatomyProgress, ...glowTargets, ...magneticTargets, document.getElementById('projectSignal')
  ].filter(Boolean))];
  /** Clear accumulated state before rendering the new composition, even when offscreen. */
  const applyMotionMode = ({reduced, coarse, width, height}) => {
    const next = {reduced, coarse, width, height, static:reduced || coarse || width <= 1024 || height <= 700};
    const changed = !motionMode || next.static !== motionMode.static || reduced !== motionMode.reduced || coarse !== motionMode.coarse;
    motionMode = next;
    document.documentElement.classList.toggle('motion-static', next.static);
    if (changed) {
      pointerUpdates.clear(); heroPointerX = heroPointerY = 0;
      animatedElements.forEach(el => {
        ['transform','opacity','filter','clip-path','will-change','--mx','--my','--rx','--ry','--gx','--gy','--scan-y','--web-glow'].forEach(property => el.style.removeProperty(property));
        el.classList.remove('is-hot','is-live','is-exploded');
      });
      if (next.static) document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
      connectorLines.forEach(line => line.setAttribute('opacity','0'));
      anatomyPhase = 0;
      if (phaseNum) phaseNum.textContent = '01';
      updateAnatomyLabel();
    }
    requestFrame();
  };
  const readVisible = (element, index=0) => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < innerHeight ? {element, rect, index} : null;
  };
  const renderFrame = () => {
    framePending = false;
    if (!document.documentElement.classList.contains('motion-ready')) return;
    /* Read all scene and pointer geometry before the first style write. */
    const heroGeometry = !motionMode.static && readVisible(hero);
    const projects = motionMode.static ? [] : projectVisuals.map(readVisible).filter(Boolean);
    const services = motionMode.static ? [] : serviceCards.map(readVisible).filter(Boolean);
    const anatomyGeometry = !motionMode.static && readVisible(anatomy);
    if (heroGeometry) heroGeometry.height = hero.offsetHeight;
    if (anatomyGeometry) Object.assign(anatomyGeometry, {
      height:anatomy.offsetHeight, bw:buildCanvas.clientWidth, bh:buildCanvas.clientHeight,
      stageW:stageEl.clientWidth, stageH:stageEl.clientHeight,
      cardW:buildLayers[0].offsetWidth, cardH:buildLayers[0].offsetHeight
    });
    const pointers = pointerMotionActive() ? [...pointerUpdates].map(([element, input]) => ({...readVisible(element), input})).filter(item => item.element) : [];
    const stickyState = readSticky();
    pointerUpdates.clear();
    /* Write phase: no layout reads below this point. */
    pointers.forEach(({element, rect, input}) => {
      if (input.type === 'hero') {
        heroPointerX = clamp(input.x / innerWidth)*2-1;
        heroPointerY = clamp(input.y / innerHeight)*2-1;
      } else if (input.type === 'glow') {
        element.style.setProperty('--mx', `${input.x-rect.left}px`);
        element.style.setProperty('--my', `${input.y-rect.top}px`);
      } else if (input.type === 'magnetic') {
        element.style.transform = `translate3d(${(input.x-rect.left-rect.width/2)*.08}px,${(input.y-rect.top-rect.height/2)*.10}px,0)`;
      } else if (input.type === 'signal') {
        const x = (input.x-rect.left)/rect.width, y = (input.y-rect.top)/rect.height;
        element.style.setProperty('--ry', `${(x-.5)*8}deg`);
        element.style.setProperty('--rx', `${(.5-y)*8}deg`);
        element.style.setProperty('--gx', `${x*100}%`);
        element.style.setProperty('--gy', `${y*100}%`);
      } else {
        ['transform','--rx','--ry','--gx','--gy'].forEach(property => element.style.removeProperty(property));
      }
    });
    if (heroGeometry) renderHero(heroGeometry);
    renderProjects(projects);
    renderServices(services);
    if (anatomyGeometry) renderAnatomy(anatomyGeometry);
    renderSticky(stickyState);
  };
  const updateMotionMode = () => applyMotionMode({reduced:reduceMotion.matches, coarse:coarsePointer.matches, width:innerWidth, height:innerHeight});
  addEventListener('scroll', requestFrame, {passive:true});
  addEventListener('resize', updateMotionMode, {passive:true});
  [reduceMotion, coarsePointer, hoverPointer].forEach(media => media.addEventListener?.('change', updateMotionMode));
  updateMotionMode();
  if (typeof window.IntersectionObserver === 'function') {
    const heroIO = new IntersectionObserver(entries => entries.forEach(entry => hero.classList.toggle('in-view', entry.isIntersecting)), {threshold:0});
    heroIO.observe(hero);
  }

  const projectSignal = document.getElementById('projectSignal');
  if (projectSignal) {
    projectSignal.addEventListener('pointermove', event => {
      if (!pointerMotionActive()) return;
      pointerUpdates.set(projectSignal, {type:'signal', x:event.clientX, y:event.clientY});
      requestFrame();
    }, {passive:true});
    projectSignal.addEventListener('pointerleave', () => {
      if (!pointerMotionActive()) return;
      pointerUpdates.set(projectSignal, {type:'reset'});
      requestFrame();
    }, {passive:true});
  }


  /* Sticky visibility uses the same read/write frame. */

  const stickyCta = document.getElementById('stickyCta');
  if (stickyCta) {
    readSticky = () => {
      const heroEl = document.querySelector('.hero');
      const contactEl = document.querySelector('#contact');
      const servicesEl = document.querySelector('#services');
      const proofEl = document.querySelector('.proof-responsive');
      const aboutEl = document.querySelector('#about');
      const past = scrollY > (heroEl ? heroEl.offsetHeight * .8 : 600);
      const cr = contactEl ? contactEl.getBoundingClientRect() : null;
      const sr = servicesEl ? servicesEl.getBoundingClientRect() : null;
      const pr = proofEl ? proofEl.getBoundingClientRect() : null;
      const ar = aboutEl ? aboutEl.getBoundingClientRect() : null;
      const atContact = cr && cr.top < innerHeight * .8;
      const inServices = sr && sr.top < innerHeight && sr.bottom > 0;
      const inProof = pr && pr.top < innerHeight && pr.bottom > 0;
      const inAbout = ar && ar.top < innerHeight && ar.bottom > 0;
      const show = past && !atContact && !inServices && !inProof && !inAbout && !document.body.classList.contains('menu-open');
      return show;
    };
    renderSticky = show => {
      stickyCta.classList.toggle('on', show);
      stickyCta.setAttribute('aria-hidden', String(!show));
      stickyCta.inert = !show;
    };
    requestFrame();
  }
  return { requestFrame, updateLanguage: () => { updateAnatomyLabel(); requestFrame(); }, revealReady: Boolean(revealObserver) };
}
