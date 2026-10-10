import * as THREE from 'three';
import {CSS3DRenderer,CSS3DObject} from 'three/addons/renderers/CSS3DRenderer.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {pagePoint} from './page-geometry.js';
import {spreadHTML,projectImages} from './book-content.js';

const W=2.9,H=4.05;
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
function coverTexture() {
 return canvasTexture((c,w,h)=>{
  c.fillStyle='#151518';c.fillRect(0,0,w,h);
  c.strokeStyle='#444449';c.lineWidth=1;c.strokeRect(58,56,w-116,h-112);
  c.fillStyle='#b9b6b0';c.font='22px Inter, sans-serif';c.fillText('SELECTED WORK / 2026',94,136);
  c.font='180px Fraunces, serif';c.fillText('SB',84,440);
  c.fillStyle='#dedbd3';c.font='47px Inter, sans-serif';c.fillText('STEFAN',94,664);c.fillText('BRKLJAČIĆ',94,731);
  c.fillStyle='#a4a29e';c.font='17px Inter, sans-serif';c.fillText('WEB DEVELOPMENT',94,831);c.fillText('DIGITAL EXPERIENCES',94,862);
  c.fillStyle='#92918c';c.font='16px Inter, sans-serif';c.fillText('BELGRADE · 2026',94,1118);
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
  this.host=host;this.onAction=onAction;this.onFailure=onFailure;this.lang='en';this.index=-1;this.images={};this.dirty=true;this.yaw=0;this.zoom=1;this.hover=0;this.lastPhase='';this.pointer=null;this.pointers=new Map();
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#0d0d0d');this.scene.fog=new THREE.Fog('#0d0d0d',14,34);
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.4:1.75));
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFShadowMap;
  this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
  host.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-hidden','true');
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onFailure();});
  this.camera=new THREE.PerspectiveCamera(32,1,.1,60);this.camera.position.set(5,8,10);this.camera.lookAt(1,0,0);
  this.css=new CSS3DRenderer();this.css.domElement.className='page-layer';host.append(this.css.domElement);
  this.cssScene=new THREE.Scene();this.cssBook=new THREE.Group();this.cssBook.rotation.x=-Math.PI/2;this.cssScene.add(this.cssBook);
  this.htmlPages=[0,1].map((side)=>{
   const el=document.createElement('div');el.className='physical-page';el.style.visibility='hidden';el.inert=true;el.style.width='600px';el.style.height='838px';
   const obj=new CSS3DObject(el);obj.scale.setScalar(W/600);obj.position.set(side?W/2:-W/2,0,.265);this.cssBook.add(obj);return obj;
  });
  this.book=new THREE.Group();this.book.rotation.x=-Math.PI/2;this.book.position.y=.095;this.scene.add(this.book);this.cssBook.position.copy(this.book.position);
  const pmrem=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment();
  this.env=pmrem.fromScene(room,.04);this.scene.environment=this.env.texture;room.dispose();pmrem.dispose();
  this.scene.add(new THREE.HemisphereLight('#c5d3ea','#2f1d10',.7));
  const key=new THREE.SpotLight('#fff0d8',100,24,.65,.65,1.5);key.position.set(-3,8,3);key.target.position.set(.2,0,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0004;key.shadow.normalBias=.025;this.scene.add(key,key.target);
  const fill=new THREE.DirectionalLight('#b6c9e6',1.1);fill.position.set(6,4,-4);this.scene.add(fill);
  this.wood=grain('wood');this.wood.wrapS=this.wood.wrapT=THREE.RepeatWrapping;this.wood.repeat.set(3,3);
  const desk=new THREE.Mesh(new THREE.BoxGeometry(30,.22,25),new THREE.MeshStandardMaterial({map:this.wood,roughness:.78,color:'#9b8271'}));desk.position.y=-.18;desk.receiveShadow=true;this.scene.add(desk);
  this.makeBook();this.makeProps();this.installEvents();
  for(const [id,url] of Object.entries(projectImages)){
   const img=new Image();this.images[id]=img;img.onload=()=>{if(this.index>=0)this.refreshPaper();};img.src=url;
  }
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();
 }
 makeBook() {
  const leather=grain('cover');this.coverMap=coverTexture();
  this.coverMaterial=new THREE.MeshStandardMaterial({color:'#17171a',map:leather,bumpMap:leather,bumpScale:.012,roughness:.8,metalness:.08});
  this.paperMaterial=new THREE.MeshStandardMaterial({color:'#f4f0e8',roughness:.93});
  const base=new THREE.Mesh(new THREE.BoxGeometry(W+.12,H+.16,.075),this.coverMaterial);base.position.set(W/2,0,0);base.castShadow=true;base.receiveShadow=true;this.book.add(base);
  this.leftBase=base.clone();this.leftBase.position.x=-W/2;this.book.add(this.leftBase);
  this.stackRight=new THREE.Mesh(new THREE.BoxGeometry(W-.04,H-.05,.185),this.paperMaterial);this.stackRight.position.set(W/2,0,.13);this.stackRight.castShadow=true;this.stackRight.receiveShadow=true;this.book.add(this.stackRight);
  this.stackLeft=this.stackRight.clone();this.stackLeft.position.x=-W/2;this.book.add(this.stackLeft);
  const lineMaterial=new THREE.MeshStandardMaterial({color:'#c4beb0',roughness:1});
  for(let side of [-1,1]) for(let i=0;i<17;i++) {
   const line=new THREE.Mesh(new THREE.BoxGeometry(.008,H-.045,.0014),lineMaterial);line.position.set(side*W,0,.045+i*.0095);this.book.add(line);
   const edge=new THREE.Mesh(new THREE.BoxGeometry(W-.04,.008,.0014),lineMaterial);edge.position.set(side*W/2,-H/2+.022,.045+i*.0095);this.book.add(edge);
   if(side===-1){line.userData.left=true;edge.userData.left=true;}
  }
  const spine=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,H+.12,24,1,false,0,Math.PI),this.coverMaterial);spine.rotation.y=Math.PI/2;spine.position.z=.1;this.book.add(spine);
  this.coverPivot=new THREE.Group();this.coverPivot.position.z=.245;this.book.add(this.coverPivot);
  const materials=[this.coverMaterial,this.coverMaterial,this.coverMaterial,this.coverMaterial,new THREE.MeshStandardMaterial({map:this.coverMap,bumpMap:leather,bumpScale:.008,roughness:.74,metalness:.22}),this.coverMaterial];
  this.cover=new THREE.Mesh(new THREE.BoxGeometry(W+.12,H+.16,.07),materials);this.cover.position.x=W/2;this.cover.castShadow=true;this.cover.receiveShadow=true;this.coverPivot.add(this.cover);
  this.restPages=[-1,1].map(side=>{
   const geo=new THREE.PlaneGeometry(W,H,24,1);const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#f4f0e8',roughness:1,side:THREE.DoubleSide}));mesh.position.set(side*W/2,0,.25);mesh.receiveShadow=true;this.book.add(mesh);return mesh;
  });
  this.turnGeometry=new THREE.PlaneGeometry(W,H,64,10);this.turnGeometry.translate(W/2,0,0);
  this.turnFront=new THREE.MeshStandardMaterial({roughness:.95,side:THREE.FrontSide});this.turnBack=new THREE.MeshStandardMaterial({roughness:.95,side:THREE.BackSide});
  this.turnPage=new THREE.Mesh(this.turnGeometry,this.turnFront);this.turnPage.position.z=.274;this.turnPage.castShadow=true;this.turnPage.receiveShadow=true;this.book.add(this.turnPage);
  this.turnReverse=new THREE.Mesh(this.turnGeometry,this.turnBack);this.turnReverse.position.z=.271;this.turnReverse.castShadow=true;this.book.add(this.turnReverse);
  this.raycaster=new THREE.Raycaster();this.mouse=new THREE.Vector2();
 }
 makeProps() {
  const metal=new THREE.MeshStandardMaterial({color:'#b6bbc0',roughness:.24,metalness:1}),black=new THREE.MeshStandardMaterial({color:'#151518',roughness:.68}),ceramic=new THREE.MeshPhysicalMaterial({color:'#f1eee7',roughness:.18,clearcoat:.7});
  const add=(geo,mat,pos,parent=this.scene)=>{const mesh=new THREE.Mesh(geo,mat);mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
  const watch=new THREE.Group();watch.position.set(-4.7,.02,.2);watch.rotation.y=-.35;this.scene.add(watch);
  add(new THREE.BoxGeometry(.48,.07,2.7),black,[0,.035,0],watch);
  add(new THREE.CylinderGeometry(.48,.48,.18,64),metal,[0,.13,0],watch);
  add(new THREE.CylinderGeometry(.416,.416,.015,64),black,[0,.229,0],watch);
  for(let i=0;i<12;i++) {const a=i*Math.PI/6;const tick=add(new THREE.BoxGeometry(.015,.01,i%3===0?.084:.045),metal,[Math.sin(a)*.345,.242,Math.cos(a)*.345],watch);tick.rotation.y=a;}
  const hand=add(new THREE.BoxGeometry(.022,.015,.28),metal,[.08,.251,.025],watch);hand.rotation.y=.75;
  const hand2=add(new THREE.BoxGeometry(.016,.012,.36),metal,[-.035,.255,-.085],watch);hand2.rotation.y=-.4;
  add(new THREE.SphereGeometry(.033,12,8),metal,[0,.259,0],watch);
  add(new THREE.CylinderGeometry(.055,.055,.055,20),metal,[.49,.13,0],watch).rotation.z=Math.PI/2;
  const pen=new THREE.Group();pen.position.set(-3.7,.08,1.7);pen.rotation.y=-.37;this.scene.add(pen);
  add(new THREE.CylinderGeometry(.038,.038,2.3,20),black,[0,0,0],pen).rotation.x=Math.PI/2;
  add(new THREE.ConeGeometry(.039,.23,20),metal,[0,0,-1.26],pen).rotation.x=-Math.PI/2;
  add(new THREE.BoxGeometry(.025,.025,.4),metal,[0,.05,.77],pen);
  const coffee=new THREE.Group();coffee.position.set(4.45,0,-.15);this.scene.add(coffee);
  const saucerMat=new THREE.MeshStandardMaterial({map:this.wood,color:'#5c3622',roughness:.5});
  add(new THREE.CylinderGeometry(.96,.86,.09,64),saucerMat,[0,.045,0],coffee);
  const points=[new THREE.Vector2(0,0),new THREE.Vector2(.28,0),new THREE.Vector2(.31,.07),new THREE.Vector2(.39,.18),new THREE.Vector2(.48,.52),new THREE.Vector2(.48,.59),new THREE.Vector2(.44,.60),new THREE.Vector2(.43,.52),new THREE.Vector2(.35,.18),new THREE.Vector2(.25,.08),new THREE.Vector2(0,.08)];
  add(new THREE.LatheGeometry(points,64),ceramic,[0,.09,0],coffee);
  const handle=add(new THREE.TorusGeometry(.22,.053,12,32,Math.PI*1.75),ceramic,[.53,.4,0],coffee);handle.rotation.z=.3;
  const latte=canvasTexture((c,w,h)=>{
   c.fillStyle='#9a5e30';c.fillRect(0,0,w,h);const glow=c.createRadialGradient(w/2,h/2,20,w/2,h/2,w/2);glow.addColorStop(0,'#ce9c65');glow.addColorStop(1,'#7e431e');c.fillStyle=glow;c.fillRect(0,0,w,h);
   c.fillStyle='#f5e1bd';c.translate(w/2,h*.56);c.rotate(-.4);
   for(let i=0;i<7;i++){c.beginPath();const y=-i*30;c.ellipse(-68+i*7,y,100-i*9,18,.25,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(68-i*7,y,100-i*9,18,-.25,0,Math.PI*2);c.fill();}
   c.strokeStyle='#f5e1bd';c.lineWidth=14;c.beginPath();c.moveTo(0,70);c.lineTo(0,-214);c.stroke();
  },512,512);
  const surface=add(new THREE.CircleGeometry(.432,64),new THREE.MeshStandardMaterial({map:latte,roughness:.3}),[0,.645,0],coffee);surface.rotation.x=-Math.PI/2;
 }
 setPages(html,index,lang) {
  this.htmlPages.forEach((obj,i)=>{obj.element.innerHTML=html[i];});
  this.lang=lang;this.index=index;
  this.restPages.forEach((mesh,i)=>{mesh.material.map?.dispose();mesh.material.map=paperTexture(index,i,lang,this.images);mesh.material.needsUpdate=true;});
  this.dirty=true;
 }
 refreshPaper(){this.restPages.forEach((mesh,i)=>{mesh.material.map?.dispose();mesh.material.map=paperTexture(this.index,i,this.lang,this.images);mesh.material.needsUpdate=true;});this.dirty=true;}
 setTurnTextures(state) {
  this.turnFront.map?.dispose();this.turnBack.map?.dispose();
  this.turnFront.map=paperTexture(state.direction>0?state.spread:state.spread-1,1,this.lang,this.images);
  this.turnBack.map=paperTexture(state.direction>0?state.spread+1:state.spread,0,this.lang,this.images);
  // A backside is viewed through the opposite winding; mirror its UV sampling
  // so the printed reverse reads normally after crossing the spine.
  this.turnBack.map.repeat.x=-1;this.turnBack.map.offset.x=1;
  this.turnFront.needsUpdate=this.turnBack.needsUpdate=true;
 }
 resize() {
  const {width,height}=this.host.getBoundingClientRect();this.width=width;this.height=height;
  this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height);this.css.setSize(width,height);this.dirty=true;
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
  if(state.phase==='turning' && this.lastPhase!=='turning')this.setTurnTextures(state);
  this.lastPhase=state.phase;
  const open=state.phase==='closed'?0:state.phase==='opening'?smooth(state.progress):state.phase==='closing'?1-smooth(state.progress):1;
  const mobile=this.width<700;
  this.coverPivot.rotation.y=-Math.PI*open-(1-open)*this.hover;this.coverPivot.position.z=.245*(1-open)+.015*open;
  this.leftBase.visible=this.stackLeft.visible=open>.2;
  this.book.children.forEach(child=>{if(child.userData.left)child.visible=open>.2;});
  this.stackLeft.scale.z=Math.max(.03,open*.8);this.stackRight.scale.z=1-open*.25;
  this.restPages.forEach(mesh=>mesh.visible=open>.98);
  this.turnPage.visible=this.turnReverse.visible=state.phase==='turning';
  if(this.turnPage.visible) {
   const pos=this.turnGeometry.attributes.position,p=state.direction>0?state.progress:1-state.progress;
   for(let row=0;row<=10;row++)for(let col=0;col<=64;col++) {
    const u=col/64,pt=pagePoint(u,p,W),idx=row*65+col,y=H/2-row*H/10;
    pos.setXYZ(idx,pt.x,y,pt.z+Math.sin(p*Math.PI)*.045*u*u*Math.sin(y/H*Math.PI));
   }
   pos.needsUpdate=true;this.turnGeometry.computeVertexNormals();
  }
  const htmlVisible=state.phase==='open' && state.spread===state.target && this.width>=1100&&this.height>=634;
  this.htmlPages.forEach(obj=>{obj.element.style.visibility=htmlVisible?'visible':'hidden';obj.element.inert=!htmlVisible;});
  const targetX=mobile?(1-open)*W/2:(1-open)*W*.18;
  const fit=Math.max(9.1,this.height/(2*Math.tan(16*Math.PI/180))*2*W/(this.width*.8));
  const distance=mobile?12:fit;
  const desired=new THREE.Vector3(targetX+Math.sin(this.yaw)*distance,(mobile?8.3:8.3*(1-open)+distance*.92*open)*this.zoom,Math.cos(this.yaw)*(mobile?12:10.2*(1-open)+distance*.38*open)*this.zoom);
  // Shift the closed book into the right side of the desktop composition.
  if(!mobile && open<1)desired.x-=1.25*(1-open);
  const lerp=1-Math.exp(-dt*6);this.camera.position.lerp(desired,lerp);
  this.look??=new THREE.Vector3(targetX,0,0);this.look.lerp(new THREE.Vector3(targetX,0,0),lerp);this.camera.lookAt(this.look);
  this.book.rotation.z=this.yaw*.08;this.cssBook.rotation.copy(this.book.rotation);
  const needs=this.dirty||['opening','closing','turning'].includes(state.phase)||this.camera.position.distanceTo(desired)>.002;
  if(needs){this.renderer.render(this.scene,this.camera);this.css.render(this.cssScene,this.camera);this.dirty=false;}
 }
 dispose() {
  this.resizeObserver.disconnect();this.scene.traverse(obj=>{obj.geometry?.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const mat of mats){if(!mat)continue;mat.map?.dispose();mat.dispose();}});this.env.dispose();this.renderer.dispose();this.host.replaceChildren();
 }
}
