import {test,expect} from '@playwright/test';
const settled=async(page,index)=>{await expect.poll(()=>page.locator('html').evaluate(el=>[el.dataset.bookState,el.dataset.spread].join(':')),{timeout:15000}).toBe(`open:${index}`);};

// Changing destination mid-turn must finish the physical turn without corrupting the spread.
test('real WebGL opens, turns, jumps, handles rapid input, resets and closes',async({page},info)=>{
 test.setTimeout(60000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('html')).toHaveClass(/scene-ready/);
 await page.screenshot({path:info.outputPath('closed.png')});
 await page.locator('#openBook').click();await settled(page,0);
 await page.locator('.physical-page [data-spread="1"]').first().click();await settled(page,1);
 await expect(page.locator('.physical-page').first()).toContainText('Harmonije');
 await page.locator('.physical-page [data-case="glas"]').click();await expect(page.locator('#caseDialog')).toBeVisible();
 await expect(page.locator('#caseContent')).toContainText('No production call routing');await page.keyboard.press('Escape');
 for(let i=0;i<5;i++)await page.keyboard.press('ArrowRight');
 for(let i=0;i<3;i++)await page.keyboard.press('ArrowLeft');
 await settled(page,2);
 await page.locator('#resetView').click();
 await page.locator('#chapterToggle').click();await page.locator('#chapterMenu [data-spread="5"]').click();await settled(page,5);
 await page.locator('.physical-page [data-inquiry]').click();await expect(page.locator('#projectDialog')).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('#closeBook').click();await expect(page.locator('html')).toHaveAttribute('data-book-state','closed');
 await page.locator('#openBook').click();await settled(page,5);expect(errors).toEqual([]);
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
test('real WebGL tablet uses readable HTML alongside the book preview',async({page})=>{
 await page.setViewportSize({width:768,height:900});await page.goto('/#book/4');await expect(page.locator('html')).toHaveClass(/scene-ready/);await settled(page,3);
 await expect(page.locator('#spreadReader')).toBeVisible();
 expect(await page.locator('#spreadReader .page-services p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(12);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
});
test('context loss preserves the current chapter and contact',async({page})=>{
 await page.goto('/#book/2');await expect(page.locator('html')).toHaveClass(/scene-ready/);await settled(page,1);
 await page.locator('#deskScene canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
 await expect(page.locator('html')).toHaveClass(/static-book/);await settled(page,1);await expect(page.locator('#spreadReader')).toContainText('Harmonije');
 await page.locator('.header-contact').click();await expect(page.locator('#projectDialog')).toBeVisible();
});

test('every real desktop spread fits its physical pages',async({page})=>{
 test.setTimeout(60000);await page.goto('/#book/1');await expect(page.locator('html')).toHaveClass(/scene-ready/);
 for(const language of ['en','sr']) {
  if(language==='sr')await page.locator('.lang-switch').click();
  for(let i=0;i<6;i++) {
   await page.locator('#chapterToggle').click();await page.locator(`#chapterMenu [data-spread="${i}"]`).click();await settled(page,i);
   for(const article of await page.locator('.physical-page .book-page').all())expect(await article.evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(1);
  }
 }
});
