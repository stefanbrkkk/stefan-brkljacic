/** Integrate the tangent of a bent sheet: fixed spine, travelling curl, preserved arc length. */
/** @param {number} u @param {number} progress @param {number} width */
export function pagePoint(u,progress,width) {
  const p=Math.max(0,Math.min(1,progress));
  const eased=p*p*(3-2*p), curl=Math.sin(eased*Math.PI);
  let x=0,z=0;
  const steps=32, du=u/steps;
  for(let i=0;i<steps;i++) {
    const s=(i+.5)*du;
    const angle=Math.PI*eased+curl*(.62*Math.sin(Math.PI*s)-.38*s*s);
    x+=Math.cos(angle)*du*width;
    z+=Math.sin(angle)*du*width;
  }
  return {x,z};
}
/** Keep the cover above the paper through its arc, then lower it onto the desk.
 * @param {number} open */
export function coverPose(open) {
 const p=Math.max(0,Math.min(1,open)),landing=Math.max(0,(p-.85)/.15);
 const reveal=landing*landing*(3-2*landing);
 return {angle:-Math.PI*p,hingeZ:.31-.295*reveal,reveal};
}
