import { test, expect } from '@playwright/test';
import { decodeLoadedImage } from './helpers/journey.js';

for (const language of ['en', 'sr']) {
  for (const width of [1363, 1280, 1440, 682]) {
    test(`Verification fits its card in ${language} at ${width}px${width === 682 ? ' (200% reflow equivalent)' : ''}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: width === 682 ? 468 : 936 });
      await page.goto('/');
      if (language === 'sr') await page.locator('.lang-switch').click();
      await page.locator('.process-details > summary').click();
      const card = page.locator('.method-card[data-i="4"]');
      await card.scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      await card.screenshot({ path: testInfo.outputPath('verification.png') });
      if (width >= 1280) {
        const title = await card.locator('h3').evaluate(el => ({ height: el.clientHeight, lineHeight: parseFloat(getComputedStyle(el).lineHeight) }));
        expect(title.height, 'Short checklist heading stays readable on one line').toBeLessThanOrEqual(title.lineHeight * 1.2);
      }
      const dimensions = await card.evaluate(el => {
        const card = el.getBoundingClientRect();
        return {
          overflow: el.scrollWidth - el.clientWidth,
          bounds: [...el.querySelectorAll('.verify-grid,.verify-item,.verify-item b,.verify-item i')].map(item => {
            const box = item.getBoundingClientRect();
            return { text: item.textContent, left: box.left - card.left, right: box.right - card.right, top: box.top - card.top, bottom: box.bottom - card.bottom, overflow: item.scrollWidth - item.clientWidth };
          })
        };
      });
      expect(dimensions.overflow).toBeLessThanOrEqual(1);
      for (const box of dimensions.bounds) {
        expect(box.left, box.text).toBeGreaterThanOrEqual(-1);
        expect(box.right, box.text).toBeLessThanOrEqual(1);
        expect(box.top, box.text).toBeGreaterThanOrEqual(-1);
        expect(box.bottom, box.text).toBeLessThanOrEqual(1);
        expect(box.overflow, box.text).toBeLessThanOrEqual(1);
      }
    });
  }
}

const editingEvidence = () => test.info().outputPath('evidence');

test('desktop process uses one concise sequence after project evidence', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/motion-ready/);
  const height = await page.locator('#anatomy').evaluate(el => el.offsetHeight / innerHeight);
  expect(height, 'Flagship sequence is bounded to the approved 200vh target').toBeLessThanOrEqual(2.01);
  expect(height).toBeGreaterThanOrEqual(1.99);
  expect(await page.locator('main > .hero + .work').count(), 'Work immediately follows the offer').toBe(1);
  await expect(page.locator('#method #anatomy')).toHaveCount(1);
  await expect(page.locator('.process-details')).not.toHaveAttribute('open');
  await expect(page.locator('.process-details .method-grid .method-card')).toHaveCount(6);
  await expect(page.locator('.process-details .manifesto')).toHaveCount(1);
});

for (const language of ['en', 'sr']) {
  for (const viewport of [{ width: 1363, height: 936 }, { width: 390, height: 844 }]) {
    test(`natural project framing and readable process in ${language} at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      if (language === 'sr') await page.locator('.lang-switch').click();
      for (const article of await page.locator('.project').all()) {
        const image = article.locator('img.shot');
        await image.scrollIntoViewIfNeeded();
        await decodeLoadedImage(image);
        const dimensions = await article.evaluate(el => {
          const image = el.querySelector('img');
          const preview = el.querySelector('.project-visual').getBoundingClientRect();
          const bar = el.querySelector('.browser-bar').getBoundingClientRect();
          return { imageWidth:image.offsetWidth, imageHeight:image.offsetHeight, ratio:image.naturalWidth/image.naturalHeight, previewHeight:preview.height, barHeight:bar.height, left:preview.left, right:preview.right, minHeight:getComputedStyle(el).minHeight };
        });
        expect(dimensions.imageWidth / dimensions.imageHeight).toBeCloseTo(dimensions.ratio, 2);
        expect(dimensions.previewHeight - dimensions.imageHeight - dimensions.barHeight, 'Framing follows the image, without empty viewport minimums').toBeLessThanOrEqual(4);
        expect(dimensions.left).toBeGreaterThanOrEqual(0);
        expect(dimensions.right).toBeLessThanOrEqual(viewport.width + 1);
        expect(dimensions.minHeight).toMatch(/^(0px|auto)$/);
      }
      const positions = await page.locator('#work,#services,#method,#about,#contact').evaluateAll(elements => elements.map(el => el.offsetTop));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
      const process = page.locator('#anatomy');
      await process.scrollIntoViewIfNeeded();
      if (viewport.width === 390) {
        await expect(page.locator('.anatomy-sticky')).toHaveCSS('position', 'relative');
        const boxes = await page.locator('.build-layer').evaluateAll(elements => elements.map(el => { const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}; }));
        for (const box of boxes) {
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(viewport.width + 1);
        }
        for (let i=1;i<boxes.length;i++) expect(boxes[i].top).toBeGreaterThanOrEqual(boxes[i-1].bottom - 1);
      }
      const secondary = '.cta,.navlinks a,.lang-switch,.availability,.hero-role,.project-case dt,.project-status,.tag,.term,.method-state,.method-meta,.verify-item,.build-layer > span:not(.mini-lines),.education-badges span,.education-meta i,.device-proof-label,.device-proof-label i,.proof-disclaimer,.project-dialog-note,.contact-channel small,.project-option small,.inquiry-help';
      expect(await page.locator(secondary).evaluateAll(elements => elements.every(el => parseFloat(getComputedStyle(el).fontSize) >= 12))).toBe(true);
      const body = '.project-copy > p,.project-case dd,.service > p,.faq-answer > p,.anatomy-head p,.method-copy p,.manifesto-copy p,.about-small';
      expect(await page.locator(body).evaluateAll(elements => elements.every(el => parseFloat(getComputedStyle(el).fontSize) >= 16))).toBe(true);
      for (const label of await page.locator('.device-proof-label,.device-proof-label b,.device-proof-label i,.term,.project-case dd').all()) {
        expect(await label.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      }
      const summary = page.locator('.process-details > summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('.method-card').first()).toBeVisible();
      await expect(page.locator('.manifesto')).toBeVisible();
      await summary.focus();
      await page.keyboard.press('Space');
      await expect(page.locator('.process-details')).not.toHaveAttribute('open');
      for (const anchor of ['work','services','method','about','contact','anatomy']) {
        await page.goto(`/#${anchor}`);
        await expect(page.locator(`#${anchor}`)).toBeVisible();
      }
      if ((language === 'en' && viewport.width === 1363) || (language === 'sr' && viewport.width === 390)) {
        await page.locator('.project').first().evaluate(el => scrollTo({ top:scrollY + el.getBoundingClientRect().top - 92, behavior:'instant' }));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.screenshot({ path:`${editingEvidence()}/${language}-${viewport.width}-work-after.png` });
        await process.evaluate(el => scrollTo({ top:scrollY + el.getBoundingClientRect().top + (document.documentElement.classList.contains('motion-static') ? -80 : (el.offsetHeight - innerHeight) * .4), behavior:'instant' }));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.screenshot({ path:`${editingEvidence()}/${language}-${viewport.width}-process-after.png` });
      }
    });
  }
}

test('no JavaScript: consolidated process notes preserve the technical content', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled:false, viewport:{ width:390, height:844 } });
  const page = await context.newPage();
  await page.goto('/#method');
  await expect(page.locator('#anatomy')).toBeVisible();
  const summary = page.locator('.process-details > summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.method-card').nth(4).locator('h3')).toBeVisible();
  await expect(page.locator('.method-card h3')).toHaveText(['Brief','Architecture','Interface','Motion','Verification','Ship']);
  await expect(page.locator('.manifesto-copy p')).toHaveCount(2);
  await summary.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.process-details')).not.toHaveAttribute('open');
  await context.close();
});
