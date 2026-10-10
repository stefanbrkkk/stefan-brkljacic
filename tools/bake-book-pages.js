/* global document */
import {chromium} from '@playwright/test';
import sharp from 'sharp';
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {relative} from 'node:path';
import {createHash} from 'node:crypto';
import {spreadHTML,projectImages} from '../scripts/book-content.js';
const target='assets/book-pages';await mkdir(target,{recursive:true});
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
// Font requests must originate on the dev server, not an opaque about:blank document.
await page.route('**/*',route=>route.request().resourceType()==='script'?route.abort():route.continue());
await page.goto('http://127.0.0.1:4173');
const stylePaths=['styles/site.css','styles/mobile.css','styles/book.css','styles/book-v2.css'];
const styles=await Promise.all(stylePaths.map(path=>readFile(path,'utf8')));
await page.setContent(`<html><head><base href="http://127.0.0.1:4173/styles/"><style>${styles.join('\n')}</style></head><body></body></html>`);
const overflow=[];
for(const mode of ['wide','compact'])for(const lang of ['en','sr'])for(let index=0;index<6;index++)for(let side=0;side<2;side++){
 const markup=spreadHTML(index,lang)[side].replaceAll(`file://${process.cwd()}/`,'http://127.0.0.1:4173/');
 await page.evaluate(async({markup,lang,mode,side})=>{
  document.documentElement.lang=lang;
  document.body.innerHTML=(side?'<div class="physical-page" hidden></div>':'')+`<div class="physical-page ${mode==='compact'?'compact-folio':''}" id="artwork">${markup}</div>`;
  Object.assign(document.body.style,{margin:'0',padding:'0',width:'600px',height:'838px',overflow:'hidden',background:'#f4f0e8'});
  Object.assign(document.getElementById('artwork').style,{position:'absolute',top:'0',left:'0',width:'600px',height:'838px'});
  document.getElementById('artwork').getBoundingClientRect();await document.fonts.ready;if([...document.fonts].some(font=>font.status==='error'))throw new Error('A local font failed to load');await Promise.all([...document.images].map(img=>img.decode()));
 },{markup,lang,mode,side});
 const article=page.locator('#artwork .book-page');const extra=await article.evaluate(e=>e.scrollHeight-e.clientHeight);if(extra>1)overflow.push({mode,lang,index,side,extra});
 const png=await article.screenshot({animations:'disabled'});await sharp(png).webp({quality:94,effort:5}).toFile(`${target}/${lang}-${mode}-${index}-${side}.webp`);
 console.log(`${lang}/${mode}/${index}/${side}: ${extra}px overflow`);
}
await browser.close();
const fonts=(await readdir('assets/fonts')).filter(name=>name.endsWith('.woff2')).sort().map(name=>`assets/fonts/${name}`);
const sources=[...stylePaths,'scripts/book-content.js','scripts/content.js','tools/bake-book-pages.js','assets/scene-v2/paper-grain.svg',...Object.values(projectImages).map(url=>relative(process.cwd(),fileURLToPath(url))),...fonts];
const hash=createHash('sha256');for(const path of sources)hash.update(await readFile(path));
await writeFile(`${target}/manifest.json`,JSON.stringify({sourceHash:hash.digest('hex'),sources,dimensions:[600,838],pages:48,overflow},null,2)+'\n');
if(overflow.length)throw new Error(`Page artwork overflow: ${JSON.stringify(overflow)}`);
