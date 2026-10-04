import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { decodeLoadedImage, watchNormalJourney } from './helpers/journey.js';

const devices = [
  ['phone', { width:390, height:844 }],
  ['tablet', { width:820, height:1180 }],
  ['laptop', { width:1363, height:936 }],
];


for (const [device, viewport] of devices) {
  for (const language of ['en','sr']) {
    test(`normal ${language} ${device} journey has no site errors or missing local assets`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      const evidence = watchNormalJourney(page);
      await page.addInitScript(() => {
        window.journeyRejections = [];
        addEventListener('unhandledrejection', event => window.journeyRejections.push(String(event.reason)));
      });
      await page.goto('/');
      await expect(page.locator('html')).toHaveClass(/inquiry-ready/);
      // Exercise both dictionary assignments in every normal flow.
      await page.locator('.lang-switch').click();
      if (language === 'en') await page.locator('.lang-switch').click();
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      if (viewport.width <= 980) {
        await page.locator('.menu-btn').click();
        await page.locator('#mobileMenu a[href="#work"]').click();
        await expect(page.locator('#mobileMenu')).toHaveAttribute('inert', '');
        await expect(page.locator('#mobileMenu')).toHaveCSS('visibility', 'hidden');
      }
      await page.locator('.project').first().evaluate(el => scrollTo({top:scrollY+el.getBoundingClientRect().top-100,behavior:'instant'}));
      await decodeLoadedImage(page.locator('.project').first().locator('img'));
      await expect(page.locator('.project').first().locator('.project-copy')).toHaveCSS('opacity', '1');
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({path:testInfo.outputPath(`${device}-${language}-work.png`)});
      const study = page.locator('.project-case').first();
      await study.locator('summary').click();
      await expect(study).toHaveAttribute('open', '');
      await study.locator('summary').click();
      const faq = page.locator('.faq-item').first();
      await faq.locator('summary').click();
      await expect(faq).toHaveAttribute('open', '');
      await faq.locator('summary').click();
      await page.locator('.process-details summary').click();
      await expect(page.locator('.process-details')).toHaveAttribute('open', '');
      await page.locator('.process-details summary').click();
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await decodeLoadedImage(image);
      }
      await page.evaluate(() => document.fonts.ready);
      const inline = page.locator('#projectStarterInline');
      const opener = await inline.isVisible() ? inline : page.locator('#projectStarterMobile');
      await opener.click();
      await expect(page.locator('#projectDialog')).toBeVisible();
      await page.locator('#projectGoal').fill('A catalogue for č / & + ?');
      const draft = new URL(await page.locator('#projectEmail').getAttribute('href'));
      expect(draft.searchParams.get('body')).toContain('A catalogue for č / & + ?');
      await page.keyboard.press('Escape');
      await expect(opener).toBeFocused();
      await expect(page.locator('#contact a[href="mailto:stefanbrkk@gmail.com"]').first()).toHaveAttribute('href','mailto:stefanbrkk@gmail.com');
      expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
      const rejections = await page.evaluate(() => window.journeyRejections);
      await writeFile(testInfo.outputPath('normal-journey.json'), JSON.stringify({device,viewport,language,...evidence,rejections},null,2));
      for (const errors of Object.values(evidence)) expect(errors).toEqual([]);
      expect(rejections).toEqual([]);
    });
  }
}

