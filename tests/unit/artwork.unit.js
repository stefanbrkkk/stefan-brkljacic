import {test} from 'node:test';
import assert from 'node:assert/strict';
const {PageArtworkCache,turnArtwork}=await import('../../scripts/page-artwork.js').catch(()=>({}));
test('page preparation deduplicates concurrent requests and preloads adjacent spreads',async()=>{
 assert.equal(typeof PageArtworkCache,'function');const calls=[];
 const cache=new PageArtworkCache(async(index,side,lang,mode)=>{calls.push(`${lang}:${mode}:${index}:${side}`);return {index,side};});
 await Promise.all([cache.prepare(2,'en','wide'),cache.prepare(2,'en','wide')]);
 assert.equal(calls.length,6);assert.equal(new Set(calls).size,6);
 const value=cache.get(2,1,'en','wide');await cache.prepare(2,'en','wide');assert.equal(cache.get(2,1,'en','wide'),value);assert.equal(calls.length,6);
 await cache.prepare(2,'sr','wide');assert.equal(calls.length,12);
});
test('a moving sheet exposes destination artwork underneath it in both directions',()=>{
 assert.equal(typeof turnArtwork,'function');
 assert.deepEqual(turnArtwork(2,1),{left:[2,0],right:[3,1],front:[2,1],back:[3,0]});
 assert.deepEqual(turnArtwork(2,-1),{left:[1,0],right:[2,1],front:[1,1],back:[2,0]});
});
