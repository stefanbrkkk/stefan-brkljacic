import { test, expect } from '@playwright/test';
import { decodeLoadedImage, watchNormalJourney } from './helpers/journey.js';

test.use({ hasTouch: true });
for (const width of [320,390]) {
  for (const language of ['en','sr']) {
    test(`mobile presentation is uncluttered and previews keep their pixels in ${language} at ${width}px`, async ({ page }, testInfo) => {
      const errors=watchNormalJourney(page);
      await page.setViewportSize({width,height:width===320?568:844});
      await page.goto('/');
      await expect(page.locator('html')).toHaveClass(/inquiry-ready/);
      if(language==='sr') await page.locator('.lang-switch').click();
      await expect(page.locator('.hero-mobile-role')).toBeVisible();
      for(const selector of ['.hero-web-object','.hero-grid','.hero-meta p','.hero-bottom']) await expect(page.locator(selector)).toBeHidden();
      await expect(page.locator('.hero-promise')).toBeVisible();
      await expect(page.locator('.hero-ctas [data-inquiry]')).toBeVisible();
      await page.screenshot({path:testInfo.outputPath('hero.png')});
      await page.locator('.proof-responsive').scrollIntoViewIfNeeded();
      for(const img of await page.locator('.device-proof img').all()) {
        await img.scrollIntoViewIfNeeded();
        await decodeLoadedImage(img);
        const geometry=await img.evaluate(el=>{const r=el.getBoundingClientRect();return {rendered:r.width/r.height,native:el.naturalWidth/el.naturalHeight,radius:parseFloat(getComputedStyle(el).borderTopLeftRadius)};});
        expect(Math.abs(geometry.rendered-geometry.native),'The entire capture keeps its native aspect ratio').toBeLessThan(.005);
        expect(geometry.radius,'Image corners are clipped inside the frame').toBeGreaterThan(0);
      }
      const positions=await page.locator('.tablet-proof,.phone-proof').evaluateAll(elements=>elements.map(el=>el.getBoundingClientRect().top));
      expect(Math.abs(positions[0]-positions[1]),'Small-device labels start on the same line').toBeLessThan(1);
      for(const proof of await page.locator('.device-proof').all()) {
        await expect(proof).toHaveCSS('transform','none');
        await expect(proof.locator('.device-proof-label .sr-only')).toHaveClass('sr-only');
      }
      const details=page.locator('.proof-provenance');
      await expect(details).not.toHaveAttribute('open','');
      await page.locator('.proof-responsive').screenshot({path:testInfo.outputPath('previews.png'),style:'.topbar,.skip-link,.sticky-cta { visibility:hidden !important; }'});
      await details.locator('summary').click();
      await expect(details.locator('.proof-disclaimer')).toBeVisible();
      await expect(details.locator('.proof-disclaimer')).toContainText('1440×900');
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
      for(const values of Object.values(errors)) expect(values).toEqual([]);
    });
  }
}
