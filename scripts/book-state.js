/** Serializes physical transitions while allowing a visitor to change destination. */
export class BookState {
  /** @param {number} count */
  constructor(count) {
    this.count=count; this.spread=0; this.target=0; this.phase='closed';
    this.progress=0; this.direction=1; this.wantsOpen=false;
  }
  /** @param {number} index */
  go(index) {
    this.target=Math.max(0,Math.min(this.count-1,Math.round(index)));
    this.wantsOpen=true;
    if(this.phase==='closed') {this.spread=this.target; this.phase='opening'; this.progress=0;}
  }
  next(delta=1) { this.go(this.target+delta); }
  close() {this.wantsOpen=false;}
  /** @param {number} dt */
  tick(dt) {
    if(this.phase==='open') {
      if(!this.wantsOpen) {this.phase='closing'; this.progress=0;}
      else if(this.spread!==this.target) {
        this.direction=Math.sign(this.target-this.spread); this.phase='turning'; this.progress=0;
      }
    }
    if(['opening','closing','turning'].includes(this.phase)) {
      this.progress=Math.min(1,this.progress+dt/(this.phase==='turning'?.95:1.35));
      if(this.progress===1) {
        if(this.phase==='closing') {this.phase=this.wantsOpen?'opening':'closed';if(this.wantsOpen)this.spread=this.target;}
        else {if(this.phase==='turning') this.spread+=this.direction; this.phase='open';}
        this.progress=0;
      }
    }
    return this;
  }
}
