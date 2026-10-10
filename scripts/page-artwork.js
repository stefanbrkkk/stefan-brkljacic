/** Owns prepared artwork. Animation only reads these entries; it never builds or decodes images. */
export class PageArtworkCache {
 constructor(factory,count=6){this.factory=factory;this.count=count;this.entries=new Map();this.pending=new Map();}
 key(index,side,lang,mode){return `${lang}:${mode}:${index}:${side}`;}
 get(index,side,lang,mode){return this.entries.get(this.key(index,side,lang,mode));}
 ensure(index,side,lang,mode){
  const key=this.key(index,side,lang,mode);
  if(this.entries.has(key))return Promise.resolve(this.entries.get(key));
  if(this.pending.has(key))return this.pending.get(key);
  const promise=Promise.resolve().then(()=>this.factory(index,side,lang,mode)).then(value=>{this.entries.set(key,value);this.pending.delete(key);return value;},error=>{this.pending.delete(key);throw error;});
  this.pending.set(key,promise);return promise;
 }
 prepare(index,lang,mode){return Promise.all([-1,0,1].flatMap(offset=>{const spread=index+offset;return spread<0||spread>=this.count?[]:[0,1].map(side=>this.ensure(spread,side,lang,mode));}));}
 prepareAll(lang,mode){return Promise.all(Array.from({length:this.count},(_,index)=>[0,1].map(side=>this.ensure(index,side,lang,mode))).flat());}
 dispose(){for(const value of this.entries.values())value?.dispose?.();this.entries.clear();}
}
export const turnArtwork=(index,direction)=>direction>0?{left:[index,0],right:[index+1,1],front:[index,1],back:[index+1,0]}:{left:[index-1,0],right:[index,1],front:[index-1,1],back:[index,0]};
