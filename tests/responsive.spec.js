import { test, expect } from '@playwright/test';

const evidence = () => test.info().outputPath('evidence');
const viewports = [[320,568],[360,800],[390,844],[768,1024],[1024,768],[1280,720],[1363,936],[1440,900],[844,390],[682,468]];
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const overlap = (a,b) => Math.min(a.right,b.right)>Math.max(a.left,b.left)+1 && Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+1;

async function reachable(page, control, width, height) {
  await control.evaluate(el => el.scrollIntoView({ block:'center', behavior:'instant' }));
  await settle(page);
  await expect(control).toBeVisible();
  const box = await control.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
  expect(await control.evaluate(el => { const r=el.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return el===hit || el.contains(hit); })).toBe(true);
}

async function closeVisible(page, width, height) {
  const close = page.locator('#projectDialogClose');
  const box = await close.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y, 'Close stays visible after the dialog scrolls').toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(width);
  expect(box.y + box.height).toBeLessThanOrEqual(height);
  const content = await page.locator('.project-dialog-inner').boundingBox();
  expect(content.y, 'Persistent Close has reserved space above scrolling content').toBeGreaterThanOrEqual(box.y + box.height);
  expect(await close.evaluate(el => { const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)); })).toBe(true);
}

test('reflow dialog keeps Close reachable after long content is scrolled', async ({ page }) => {
  await page.setViewportSize({ width:682,height:468 });
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.goto('/');
  await page.locator('.hero-ctas [data-inquiry]').click();
  await page.locator('[data-project-type="polish"]').click();
  await page.locator('.project-dialog-inner').evaluate(el => { el.scrollTop=el.scrollHeight; });
  await closeVisible(page,682,468);
});

for (const language of ['en','sr']) {
  for (const [width,height] of viewports) {
    test(`${language} usable at ${width}x${height}${width===682?' (200% reflow equivalent)':''}`, async ({ page }) => {
      await page.setViewportSize({ width,height });
      await page.emulateMedia({ reducedMotion:'reduce' });
      await page.goto('/');
      if (language==='sr') await page.locator('.lang-switch').click();
      await page.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; });
      await page.evaluate(() => document.fonts.ready);
      const content = '.hero-promise,.hero-meta-left > p,.name-line,.project-copy,.project-status,.project-copy > p,.project-case,.project-case dt,.project-case dd,.project-tags,.service,.inc,.price-row,.start-step,.faq-item,.education-card,.facts,.contact-copy,.contact-intro,.contact-socials,.device-proof-label';
      const bad = await page.locator(content).evaluateAll(elements => elements.filter(el => el.getClientRects().length && getComputedStyle(el).visibility!=='hidden').flatMap(el => {
        const r=el.getBoundingClientRect();
        return r.left < -1 || r.right > innerWidth+1 || el.scrollWidth-el.clientWidth > 1 ? [{tag:el.tagName,class:el.className,text:el.textContent.slice(0,70),left:r.left,right:r.right,overflow:el.scrollWidth-el.clientWidth}]:[];
      }));
      expect(bad).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
      for (const summary of await page.locator('.project-case > summary').all()) await summary.click();
      await page.locator('.process-details > summary').click();
      const cards = await page.locator('.method-card').evaluateAll(elements => elements.map(el => {
        const rectangle = selector => el.querySelector(selector).getBoundingClientRect().toJSON();
        return {number:rectangle('.method-num'),state:rectangle('.method-state'),title:rectangle('h3'),overflow:el.scrollWidth-el.clientWidth};
      }));
      for (const card of cards) {
        expect(overlap(card.number,card.title), 'Method heading does not collide with its number').toBe(false);
        expect(overlap(card.state,card.title), 'Method heading does not collide with its state').toBe(false);
        expect(overlap(card.number,card.state), 'Method metadata has separate space').toBe(false);
        expect(card.overflow).toBeLessThanOrEqual(1);
      }
      const important = '.hero-ctas .cta,.svc-cta,.project-links a,#contact a[data-i18n="emailDirect"],#projectStarterInline,#projectStarterMobile';
      for (const action of await page.locator(important).all()) {
        if (await action.isVisible()) await reachable(page,action,width,height);
      }
      const targets = '.brand,.lang-switch,.menu-btn,.cta,.project-links a,.proof-links a,.contact-socials a,.project-case > summary,.faq-item > summary,.process-details > summary';
      for (const target of await page.locator(targets).all()) {
        if (!await target.isVisible()) continue;
        // Firefox's protocol boundingBox can round 44px to 43.99997px after scrolling.
        // Measure the DOM rectangle directly, retaining the exact 44px minimum.
        const box=await target.evaluate(el => el.getBoundingClientRect().toJSON());
        expect(box.width,`44px touch width: ${await target.getAttribute('class')}`).toBeGreaterThanOrEqual(44);
        expect(box.height,`44px touch height: ${await target.getAttribute('class')}`).toBeGreaterThanOrEqual(44);
      }
      for (const anchor of ['work','services','method','about','contact']) {
        await page.locator(`#${anchor}`).evaluate(el => { location.hash=el.id;el.scrollIntoView({block:'start',behavior:'instant'}); });
        await settle(page);
        const clearance = await page.locator(`#${anchor}`).evaluate(el => ({top:el.getBoundingClientRect().top,header:document.querySelector('.topbar').getBoundingClientRect().bottom}));
        expect(clearance.top,'Anchored content clears the fixed header').toBeGreaterThanOrEqual(clearance.header-1);
      }
      const opener=page.locator('.svc-cta').first();
      await opener.click();
      await expect(page.locator('#projectDialog')).toBeVisible();
      const inner=page.locator('.project-dialog-inner');
      expect(await inner.evaluate(el => el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
      for (const selector of ['#projectGoal','#projectCurrentUrl','#projectTiming','#projectMessagePreview','#projectEmail','#projectGmail','#projectCopyMessage','#projectLinkedIn']) {
        await reachable(page,page.locator(selector),width,height);
      }
      await inner.evaluate(el => { el.scrollTop=el.scrollHeight; });
      await closeVisible(page,width,height);
      await page.locator('#projectDialogClose').focus();
      await page.keyboard.press('Shift+Tab');
      await expect(page.locator('#projectLinkedIn')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.locator('#projectDialogClose')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(opener).toBeFocused();
      await opener.click();
      await expect(inner).toHaveJSProperty('scrollTop',0);
      await inner.evaluate(el => { el.scrollTop=el.scrollHeight; });
      await page.locator('#projectDialogClose').click();
      await expect(opener).toBeFocused();
      if ((language==='sr' && width===390)||(language==='en' && width===768)||(language==='sr' && width===1363)) {
        await page.locator('[data-project="honey"]').evaluate(el => scrollTo({top:scrollY+el.getBoundingClientRect().top-100,behavior:'instant'}));
        await settle(page);
        await page.screenshot({path:`${evidence()}/${language}-${width}-work.png`});
        await opener.click();
        await inner.evaluate(el => { el.scrollTop=el.scrollHeight; });
        await page.screenshot({path:`${evidence()}/${language}-${width}-dialog-scrolled.png`});
      }
    });
  }
}

test('phone browser-height changes preserve menu, sticky inquiry and dialog controls', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.locator('[data-project="honey"]').evaluate(el=>scrollTo({top:el.offsetTop,behavior:'instant'}));
  for(const height of [724,844,568]) {
    await page.setViewportSize({width:390,height});
    await reachable(page,page.locator('.menu-btn'),390,height);
    await expect(page.locator('#stickyCta')).toHaveAttribute('aria-hidden','false');
    await reachable(page,page.locator('#projectStarterSticky'),390,height);
    await page.locator('#projectStarterSticky').click();
    await page.locator('[data-project-type="website"]').click();
    await page.locator('.project-dialog-inner').evaluate(el=>{el.scrollTop=el.scrollHeight;});
    await closeVisible(page,390,height);
    await page.keyboard.press('Escape');
    await expect(page.locator('#projectStarterSticky')).toBeFocused();
  }
});
