import {test,expect} from '@playwright/test';
const settled=async(page,index)=>{await expect.poll(()=>page.locator('html').evaluate(el=>[el.dataset.bookState,el.dataset.spread].join(':')),{timeout:30000}).toBe(`open:${index}`);};

// Detect runner capability separately from application initialization failures.
const edition=async page=>{
 await expect(page.locator('html')).toHaveClass(/scene-ready|static-book/,{timeout:30000});
 const dynamic=await page.locator('html').evaluate(el=>el.classList.contains('scene-ready'));
 if(!dynamic){
  const capable=await page.evaluate(()=>{const gl=document.createElement('canvas').getContext('webgl2');if(gl)gl.getExtension('WEBGL_lose_context')?.loseContext();return !!gl;});
  expect(capable,'A capable renderer must initialize; fallback cannot conceal application errors').toBe(false);
 }
 return dynamic;
};

// Changing destination mid-turn must finish the physical turn without corrupting the spread.
test('book opens, turns, jumps, handles rapid input, resets and closes in the available edition',async({page},info)=>{
 test.setTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');const dynamic=await edition(page),pages=dynamic?'.physical-page':'#spreadReader';
 const uploaded=await page.locator('#deskScene').getAttribute('data-artwork-uploads');if(dynamic)expect(uploaded).toBe('12');
 await page.screenshot({path:info.outputPath('closed.png')});
 await page.locator('#openBook').click();await settled(page,0);
 await page.locator(`${pages} [data-spread="1"]`).first().click();await settled(page,1);
 await expect(page.locator(pages).first()).toContainText('Harmonije');
 await page.locator(`${pages} [data-case="glas"]`).click();await expect(page.locator('#caseDialog')).toBeVisible();
 await expect(page.locator('#caseContent')).toContainText('No production call routing');await page.keyboard.press('Escape');
 for(let i=0;i<5;i++)await page.keyboard.press('ArrowRight');
 for(let i=0;i<3;i++)await page.keyboard.press('ArrowLeft');
 await settled(page,2);
 await page.locator('#resetView').click();
 await page.locator('#chapterToggle').click();await page.locator('#chapterMenu [data-spread="5"]').click();await settled(page,5);
 await page.locator(`${pages} [data-inquiry]`).click();await expect(page.locator('#projectDialog')).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('#closeBook').click();await expect(page.locator('html')).toHaveAttribute('data-book-state','closed',{timeout:30000});
 await page.locator('#openBook').click();await settled(page,5);expect(errors).toEqual([]);if(dynamic)expect(await page.locator('#deskScene').getAttribute('data-artwork-uploads')).toBe(uploaded);
});
for(const width of [360,390,430,768,1024,1440,1920]) {
 test(`readable portfolio and all links at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#book/2');await settled(page,1);
  await expect(page.locator('#spreadReader')).toBeVisible();
  for(const link of await page.locator('#spreadReader .page-actions a').all()) {await expect(link).toHaveAttribute('href',/^https:/);await expect(link).toHaveAttribute('target','_blank');}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.locator('.header-contact').click();await expect(page.locator('#projectDialog')).toBeVisible();
  await page.locator('#projectGoal').fill('Website & Željko');await page.locator('#projectMessagePreview').fill('Hello\nMy project');
  expect(new URL(await page.locator('#projectEmail').getAttribute('href')).searchParams.get('body')).toContain('Website & Željko');await page.keyboard.press('Escape');
  await page.locator('#readingToggle').click();await expect(page.locator('#readingContent')).toBeVisible();
  await expect(page.locator('#readingContent .project')).toHaveCount(4);await expect(page.locator('.faq-item')).toHaveCount(4);
  await page.locator('#readingBack').click();await expect(page.locator('#readingContent')).toBeHidden();
 });
}
test('Serbian translates spreads, controls and inquiry without losing position',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#book/3');await settled(page,2);
 await page.locator('.lang-switch').click();await expect(page.locator('html')).toHaveAttribute('lang','sr');
 await expect(page.locator('#spreadReader')).toContainText('Slanje je simulirano');
 await expect(page.locator('#nextSpread')).toHaveAttribute('aria-label','Sledeći dvostrani prikaz');
 await page.locator('#readingToggle').click();await expect(page.locator('.education-copy')).toContainText('Deveta beogradska');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','sr');await settled(page,2);
});
test('WebGL initialization failure provides complete static edition',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};});
 await page.goto('/');await expect(page.locator('html')).toHaveClass(/static-book/);
 await page.locator('#openBook').click();await settled(page,0);
 await page.locator('#spreadReader [data-spread="5"]').click();await settled(page,5);
 await expect(page.locator('#spreadReader')).toContainText('stefanbrkk@gmail.com');
});
test('no JavaScript retains every project, case study and direct contact',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();await page.goto('/');
 await expect(page.locator('#readingContent')).toBeVisible();await expect(page.locator('.project')).toHaveCount(4);
 await page.locator('.project-case summary').first().click();await expect(page.locator('.project-case').first()).toHaveAttribute('open','');
 await expect(page.locator('.header-contact')).toHaveAttribute('href','mailto:stefanbrkk@gmail.com');await context.close();
});
test('all six chapters retain their content in both languages',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 for(const language of ['en','sr']) {
  if(language==='sr')await page.locator('.lang-switch').click();
  for(let i=0;i<6;i++) {
   await page.goto(`/#book/${i+1}`);await settled(page,i);
   await expect(page.locator('#spreadReader .book-page')).toHaveCount(2);
   expect(await page.locator('#spreadReader').innerText()).not.toMatch(/undefined|NaN/);
   expect(await page.locator('#spreadReader .book-page').evaluateAll(es=>es.map(e=>e.scrollHeight-e.clientHeight))).toEqual([0,0]);
  }
 }
});

test('mobile navigation returns to the new spread heading',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#book/3');
 await page.evaluate(()=>scrollTo(0,900));await page.locator('#nextSpread').click();await settled(page,3);
 expect(await page.evaluate(()=>scrollY)).toBe(0);
 await expect(page.locator('#bookStatus')).toContainText('Services');
});
test('real WebGL tablet keeps a readable leaf in the interactive book',async({page})=>{
 await page.setViewportSize({width:768,height:900});await page.goto('/#book/4');test.skip(!await edition(page),'Runner does not support WebGL2; static edition is covered by the primary journey');await settled(page,3);
 await expect(page.locator('#spreadReader')).toBeHidden();
 await expect(page.locator('html')).toHaveClass(/compact-book/);
 expect(await page.locator('.physical-page:not([inert]) .page-services p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(22);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
});
test('context loss preserves the current chapter and contact',async({page})=>{
 await page.goto('/#book/2');test.skip(!await edition(page),'Runner does not support WebGL2; static recovery path is tested separately');await settled(page,1);
 await page.locator('#deskScene canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
 await expect(page.locator('html')).toHaveClass(/static-book/);await settled(page,1);await expect(page.locator('#spreadReader')).toContainText('Harmonije');
 await page.locator('.header-contact').click();await expect(page.locator('#projectDialog')).toBeVisible();
});

test('every real desktop spread fits its physical pages',async({page})=>{
 test.setTimeout(120000);await page.goto('/#book/1');test.skip(!await edition(page),'Runner does not support WebGL2; HTML spreads are covered in both languages');
 for(const language of ['en','sr']) {
  if(language==='sr')await page.locator('.lang-switch').click();
  for(let i=0;i<6;i++) {
   await page.locator('#chapterToggle').click();await page.locator(`#chapterMenu [data-spread="${i}"]`).click();await settled(page,i);
   for(const article of await page.locator('.physical-page .book-page').all())expect(await article.evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(1);
  }
 }
});

for(const viewport of [{width:390,height:844},{width:1440,height:600}])test(`compact book presents every leaf without rebuilding artwork at ${viewport.width}x${viewport.height}`,async({page})=>{
 test.setTimeout(180000);await page.setViewportSize(viewport);await page.goto('/#book/1');test.skip(!await edition(page),'Runner lacks WebGL2; full static journeys remain covered');await settled(page,0);
 const uploads=await page.locator('#deskScene').getAttribute('data-artwork-uploads');expect(uploads).toBe('12');
 for(let leaf=0;leaf<12;leaf++){
  await settled(page,Math.floor(leaf/2));await expect(page.locator('html')).toHaveAttribute('data-leaf',String(leaf%2));
  await expect(page.locator('.physical-page:not([inert])')).toHaveCount(1);await expect(page.locator('.physical-page:not([inert])')).toHaveAttribute('data-side',String(leaf%2));await expect(page.locator('#spreadReader')).toBeHidden();
  expect(await page.locator('.physical-page:not([inert]) .book-page').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  if(leaf<11)await page.locator('#nextSpread').click();
 }
 expect(await page.locator('#deskScene').getAttribute('data-artwork-uploads')).toBe(uploads);await expect(page.locator('#nextSpread')).toBeDisabled();
 await page.locator('.header-contact').click();await expect(page.locator('#projectDialog')).toBeVisible();
});

test('resize during a physical turn keeps prepared pages and finishes in the new layout',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/#book/2');test.skip(!await edition(page),'Runner lacks WebGL2');await settled(page,1);
 await page.locator('#nextSpread').click();await expect(page.locator('html')).toHaveAttribute('data-book-state','turning');
 await page.setViewportSize({width:390,height:844});await settled(page,2);
 await expect(page.locator('.physical-page.compact-folio')).toHaveCount(2);
 await expect(page.locator('#deskScene')).toHaveAttribute('data-artwork-uploads','24');
 await expect(page.locator('.physical-page:not([inert])')).toContainText('Gimnastika');
 await page.locator('#nextSpread').click();await expect(page.locator('.physical-page:not([inert])')).toContainText('Sheetpost');
 await page.setViewportSize({width:1440,height:900});await expect(page.locator('.physical-page.compact-folio')).toHaveCount(0);
 await page.locator('#nextSpread').click();await settled(page,3);expect(errors).toEqual([]);
});

for(const lang of ['en','sr'])test(`case studies provide decoded full-image previews in ${lang}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#book/2');await settled(page,1);
 if(lang==='sr')await page.locator('.lang-switch').click();
 for(const [id,spread] of [['honey',1],['glas',1],['gym',2],['sheet',2]]){
  if(spread===2){await page.locator('#chapterToggle').click();await page.locator('#chapterMenu [data-spread="2"]').click();await settled(page,2);}
  await page.locator(`#spreadReader [data-case="${id}"]`).click();const image=page.locator('#caseDialog .case-preview img');await expect(image).toBeVisible();
  await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  expect(await page.locator('#caseDialog .case-preview a').getAttribute('href')).toBe(await page.locator(`#spreadReader .project-art.art-${id}`).getAttribute('href'));
  await expect(page.locator('#caseDialog .case-preview a')).toHaveAttribute('target','_blank');
  await expect(page.locator('#caseDialog .case-preview a')).toContainText(lang==='sr'?'Otvori':'View');await page.keyboard.press('Escape');
 }
});

test('compact cover intro clears the header and contents opens the named project leaf',async({page})=>{
 test.setTimeout(120000);await page.setViewportSize({width:390,height:844});await page.goto('/');test.skip(!await edition(page),'Runner lacks WebGL2');
 const bottom=await page.locator('.book-header').evaluate(e=>e.getBoundingClientRect().bottom);
 expect(await page.locator('.book-eyebrow').evaluate(e=>e.getBoundingClientRect().top)).toBeGreaterThan(bottom+8);
 await page.locator('#openBook').click();await settled(page,0);await page.locator('.physical-page:not([inert]) .page-contents button').filter({hasText:'GlasAI'}).click();await settled(page,1);
 await expect(page.locator('.physical-page:not([inert]) h2')).toHaveText('GlasAI');
});

test('opening before the 3D module is ready preserves the physical cover animation',async({page})=>{
 test.setTimeout(120000);let release;const gate=new Promise(resolve=>{release=resolve;});
 await page.route('**/scripts/book-scene.js*',async route=>{await gate;await route.continue();});
 try{
  await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('#openBook').click();
  await expect(page.locator('html')).toHaveAttribute('data-book-state','opening');release();
  test.skip(!await edition(page),'Runner lacks WebGL2; static opening is covered separately');await settled(page,0);
 }finally{release();}
});

for(const width of [390,1440])test(`physical project images and visit buttons open their websites at ${width}px`,async({page,context})=>{
 test.setTimeout(120000);await page.setViewportSize({width,height:900});await page.goto('/#book/2');test.skip(!await edition(page),'Runner lacks WebGL2');await settled(page,1);
 const active=width<900?'.physical-page:not([inert])':'.physical-page[data-side="0"]';
 for(const selector of ['.project-art','.page-actions a']){
  const link=page.locator(`${active} ${selector}`),url=await link.getAttribute('href');
  await context.route(url,route=>route.fulfill({contentType:'text/html',body:'<title>Project destination</title>'}));
  const popupPromise=context.waitForEvent('page');await link.click();const popup=await popupPromise;await popup.waitForLoadState();expect(popup.url()).toBe(url);await popup.close();
  await settled(page,1);
 }
 await page.locator(`${active} [data-case="honey"]`).click();const caseLink=page.locator('#caseDialog .case-preview a'),url=await caseLink.getAttribute('href');
 const popupPromise=context.waitForEvent('page');await caseLink.click();const popup=await popupPromise;await popup.waitForLoadState();expect(popup.url()).toBe(url);await popup.close();await page.keyboard.press('Escape');await settled(page,1);
});
for(const width of [390,1440])test(`clicking the paper advances the book at ${width}px`,async({page})=>{
 test.setTimeout(120000);await page.setViewportSize({width,height:900});await page.goto('/#book/1');test.skip(!await edition(page),'Runner lacks WebGL2');await settled(page,0);
 await page.waitForTimeout(700);
 await page.locator('.physical-page[data-side="0"] h2').click();
 if(width<900){await expect(page.locator('html')).toHaveAttribute('data-leaf','1');await page.waitForTimeout(700);await page.locator('.physical-page:not([inert]) .page-kicker').click();}
 await settled(page,1);
});

test('language changes commit their printed artwork after the moving sheet settles',async({page})=>{
 test.setTimeout(120000);await page.setViewportSize({width:1440,height:900});await page.goto('/#book/2');test.skip(!await edition(page),'Runner lacks WebGL2');await settled(page,1);
 await page.locator('#nextSpread').click();await expect(page.locator('html')).toHaveAttribute('data-book-state','turning');await page.locator('.lang-switch').click();
 await expect(page.locator('html')).toHaveAttribute('lang','sr');
 if(await page.locator('html').getAttribute('data-book-state')==='turning')await expect(page.locator('#deskScene')).toHaveAttribute('data-artwork-language','en');
 await settled(page,2);await expect(page.locator('#deskScene')).toHaveAttribute('data-artwork-language','sr',{timeout:30000});
 await expect(page.locator('.physical-page[data-side="0"] h2')).toContainText('Gimnastika');
});

test('a prepared resize cannot discard a slower language change during a turn',async({page})=>{
 test.setTimeout(120000);let release;const gate=new Promise(resolve=>{release=resolve;});
 await page.route('**/assets/book-pages/sr-*.webp',async route=>{await gate;await route.continue();});
 try{
  await page.setViewportSize({width:1440,height:900});await page.goto('/#book/2');test.skip(!await edition(page),'Runner lacks WebGL2');await settled(page,1);
  await page.evaluate(async()=>{document.querySelector('#nextSpread').click();while(document.documentElement.dataset.bookState!=='turning')await new Promise(requestAnimationFrame);document.querySelector('.lang-switch').click();});
  await page.setViewportSize({width:390,height:900});await settled(page,2);
  await expect.poll(async()=>Number(await page.locator('#deskScene').getAttribute('data-artwork-uploads')),{timeout:30000}).toBe(24);
  release();await expect(page.locator('#deskScene')).toHaveAttribute('data-artwork-language','sr',{timeout:30000});await expect(page.locator('.physical-page:not([inert])')).toHaveCount(1,{timeout:30000});await expect(page.locator('.physical-page:not([inert])')).toHaveClass(/compact-folio/);await expect(page.locator('.physical-page:not([inert]) h2')).toContainText('Gimnastika');
 }finally{release();}
});

test('reopening to another chapter prepares its inner cover page before the reveal',async({page})=>{
 test.setTimeout(120000);await page.goto('/#book/2');test.skip(!await edition(page),'Runner lacks WebGL2');await settled(page,1);
 await page.locator('#closeBook').click();await expect(page.locator('html')).toHaveAttribute('data-book-state','closing');await page.keyboard.press('ArrowRight');
 await expect.poll(()=>page.locator('html').evaluate(el=>[el.dataset.bookState,el.dataset.spread].join(':')),{timeout:30000}).toBe('opening:2');
 await expect(page.locator('.physical-page[data-side="0"] h2')).toContainText('Gimnastika');await expect(page.locator('html')).toHaveAttribute('data-book-state','opening');await settled(page,2);
});
