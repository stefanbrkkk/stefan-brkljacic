import { test, expect } from '@playwright/test';

const resetState = page => page.evaluate(() => ({
  inert: document.getElementById('main').inert,
  bodyOverflow: document.body.style.overflow,
  rootOverflow: document.documentElement.style.overflow,
  open: document.body.classList.contains('menu-open')
}));

test('open phone menu resets locks and aria when resized to desktop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.menu-btn').click();
  await expect(page.locator('#main')).toHaveAttribute('inert', '');
  await expect(page.locator('#mobileMenu nav a').first()).toHaveCSS('opacity', '1');
  await page.screenshot({ path: test.info().outputPath('menu-portrait.png') });
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('.menu-btn')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#mobileMenu')).toHaveAttribute('aria-hidden', 'true');
  expect(await resetState(page)).toEqual({ inert: false, bodyOverflow: '', rootOverflow: '', open: false });
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect(page.locator('.brand')).toBeFocused();
  await page.screenshot({ path: test.info().outputPath('menu-reset-desktop.png') });
});

test('menu traps tabs across visible header and menu controls and Escape restores opener', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const button = page.locator('.menu-btn');
  await button.click();
  await expect(page.locator('#mobileMenu nav a').first()).toBeFocused();
  const controls = await page.locator('.topbar a,.topbar button,#mobileMenu a').evaluateAll(elements => elements.filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden').map(el => el.outerHTML));
  expect(controls).toHaveLength(9);
  await page.locator('#mobileMenu .mm-foot a').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.brand')).toBeFocused();
  for (const selector of ['.lang-switch','.menu-btn','#mobileMenu a[href="#work"]','#mobileMenu a[href="#services"]','#mobileMenu a[href="#method"]','#mobileMenu a[href="#about"]','#mobileMenu a[href="#contact"]','#mobileMenu .mm-foot a','.brand']) {
    await page.keyboard.press('Tab');
    await expect(page.locator(selector)).toBeFocused();
  }
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#mobileMenu .mm-foot a')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  expect(await resetState(page)).toEqual({ inert: false, bodyOverflow: '', rootOverflow: '', open: false });
});

test('menu link closes the menu and focuses the navigated section', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.menu-btn').click();
  await page.locator('#mobileMenu a[href="#services"]').click();
  await expect(page.locator('#services')).toBeFocused();
  await expect(page).toHaveURL(/#services$/);
  expect(await resetState(page)).toEqual({ inert: false, bodyOverflow: '', rootOverflow: '', open: false });
  await expect(page.locator('.start-step[tabindex]')).toHaveCount(0);
});

test('phone rotation keeps menu usable then navigation restores page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.menu-btn').click();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.menu-btn')).toHaveAttribute('aria-expanded', 'true');
  await page.screenshot({ path: test.info().outputPath('menu-landscape.png') });
  await page.locator('#mobileMenu a[href="#contact"]').click();
  await expect(page.locator('#contact')).toBeFocused();
  expect((await resetState(page)).inert).toBe(false);
});
