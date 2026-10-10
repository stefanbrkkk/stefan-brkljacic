import * as THREE from 'three';
import {CSS3DRenderer,CSS3DObject} from 'three/addons/renderers/CSS3DRenderer.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {PageArtworkCache,turnArtwork} from './page-artwork.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {pagePoint} from './page-geometry.js';
import {spreadHTML,projectImages} from './book-content.js';

const W=2.9,H=4.05;
const bakedPages=import.meta.glob('../assets/book-pages/*.webp',{eager:true,query:'?url',import:'default'});
const smooth=p=>p*p*(3-2*p);
function canvasTexture(draw,w=1024,h=1024) {
 const c=document.createElement('canvas'); c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
function grain(kind) {
 return canvasTexture((c,w,h)=>{
  c.fillStyle=kind==='wood'?'#39261d':'#17171a';c.fillRect(0,0,w,h);
  let seed=71;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(let i=0;i<(kind==='wood'?3800:42000);i++) {
   c.fillStyle=`rgba(${kind==='wood'?'122,84,55':'150,150,155'},${random()*(kind==='wood'?.12:.13)})`;
   if(kind==='wood') {const y=random()*h;c.fillRect(random()*w,y,120+random()*w,random()*1.1+.2);}
   else c.fillRect(random()*w,random()*h,1,1);
  }
 });
}
function coverTexture(leather=null,mask=false) {
 return canvasTexture((c,w,h)=>{
  c.fillStyle=mask?'#000':'#17100c';c.fillRect(0,0,w,h);
  if(leather&&!mask){c.drawImage(leather,0,0,w,h);c.fillStyle='rgba(8,4,2,.64)';c.fillRect(0,0,w,h);}
  const foil=c.createLinearGradient(0,0,w,h);foil.addColorStop(0,'#f0d69e');foil.addColorStop(.45,'#bb955d');foil.addColorStop(.7,'#edd3a2');foil.addColorStop(1,'#886333');
  c.strokeStyle=mask?'#fff':foil;c.lineWidth=1.2;c.strokeRect(53,53,w-106,h-106);c.strokeRect(63,63,w-126,h-126);
  c.fillStyle=mask?'#fff':foil;
  if(!mask){c.shadowColor='#090604';c.shadowBlur=2;c.shadowOffsetY=2;}
  c.font='18px Inter';c.fillText('AN INDEPENDENT PERSPECTIVE',98,152);
  c.font='italic 300px Fraunces';c.fillText('SB',88,568);
  c.font='62px Fraunces';c.fillText('Stefan',100,789);c.fillText('Brkljačić',100,868);
  c.font='18px Inter';c.fillText('WEB DEVELOPMENT',100,977);c.fillText('DIGITAL EXPERIENCES',100,1008);
  c.font='15px Inter';c.fillText('BELGRADE · 2026',100,1270);
 },1024,1430);
}
function paperTexture(index,side,lang,images={}) {
 return canvasTexture((c,w,h)=>{
  c.fillStyle='#f4f0e8';c.fillRect(0,0,w,h);
  const shade=c.createLinearGradient(side?0:w,0,side?w:0,0);shade.addColorStop(0,'rgba(50,35,20,.14)');shade.addColorStop(.08,'rgba(50,35,20,0)');c.fillStyle=shade;c.fillRect(0,0,w,h);
  const element=document.createElement('div');element.innerHTML=spreadHTML(Math.max(0,Math.min(5,index)),lang)[side];
  c.fillStyle='#252725';c.font='12px Inter';c.fillText('SB / SELECTED DIGITAL WORK',58,58);c.fillText('2026',w-95,58);
  c.strokeStyle='#c5bfb3';c.beginPath();c.moveTo(58,82);c.lineTo(w-58,82);c.stroke();
  let y=125;
  const text=(str,font,size,color='#50534b',gap=10)=>{
   c.fillStyle=color;c.font=font;const words=str.trim().split(/\s+/);let line='';
   for(const word of words){if(c.measureText(line+word).width>w-116&&line){c.fillText(line.trim(),58,y);y+=size*1.5;line='';}line+=word+' ';}
   if(line){c.fillText(line.trim(),58,y);y+=size*1.5;}y+=gap;
  };
  const kicker=element.querySelector('.page-kicker');if(kicker)text(kicker.textContent,'12px Inter',12,'#6a6c63',18);
  const title=element.querySelector('h2');if(title)text(title.textContent,'58px Fraunces',58,'#232623',22);
  const source=element.querySelector('.project-art img');
  if(source){
   const id=Object.keys(projectImages).find(key=>projectImages[key]===source.getAttribute('src')),img=images[id];
   c.fillStyle='#ccd0c5';c.fillRect(58,y,w-116,260);
   if(img?.complete&&img.naturalWidth){const ratio=Math.min((w-152)/img.naturalWidth,230/img.naturalHeight);c.drawImage(img,76,y+15,img.naturalWidth*ratio,img.naturalHeight*ratio);}
   y+=292;
  }
  const toc=element.querySelector('.page-contents');
  if(toc)for(const button of toc.querySelectorAll('button')){text(button.textContent,'21px Inter',21,'#353930',12);c.strokeStyle='#c5bfb3';c.beginPath();c.moveTo(58,y-9);c.lineTo(w-58,y-9);c.stroke();}
  else {
   for(const item of element.querySelectorAll('.page-description,.page-constraint,.page-contribution,.page-services section,.page-process > div,.toolkit-list > div,.contact-italic,.book-email,.closing-caption')){
    if(y>h-110)break;
    text(item.textContent,item.matches('.page-process > div,.toolkit-list > div')?'22px Inter':'17px Inter',item.matches('.page-process > div,.toolkit-list > div')?22:17,'#50534b',15);
   }
  }
  c.fillStyle='#767669';c.font='11px Inter';c.fillText('STEFAN BRKLJAČIĆ',58,h-40);c.fillText(String(index*2+side+2).padStart(2,'0'),w-80,h-40);
 },768,1072);
}
export class BookScene {
 constructor(host,onAction,onFailure) {
  this.host=host;this.onAction=onAction;this.onFailure=onFailure;this.lang='en';this.index=-1;this.images={};this.dirty=true;this.yaw=0;this.zoom=1;this.hover=0;this.lastPhase='';this.pointer=null;this.pointers=new Map();this.focusSide=0;this.uploads=0;this.preparations=new Map();
  this.scene=new THREE.Scene();this.scene.background=null;
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  const gl=this.renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
  const gpu=String(gl.getParameter(debug?debug.UNMASKED_RENDERER_WEBGL:gl.RENDERER));
  this.softwareRenderer=/swiftshader|llvmpipe|software rasterizer/i.test(gpu);
  this.renderer.setPixelRatio(this.softwareRenderer?.75:Math.min(devicePixelRatio,innerWidth<700?1.25:1.5));
  host.dataset.renderingQuality=this.softwareRenderer?'software':'full';
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.type=THREE.PCFShadowMap;
  this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
  host.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-hidden','true');
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onFailure();});
  this.camera=new THREE.PerspectiveCamera(32,1,.1,60);this.camera.position.set(5,8,10);this.camera.lookAt(1,0,0);
  this.css=new CSS3DRenderer();this.css.domElement.className='page-layer';host.append(this.css.domElement);
  this.cssScene=new THREE.Scene();this.cssBook=new THREE.Group();this.cssBook.rotation.x=-Math.PI/2;this.cssScene.add(this.cssBook);
  this.htmlPages=[0,1].map((side)=>{
   const el=document.createElement('div');el.className='physical-page';el.dataset.side=String(side);el.style.visibility='hidden';el.inert=true;el.style.width='600px';el.style.height='838px';
   const obj=new CSS3DObject(el);obj.scale.setScalar(W/600);obj.position.set(side?W/2:-W/2,0,.265);obj.rotation.y=(side?1:-1)*.015;this.cssBook.add(obj);return obj;
  });
  this.book=new THREE.Group();this.book.rotation.x=-Math.PI/2;this.book.position.y=-.03;this.scene.add(this.book);this.cssBook.position.copy(this.book.position);
  const pmrem=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment();
  this.env=pmrem.fromScene(room,.04);this.scene.environment=this.env.texture;room.dispose();pmrem.dispose();
  this.scene.add(new THREE.HemisphereLight('#c5d3ea','#2f1d10',.45));
  const key=new THREE.SpotLight('#fff0d8',65,24,.65,.65,1.5);key.position.set(-3,8,3);key.target.position.set(.2,0,0);key.castShadow=true;key.shadow.mapSize.set(this.softwareRenderer?512:1024,this.softwareRenderer?512:1024);key.shadow.bias=-.0004;key.shadow.normalBias=.025;this.scene.add(key,key.target);
  const fill=new THREE.DirectionalLight('#b6c9e6',.65);fill.position.set(6,4,-4);this.scene.add(fill);
  this.textureLoader=new THREE.TextureLoader();
  this.cache=new PageArtworkCache(async(index,side,lang,mode)=>{
   await this.imagesReady;
   const file=bakedPages[`../assets/book-pages/${lang}-${mode}-${index}-${side}.webp`];
   const normal=file?await this.textureLoader.loadAsync(file):paperTexture(index,side,lang,this.images);
   normal.colorSpace=THREE.SRGBColorSpace;normal.anisotropy=this.renderer.capabilities.getMaxAnisotropy();
   const reverse=normal.clone();reverse.repeat.x=-1;reverse.offset.x=1;
   this.renderer.initTexture(normal);this.renderer.initTexture(reverse);this.uploads++;
   host.dataset.artworkUploads=String(this.uploads);
   return {normal,reverse,dispose(){normal.dispose();reverse.dispose();}};
  });
  this.makeBook();this.makeEnvironment();this.installEvents();
  this.leatherReady=this.textureLoader.loadAsync(new URL('../assets/scene-v2/leather-scan.webp',import.meta.url).href).then(map=>{
   map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;this.coverMaterial.map=map;this.coverMaterial.bumpMap=map;this.coverMaterial.bumpScale=.003;this.coverMaterial.needsUpdate=true;
   const face=this.cover.material[4];face.map=coverTexture(map.image);face.bumpMap=map;face.bumpScale=.003;face.metalnessMap=coverTexture(null,true);face.metalness=.85;face.roughness=.5;face.needsUpdate=true;this.renderer.initTexture(map);this.renderer.initTexture(face.map);this.dirty=true;
  });
  this.imagesReady=Promise.all(Object.entries(projectImages).map(async([id,url])=>{const img=new Image();img.src=url;await img.decode().catch(()=>{});this.images[id]=img;}));
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();
 }
 makeBook() {
  const leather=grain('cover');this.coverMap=coverTexture();
  this.coverMaterial=new THREE.MeshStandardMaterial({color:'#665247',map:leather,bumpMap:leather,bumpScale:.012,roughness:.54,metalness:.08,envMapIntensity:.16});
  this.paperMaterial=new THREE.MeshStandardMaterial({color:'#f4f0e8',roughness:.93});
  const base=new THREE.Mesh(new RoundedBoxGeometry(W+.12,H+.16,.075,3,.023),this.coverMaterial);base.position.set(W/2,0,0);base.castShadow=true;base.receiveShadow=true;this.book.add(base);
  this.leftBase=base.clone();this.leftBase.position.x=-W/2;this.book.add(this.leftBase);
  this.stackRight=new THREE.Mesh(new THREE.BoxGeometry(W-.04,H-.05,.185),this.paperMaterial);this.stackRight.position.set(W/2,0,.13);this.stackRight.castShadow=true;this.stackRight.receiveShadow=true;this.book.add(this.stackRight);
  this.stackLeft=this.stackRight.clone();this.stackLeft.position.x=-W/2;this.book.add(this.stackLeft);
  const lineMaterial=new THREE.MeshStandardMaterial({color:'#c5bca9',roughness:1});
  for(const side of [-1,1])for(const edge of [false,true]){
   const geometry=new THREE.BoxGeometry(edge?W-.04:.004,edge?.004:H-.045,.0009);
   const lines=new THREE.InstancedMesh(geometry,lineMaterial,17);
   for(let i=0;i<17;i++){const transform=new THREE.Matrix4().makeTranslation(edge?side*W/2:side*W,edge?-H/2+.022:0,.045+i*.0095);lines.setMatrixAt(i,transform);}
   if(side===-1)lines.userData.left=true;this.book.add(lines);
  }
  const spine=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,H+.12,24,1,false,0,Math.PI),this.coverMaterial);spine.rotation.y=Math.PI/2;spine.position.z=.1;this.book.add(spine);
  this.coverPivot=new THREE.Group();this.coverPivot.position.z=.245;this.book.add(this.coverPivot);
  const materials=[this.coverMaterial,this.coverMaterial,this.coverMaterial,this.coverMaterial,new THREE.MeshStandardMaterial({map:this.coverMap,bumpMap:leather,bumpScale:.008,roughness:.43,metalness:.32,envMapIntensity:.16}),this.coverMaterial];
  this.cover=new THREE.Mesh(new RoundedBoxGeometry(W+.12,H+.16,.07,3,.022),materials);this.cover.position.x=W/2;this.cover.castShadow=true;this.cover.receiveShadow=true;this.coverPivot.add(this.cover);
  this.restPages=[-1,1].map(side=>{
   const geo=new THREE.PlaneGeometry(W,H,24,1);const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:'#ffffff',side:THREE.DoubleSide,toneMapped:false}));mesh.position.set(side*W/2,0,.25);mesh.rotation.y=side*.015;mesh.receiveShadow=true;this.book.add(mesh);return mesh;
  });
  this.turnGeometry=new THREE.PlaneGeometry(W,H,64,10);this.turnGeometry.translate(W/2,0,0);
  this.turnFront=new THREE.MeshBasicMaterial({side:THREE.FrontSide,toneMapped:false});this.turnBack=new THREE.MeshBasicMaterial({side:THREE.BackSide,toneMapped:false});
  this.turnPage=new THREE.Mesh(this.turnGeometry,this.turnFront);this.turnPage.position.z=.274;this.turnPage.castShadow=true;this.turnPage.receiveShadow=true;this.book.add(this.turnPage);
  for(const material of [this.turnFront,this.turnBack])material.onBeforeCompile=shader=>{
   shader.vertexShader='varying vec3 vLeafNormal;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLeafNormal=normalize(normalMatrix*normal);');
   shader.fragmentShader='varying vec3 vLeafNormal;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb*=.65+.35*sqrt(abs(dot(normalize(vLeafNormal),normalize(vec3(-.22,.12,1.)))));');
  };
  this.pageShadows=[-1,1].map(side=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.ShadowMaterial({color:'#20150a',opacity:.24}));mesh.position.set(side*W/2,0,.253);mesh.rotation.y=side*.015;mesh.receiveShadow=true;this.book.add(mesh);return mesh;});
  this.turnReverse=new THREE.Mesh(this.turnGeometry,this.turnBack);this.turnReverse.position.z=.271;this.turnReverse.castShadow=true;this.book.add(this.turnReverse);
  this.raycaster=new THREE.Raycaster();this.mouse=new THREE.Vector2();
 }
 makeEnvironment() {
  const image=new Image();image.src=new URL('../assets/scene-v2/desk-photograph.webp',import.meta.url).href;
  this.host.parentElement.style.setProperty('--desk-photograph',`url("${image.src}")`);
  const portrait=new Image();portrait.src=new URL('../assets/scene-v2/desk-portrait.webp',import.meta.url).href;this.environmentReady=Promise.all([image.decode(),portrait.decode()]);
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(7.6,5.4),new THREE.ShadowMaterial({color:'#160b05',opacity:.42}));contact.rotation.x=-Math.PI/2;contact.position.y=-.068;contact.receiveShadow=true;this.scene.add(contact);
 }
 prepare(lang=this.lang,mode=this.compact?'compact':'wide') {
  const key=`${lang}:${mode}`;
  if(!this.preparations.has(key))this.preparations.set(key,Promise.all([this.environmentReady,this.leatherReady,this.cache.prepareAll(lang,mode)]).then(async()=>{
   if(!this.warmed){this.lang=lang;this.restPages.forEach((mesh,i)=>{mesh.material.map=this.artwork(0,i);mesh.material.needsUpdate=true;});this.turnFront.map=this.artwork(0,1);this.turnBack.map=this.artwork(1,0,true);this.turnFront.needsUpdate=this.turnBack.needsUpdate=true;await this.renderer.compileAsync(this.scene,this.camera);this.renderer.render(this.scene,this.camera);this.warmed=true;}
   this.dirty=true;
  }));
  return this.preparations.get(key);
 }
 artwork(index,side,reverse=false) {const value=this.cache.get(index,side,this.lang,this.compact?'compact':'wide');return value?.[reverse?'reverse':'normal'];}
 setPages(html,index,lang) {
  this.htmlPages.forEach((obj,i)=>{obj.element.innerHTML=html[i];obj.element.classList.toggle('compact-folio',this.compact);});
  this.lang=lang;this.index=index;
  if(this.desiredCompact!==undefined&&this.desiredCompact!==this.compact)this.stageMode(this.desiredCompact,lang);
  const assign=()=>{if(this.lang!==lang||this.index!==index)return;this.restPages.forEach((mesh,i)=>{mesh.material.map=this.artwork(index,i);mesh.material.needsUpdate=true;});this.dirty=true;};
  if(this.artwork(index,0))assign();else this.prepare(lang).then(assign);
 }
 setTurnTextures(state) {
  const faces=turnArtwork(state.spread,state.direction);
  this.restPages[0].material.map=this.artwork(...faces.left);
  this.restPages[1].material.map=this.artwork(...faces.right);
  this.turnFront.map=this.artwork(...faces.front);
  this.turnBack.map=this.artwork(...faces.back,true);
  this.restPages.forEach(mesh=>{mesh.material.needsUpdate=true;});
  this.turnFront.needsUpdate=this.turnBack.needsUpdate=true;
 }
 resize() {
  const {width,height}=this.host.getBoundingClientRect();this.width=width;this.height=height;
  const desired=innerWidth<900||innerHeight<740;
  if(this.compact===undefined)this.compact=desired;
  this.desiredCompact=desired;
  this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height);this.css.setSize(width,height);this.dirty=true;
  if(desired!==this.compact&&this.index>=0)this.stageMode(desired,this.lang);
 }
 stageMode(compact,lang) {
  this.prepare(lang,compact?'compact':'wide').then(()=>{if(this.desiredCompact===compact&&this.lang===lang){this.pendingMode={compact,lang};this.dirty=true;}});
 }
 reset(){this.yaw=0;this.zoom=1;this.dirty=true;}
 installEvents() {
  const host=this.host;
  host.addEventListener('pointerdown',e=>{
   if(e.target.closest('a,button'))return;
   this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(this.pointers.size===1)this.pointer={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,type:e.pointerType,moved:false};
   if(this.pointers.size===2){const a=[...this.pointers.values()];this.pinch=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);}
   host.setPointerCapture(e.pointerId);
  });
  host.addEventListener('pointermove',e=>{
   if(!this.pointer){const r=host.getBoundingClientRect();this.mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.raycaster.setFromCamera(this.mouse,this.camera);this.hover=this.raycaster.intersectObject(this.cover).length?.025:0;this.dirty=true;return;}
   if(!this.pointers.has(e.pointerId))return;
   this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(this.pointers.size===2){const a=[...this.pointers.values()],distance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);this.zoom=THREE.MathUtils.clamp(this.zoom*(this.pinch/distance),.8,1.2);this.pinch=distance;this.yaw=THREE.MathUtils.clamp(this.yaw+(e.clientX-this.pointer.x)*.002,-.24,.24);}
   else if(e.pointerType!=='touch')this.yaw=THREE.MathUtils.clamp(this.yaw+(e.clientX-this.pointer.x)*.002,-.24,.24);
   if(Math.hypot(e.clientX-this.pointer.startX,e.clientY-this.pointer.startY)>10)this.pointer.moved=true;
   this.pointer.x=e.clientX;this.pointer.y=e.clientY;this.dirty=true;
  });
  const up=e=>{
   const p=this.pointer;this.pointers.delete(e.pointerId);
   if(p && this.pointers.size===0) {
    if(p.type==='touch' && Math.abs(e.clientX-p.startX)>45 && Math.abs(e.clientY-p.startY)<80)this.onAction(e.clientX<p.startX?'next':'prev');
    else if(!p.moved) {
     const rect=host.getBoundingClientRect();this.mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.raycaster.setFromCamera(this.mouse,this.camera);
     if(this.lastPhase==='closed' && this.raycaster.intersectObject(this.cover).length)this.onAction('open');
     else if(this.lastPhase==='open') {const hits=this.raycaster.intersectObjects(this.restPages);if(hits.length){const local=this.book.worldToLocal(hits[0].point.clone());if(Math.abs(local.x)>W*.65)this.onAction(local.x>0?'next':'prev');}}
    }
    this.pointer=null;
   }
  };
  host.addEventListener('pointerup',up);host.addEventListener('pointercancel',()=>{this.pointers.clear();this.pointer=null;});
  host.addEventListener('wheel',e=>{e.preventDefault();this.zoom=THREE.MathUtils.clamp(this.zoom+e.deltaY*.00045,.8,1.2);this.dirty=true;},{passive:false});
  host.addEventListener('dblclick',()=>this.reset());host.addEventListener('pointerleave',()=>{this.hover=0;this.dirty=true;});
 }
 update(state,dt) {
  // Commit a fully uploaded layout only at a stationary book boundary.
  if(this.pendingMode!==undefined&&['open','closed'].includes(state.phase)){
   const {compact,lang}=this.pendingMode;this.pendingMode=undefined;
   if(compact===this.desiredCompact&&lang===this.lang){this.compact=compact;this.setPages(this.htmlPages.map(obj=>obj.element.innerHTML),state.spread,this.lang);}
  }
  if(state.phase==='turning' && this.lastPhase!=='turning')this.setTurnTextures(state);
  this.lastPhase=state.phase;
  const open=state.phase==='closed'?0:state.phase==='opening'?smooth(state.progress):state.phase==='closing'?1-smooth(state.progress):1;
  this.coverPivot.rotation.y=-Math.PI*open-(1-open)*this.hover;this.coverPivot.position.z=.245*(1-open)+.015*open;
  this.leftBase.visible=this.stackLeft.visible=open>.2;
  this.book.children.forEach(child=>{if(child.userData.left)child.visible=open>.2;});
  this.stackLeft.scale.z=Math.max(.03,open*.8);this.stackRight.scale.z=1-open*.25;
  this.restPages.forEach(mesh=>mesh.visible=open>.05);
  this.pageShadows.forEach(mesh=>{mesh.visible=open>.05;});
  this.turnPage.visible=this.turnReverse.visible=state.phase==='turning';
  if(this.turnPage.visible) {
   const pos=this.turnGeometry.attributes.position,p=state.direction>0?state.progress:1-state.progress;
   const curve=Array.from({length:65},(_,col)=>pagePoint(col/64,p,W));
   for(let row=0;row<=10;row++)for(let col=0;col<=64;col++) {
    const u=col/64,pt=curve[col],idx=row*65+col,y=H/2-row*H/10;
    pos.setXYZ(idx,pt.x,y,pt.z+Math.sin(p*Math.PI)*.045*u*u*Math.sin(y/H*Math.PI));
   }
   pos.needsUpdate=true;this.turnGeometry.computeVertexNormals();
  }
  const htmlVisible=state.phase==='open' && state.spread===state.target;
  this.htmlPages.forEach((obj,i)=>{obj.element.style.visibility=htmlVisible?'visible':'hidden';obj.element.inert=!htmlVisible||(this.compact&&i!==this.focusSide);obj.element.setAttribute('aria-hidden',String(obj.element.inert));});
  const targetX=this.compact?W/2*(1-open)+(this.focusSide?1:-1)*W/2*open:(1-open)*W*.18;
  const viewWidth=this.compact?W*1.08:2*W*1.08;
  const distance=Math.max(H*1.12,viewWidth/this.camera.aspect)/(2*Math.tan(16*Math.PI/180));
  const closedDistance=this.compact?Math.max(7.8,W*1.25/this.camera.aspect/(2*Math.tan(16*Math.PI/180))):10.8;
  const targetZ=this.compact?-.8*(1-open):0;
  const desired=new THREE.Vector3(targetX+Math.sin(this.yaw)*distance,(closedDistance*.92*(1-open)+distance*.98*open)*this.zoom,Math.cos(this.yaw)*(closedDistance*.4*(1-open)+distance*.2*open)*this.zoom+targetZ);
  // Shift the closed book into the right side of the desktop composition.
  if(!this.compact && open<1)desired.x-=1.25*(1-open);
  const lerp=1-Math.exp(-dt*6);this.camera.position.lerp(desired,lerp);
  this.look??=new THREE.Vector3(targetX,0,targetZ);this.look.lerp(new THREE.Vector3(targetX,0,targetZ),lerp);this.camera.lookAt(this.look);
  this.book.rotation.z=0;this.cssBook.rotation.copy(this.book.rotation);
  if(['opening','closing','turning'].includes(state.phase)||this.shadowCover!==this.coverPivot.rotation.y||this.shadowPhase!==state.phase){this.renderer.shadowMap.needsUpdate=true;this.shadowCover=this.coverPivot.rotation.y;this.shadowPhase=state.phase;}
  const needs=this.dirty||['opening','closing','turning'].includes(state.phase)||this.camera.position.distanceTo(desired)>.002;
  if(needs){this.renderer.render(this.scene,this.camera);this.css.render(this.cssScene,this.camera);this.dirty=false;}
 }
 dispose() {
  this.cache.dispose();this.resizeObserver.disconnect();this.scene.traverse(obj=>{obj.geometry?.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const mat of mats){if(!mat)continue;if(!mat.map?.source?.data?.src?.includes('book-pages'))mat.map?.dispose();mat.dispose();}});this.env.dispose();this.renderer.dispose();this.host.replaceChildren();
 }
}
