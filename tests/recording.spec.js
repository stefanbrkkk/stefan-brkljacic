import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { watchNormalJourney } from './helpers/journey.js';

test.use({ video:'on', trace:'on' });
test('actual desktop scroll updates visible animation and resets on reduced motion', async ({ page }, testInfo) => {
  await page.setViewportSize({width:1363,height:936});
  const evidence = watchNormalJourney(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/motion-ready/);
  await page.mouse.wheel(0,250);
  await page.waitForTimeout(350);
  const anatomy = page.locator('#anatomy');
  await anatomy.evaluate(el => scrollTo({top:el.offsetTop,behavior:'instant'}));
  await page.waitForTimeout(350);
  const samples = [];
  for (const progress of [.15,.4,.7,.9]) {
    await anatomy.evaluate((el,p) => scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*p,behavior:'smooth'}),progress);
    await page.waitForTimeout(650);
    samples.push(await page.locator('.build-layer').first().evaluate(el => el.style.transform));
  }
  expect(new Set(samples).size).toBeGreaterThan(1);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(() => page.locator('.build-layer').evaluateAll(elements => elements.every(el => !el.style.transform))).toBe(true);
  await page.waitForTimeout(600);
  await writeFile(testInfo.outputPath('motion-samples.json'),JSON.stringify({samples,...evidence},null,2));
  for (const errors of Object.values(evidence)) expect(errors).toEqual([]);
});
