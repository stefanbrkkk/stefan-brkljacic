import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const evidence = () => test.info().outputPath('evidence');
const scenes = '.name-letter,.hero-grid,.hero-web-object,.web-rig,[data-web-layer],.web-cursor,.web-tag,.project-visual,.service,.build-browser,.build-layer,.ship-badge,#anatomyProgress';
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const enter = async (page, selector, progress = 0) => {
  await page.evaluate(({ selector, progress }) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.querySelector(selector);
    scrollTo(0, scrollY + el.getBoundingClientRect().top + (el.offsetHeight - innerHeight) * progress);
  }, { selector, progress });
  await settle(page);
};
const assertStatic = async page => {
  await expect(page.locator('[data-i18n="anatomyText"]')).not.toContainText(/Scroll|Skroluj/);
  await expect.poll(() => page.locator(scenes).evaluateAll(elements => elements.every(el => !el.style.transform && !el.style.filter && !el.style.clipPath))).toBe(true);
  await expect.poll(() => page.locator('[data-reveal]').evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1'))).toBe(true);
  expect(await page.locator('.build-layer').evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1' && el.getBoundingClientRect().height > 0))).toBe(true);
  await page.dispatchEvent('.hero', 'pointermove', { clientX: 300, clientY: 200 });
  await page.dispatchEvent('.service', 'pointermove', { clientX: 300, clientY: 200 });
  await page.dispatchEvent('.brand', 'pointermove', { clientX: 100, clientY: 40 });
  await page.dispatchEvent('#projectSignal', 'pointermove', { clientX: 300, clientY: 200 });
  await settle(page);
  expect(await page.locator(`${scenes},.brand,#projectSignal`).evaluateAll(elements => elements.every(el => !el.style.transform && !el.style.getPropertyValue('--mx') && !el.style.getPropertyValue('--ry')))).toBe(true);
};

for (const [name, selector, progress] of [['hero', '.hero', .4], ['projects', '.project', 0], ['services', '#services', 0], ['anatomy', '.anatomy', .4]]) {
  test(`reduced motion toggled mid-scroll resets ${name} and pointer effects`, async ({ page }) => {
    await page.goto('/');
    await enter(page, selector, progress);
    await page.screenshot({ path: `${evidence()}/animated-${name}.png` });
    const affected = name === 'hero' ? '.name-letter' : name === 'projects' ? '.project-visual' : name === 'services' ? '.service' : '.build-layer';
    expect(await page.locator(affected).evaluateAll(elements => elements.some(el => el.style.transform))).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await assertStatic(page);
    if (name === 'anatomy') {
      await page.locator('#anatomy').scrollIntoViewIfNeeded();
      await mkdir(evidence(), { recursive: true });
      await page.locator('#anatomy').screenshot({ path: `${evidence()}/reduced-anatomy.png` });
    }
  });
}

test('reduced motion at startup shows essential content without scene transforms', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await assertStatic(page);
  await page.screenshot({ path: `${evidence()}/reduced-startup.png` });
});

for (const [name, viewport] of [['narrow', { width: 390, height: 844 }], ['short-height', { width: 1280, height: 640 }]]) {
  test(`${name} resize clears mid-scroll animation and lays out static anatomy`, async ({ page }) => {
    await page.goto('/');
    await enter(page, '.anatomy', .4);
    await page.setViewportSize(viewport);
    await assertStatic(page);
    await page.locator('#anatomy').scrollIntoViewIfNeeded();
    await page.locator('#anatomy').screenshot({ path: `${evidence()}/${name}-anatomy.png` });
    const layout = await page.locator('.build-layer').evaluateAll(elements => elements.map(el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width:r.width };
    }));
    for (const card of layout) {
      expect(card.width).toBeCloseTo(layout[0].width, 0);
      expect(card.left).toBeGreaterThanOrEqual(0);
      expect(card.right).toBeLessThanOrEqual(viewport.width);
    }
    for (let i = 1; i < layout.length; i++) expect(layout[i].top).toBeGreaterThanOrEqual(layout[i - 1].bottom - 1);
  });
}

test('coarse-pointer change clears scenes and touch projects stay static (Chromium CDP only)', async ({ page, browserName }) => {
  // Playwright exposes CDP only in Chromium; coarse-pointer startup is tested in every engine below.
  test.skip(browserName !== 'chromium', 'Mid-session pointer capability emulation requires Chromium CDP; Firefox/WebKit capability changes remain unverified.');
  await page.goto('/');
  await enter(page, '.project');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await expect.poll(() => page.evaluate(() => matchMedia('(pointer:coarse)').matches)).toBe(true);
  await assertStatic(page);
  await enter(page, '.project');
  await page.locator('.project').first().screenshot({ path: `${evidence()}/coarse-project.png` });
});

test.describe('touch startup', () => {
  test.use({ hasTouch:true });
  test('coarse pointer at startup uses static content', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => matchMedia('(pointer:coarse)').matches)).toBe(true);
    await assertStatic(page);
  });
});

test('restoring full motion after a preference change resumes only visible scenes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => page.locator('.name-letter').first().evaluate(el => el.style.transform !== '')).toBe(true);
  expect(await page.locator('.project-visual,.service,.build-layer').evaluateAll(elements => elements.every(el => !el.style.transform))).toBe(true);
});

test('scroll bursts use one RAF and offscreen scenes make no style writes', async ({ page }) => {
  await page.goto('/');
  await enter(page, '#contact');
  await page.evaluate(() => {
    window.styleWrites = [];
    window.styleObserver = new MutationObserver(records => window.styleWrites.push(...records.map(record => record.target.className)));
    window.styleObserver.observe(document.getElementById('main'), { subtree: true, attributes: true, attributeFilter: ['style'] });
    window.rafRequests = 0;
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = callback => { window.rafRequests++; return raf(callback); };
    for (let i = 0; i < 12; i++) dispatchEvent(new Event('scroll'));
  });
  await expect.poll(() => page.evaluate(() => window.rafRequests)).toBeGreaterThan(0);
  const requests = await page.evaluate(() => window.rafRequests);
  expect(requests).toBe(1);
  await page.mouse.wheel(0, -180);
  await page.waitForTimeout(180);
  const trace = await page.evaluate(() => ({ rafRequests: window.rafRequests, offscreenStyleWrites: window.styleWrites, scrollY, viewport: { width: innerWidth, height: innerHeight } }));
  expect(trace.offscreenStyleWrites).toEqual([]);
  expect(await page.locator(scenes).evaluateAll(elements => elements.every(el => getComputedStyle(el).willChange === 'auto'))).toBe(true);
  await writeFile(test.info().outputPath('scroll-style-trace.json'), JSON.stringify(trace, null, 2));
});
