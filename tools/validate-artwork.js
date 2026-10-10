import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await readFile('assets/book-pages/manifest.json','utf8'));const hash=createHash('sha256');
for(const source of manifest.sources)hash.update(await readFile(source));
if(hash.digest('hex')!==manifest.sourceHash)throw new Error('Page designs changed. Run npm run artwork with the development server running, then commit the updated artwork.');
if(manifest.overflow.length)throw new Error('Page artwork contains clipped content.');
for(const lang of ['en','sr'])for(const mode of ['wide','compact'])for(let index=0;index<6;index++)for(let side=0;side<2;side++)if(!(await stat(`assets/book-pages/${lang}-${mode}-${index}-${side}.webp`)).size)throw new Error('Missing page artwork.');
console.log('48 baked page faces match the current bilingual wide/compact designs, with no overflow.');
