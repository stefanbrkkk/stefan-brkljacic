import {test} from 'node:test';
import assert from 'node:assert/strict';

const {BookState} = await import('../../scripts/book-state.js').catch(() => ({}));
const {pagePoint,coverPose} = await import('../../scripts/page-geometry.js').catch(() => ({}));

test('rapid navigation serializes turns and clamps the destination', () => {
  assert.equal(typeof BookState, 'function', 'BookState must exist');
  const state = new BookState(6);
  state.go(4); state.go(2); state.go(99);
  for (let i=0;i<30;i++) state.tick(1);
  assert.equal(state.spread,5); assert.equal(state.phase,'open');
  state.go(-10);
  for (let i=0;i<30;i++) state.tick(1);
  assert.equal(state.spread,0);
});
test('closing during a turn settles before closing and can reopen', () => {
  assert.equal(typeof BookState,'function');
  const state = new BookState(6);
  state.go(2); state.tick(2); state.tick(.1); state.close();
  for (let i=0;i<15;i++) state.tick(1);
  assert.equal(state.phase,'closed');
  state.go(0); state.tick(2);
  assert.equal(state.phase,'open'); assert.equal(state.spread,0);
});
test('deformable sheet holds its spine and develops genuine curvature', () => {
  assert.equal(typeof pagePoint,'function');
  const spine=pagePoint(0,.5,3);
  assert.equal(spine.x,0); assert.equal(spine.z,0);
  const mid=pagePoint(.5,.5,3), edge=pagePoint(1,.5,3);
  assert.ok(Math.abs(mid.x-edge.x/2)>.02 || Math.abs(mid.z-edge.z/2)>.02);
  for(const p of [0,.1,.5,.9,1]) for(const u of [0,.5,1]) {
    const pt=pagePoint(u,p,3); assert.ok(Number.isFinite(pt.x+pt.z));
  }
  assert.ok(Math.abs(pagePoint(1,0,3).x-3)<.001);
  assert.ok(Math.abs(pagePoint(1,1,3).x+3)<.001);
});
test('reopening during cover closure resumes rather than getting stuck closed',()=>{
 const state=new BookState(6);state.go(3);state.tick(2);state.close();state.tick(.1);state.go(1);
 for(let i=0;i<15;i++)state.tick(1);
 assert.equal(state.phase,'open');assert.equal(state.spread,1);
});
test('the turning leaf stays above both resting pages throughout its travel',()=>{
 for(let step=0;step<=200;step++)for(let col=0;col<=64;col++){
  const point=pagePoint(col/64,step/200,2.9);
  assert.ok(point.z>=-1e-9,`sheet penetrates the resting page at progress ${step/200}, column ${col}: ${point.z}`);
 }
});

test('cover opening clears the paper and lands without an early left-block reveal',()=>{
 assert.equal(typeof coverPose,'function');
 for(let step=0;step<=200;step++){
  const open=step/200,pose=coverPose(open);
  if(open<=.85){assert.ok(pose.hingeZ-.035>=.272);assert.equal(pose.reveal,0);}
  const endpaperSpine=pose.hingeZ+.199*pose.reveal-(.037+.022*pose.reveal)*Math.cos(Math.PI*open);
  assert.ok(endpaperSpine>=.272,`opening paper intersects the book at ${open}`);
 }
 assert.ok(Math.abs(coverPose(1).hingeZ-.015)<1e-9);
 assert.equal(coverPose(1).reveal,1);assert.equal(coverPose(1).angle,-Math.PI);
});
