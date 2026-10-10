import { test, expect } from '@playwright/test';

const evidence = () => test.info().outputPath('evidence');
const capture = () => /^(no-js (desktop|phone)|blocked-main phone):/.test(test.info().title);
const viewports = { desktop: { width: 1363, height: 936 }, phone: { width: 390, height: 844 }, tablet: { width: 820, height: 1180 } };

async function breakMain(page, mode) {
  if (mode === 'no-js') return;
  await page.addInitScript(() => localStorage.setItem('stefan-lang', 'sr'));
  await page.route('**/scripts/main.js', async route => {
    if (mode === 'blocked-main') return route.abort('failed');
    const response = await route.fetch();
    const source = await response.text();
    const marker = '// Commit enhancement state';
    expect(source).toContain(marker);
    await route.fulfill({ response, body: source.replace(marker, 'throw new Error("Injected late main initialization failure");\n  ' + marker) });
  });
}

async function assertEssential(page, width) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  for (const heading of [/Harmonije\s*Panonije/, /Gimnastika\s*Kraguj/, /GlasAI/, /Sheetpost/]) {
    const title = page.locator('.project h3').filter({ hasText: heading });
    await title.scrollIntoViewIfNeeded();
    await expect(title).toBeVisible();
    expect(await title.evaluate(el => getComputedStyle(el.closest('[data-reveal]') || el).opacity)).toBe('1');
  }
  await page.locator('.proof-responsive').scrollIntoViewIfNeeded();
  if (capture()) await page.locator('.proof-responsive').screenshot({ path: `${evidence()}/${test.info().title.replaceAll(/[^a-zA-Z0-9]+/g, '-')}-proof.png` });
  await expect(page.locator('.device-proof')).toHaveCount(3);
  for (const proof of await page.locator('.device-proof').all()) {
    await expect(proof).toHaveCSS('opacity', '1');
    await expect(proof.locator('.device-proof-label b')).toBeVisible();
    await expect(proof).toHaveAttribute('href', /^https:\/\//);
    // External screenshot availability is owned by Phase 3; inspect its actual state in evidence.
  }
  await page.locator('#anatomy').scrollIntoViewIfNeeded();
  if (capture()) await page.locator('#anatomy').screenshot({ path: `${evidence()}/${test.info().title.replaceAll(/[^a-zA-Z0-9]+/g, '-')}-process.png` });
  const rects = await page.locator('.build-layer').evaluateAll(elements => elements.map(el => {
    const r = el.getBoundingClientRect();
    return { top:r.top, bottom:r.bottom, left:r.left, right:r.right, height:r.height };
  }));
  expect(rects).toHaveLength(5);
  for (const rect of rects) {
    expect(rect.height).toBeGreaterThan(35);
    expect(rect.height).toBeLessThan(180);
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(width);
  }
  for (let i = 1; i < rects.length; i++) expect(rects[i].top).toBeGreaterThanOrEqual(rects[i - 1].bottom);
  expect(await page.locator('#anatomy').evaluate(el => el.offsetHeight)).toBeLessThan(1400);
  await expect(page.locator('.anatomy-static-copy')).toBeVisible();
  const direct = page.locator('a[data-i18n="emailDirect"]');
  await direct.scrollIntoViewIfNeeded();
  await expect(direct).toBeVisible();
  await expect(direct).toHaveAttribute('href', 'mailto:stefanbrkk@gmail.com');
  await direct.focus();
  await expect(direct).toBeFocused();
}

for (const mode of ['no-js', 'blocked-main', 'init-failure']) {
  for (const [device, viewport] of Object.entries(viewports)) {
    test(`${mode} ${device}: static content and native navigation stay usable`, async ({ browser }) => {
      const context = await browser.newContext({ viewport, javaScriptEnabled:mode !== 'no-js' });
      const page = await context.newPage();
      await breakMain(page, mode);
      await page.goto('/');
      if (capture()) await page.screenshot({ path: `${evidence()}/${mode}-${device}-header.png` });
      await assertEssential(page, viewport.width);
      for (const control of await page.locator('.menu-btn,.lang-switch,#copyBtn,#copyBtn2,#projectDialogLanguage').all()) await expect(control).toBeHidden();
      for (const anchor of ['work', 'services', 'method', 'about', 'contact']) {
        const link = page.locator(`.navlinks a[href="#${anchor}"]`);
        await expect(link).toBeVisible();
        await link.click();
        await expect(page).toHaveURL(new RegExp(`#${anchor}$`));
        const target = page.locator(`#${anchor}`);
        await expect.poll(() => target.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.top < innerHeight * .8 && rect.bottom > document.querySelector('.topbar').getBoundingClientRect().bottom;
        })).toBe(true);
      }
      expect(await page.locator('#main').evaluate(el => el.inert)).toBe(false);
      await context.close();
    });
  }
}

for (const [device, viewport] of Object.entries(viewports)) {
  test(`IntersectionObserver unavailable ${device}: enhancements initialize and all proof is readable`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => { delete window.IntersectionObserver; });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('.lang-switch')).toBeVisible();
    expect(await page.locator('[data-reveal]').evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1'))).toBe(true);
    await page.locator('.lang-switch').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'sr');
    for (const proof of await page.locator('.device-proof').all()) await expect(proof).toHaveCSS('opacity', '1');
    await page.locator(viewport.width <= 660 ? '#projectStarterMobile' : '#projectStarterInline').click();
    await expect(page.locator('#projectDialog')).toBeVisible();
    await page.locator('#projectDialogClose').click();
    expect(errors).toEqual([]);
    if (device !== 'tablet') {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.locator('#anatomy').scrollIntoViewIfNeeded();
      await page.locator('#anatomy').screenshot({ path: `${evidence()}/sr-${device}-static-process.png` });
    }
  });
}

test('unsupported native dialog preserves native inquiry and hides its controls', async ({ page }) => {
  await page.addInitScript(() => { HTMLDialogElement.prototype.showModal = undefined; });
  await page.goto('/');
  await expect(page.locator('#projectDialog')).toBeHidden();
  await expect(page.locator('[data-inquiry]').first()).not.toHaveAttribute('aria-haspopup', 'dialog');
  for (const inquiry of await page.locator('[data-inquiry]').all()) await expect(inquiry).toHaveAttribute('href', /^mailto:stefanbrkk@gmail.com/);
});


test('late dialog initialization failure leaves inquiry anchors native', async ({ page }) => {
  await page.route('**/scripts/inquiry.js', async route => {
    const response = await route.fetch();
    const source = await response.text();
    const marker = "// Commit inquiry state";
    expect(source).toContain(marker);
    await route.fulfill({ response, body: source.replace(marker, '    throw new Error("Injected late inquiry initialization failure");\n' + marker) });
  });
  await page.goto('/');
  await expect(page.locator('#projectDialog')).toBeHidden();
  const inquiry = page.locator('#projectStarterInline');
  await expect(inquiry).not.toHaveAttribute('aria-haspopup', 'dialog');
  await expect(inquiry).toHaveAttribute('href', /^mailto:stefanbrkk@gmail.com/);
  expect(await inquiry.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true })))).toBe(true);
  await expect(page.locator('#projectDialog')).toBeHidden();
});
