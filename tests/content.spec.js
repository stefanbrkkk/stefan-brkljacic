import { test, expect } from '@playwright/test';

test('fresh Serbian browser locale still defaults to English', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'sr-RS' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('[data-i18n="navWork"]').first()).toHaveText('Work');
  await context.close();
});

test('saved Serbian preference survives reload and invalid values become English', async ({ page }) => {
  await page.goto('/');
  await page.locator('.lang-switch').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'sr');
  await expect(page.locator('[data-i18n="navWork"]').first()).toHaveText('Radovi');
  await page.evaluate(() => localStorage.setItem('stefan-lang', 'invalid'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.lang-switch')).toHaveAttribute('data-lang', 'en');
  expect(await page.evaluate(() => localStorage.getItem('stefan-lang'))).toBe('en');
});

test('initial HTML and runtime English contain the same canonical copy', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/');
  const read = p => p.locator('[data-i18n],[data-i18n-html],[data-i18n-aria-label],[data-i18n-alt]').evaluateAll(elements => elements.map(el => ({
    key: el.dataset.i18n || el.dataset.i18nHtml || el.dataset.i18nAriaLabel || el.dataset.i18nAlt,
    value: el.hasAttribute('data-i18n-aria-label') ? el.getAttribute('aria-label') : el.hasAttribute('data-i18n-alt') ? el.getAttribute('alt') : el.innerHTML
  })));
  const initial = await read(staticPage);
  await page.goto('/');
  expect(await read(page)).toEqual(initial);
  await context.close();
});

for (const language of ['en', 'sr']) {
  test(`project claims are conservative in ${language}`, async ({ page }) => {
    await page.goto('/');
    if (language === 'sr') await page.locator('.lang-switch').click();
    const work = await page.locator('#work').innerText();
    expect(work).not.toMatch(/solo|samostalno|Sep 2026|septembra 2026/i);
    await expect(page.locator('[data-i18n="gymStatus"]')).toHaveText(language === 'en' ? 'Public preview' : 'Javni pregled');
    await expect(page.locator('[data-i18n="glasStatus"]')).toContainText(language === 'en' ? 'concept' : 'koncept');
    await expect(page.locator('[data-i18n="sheetText"]')).toContainText(language === 'en' ? 'simulated KSeF submission' : 'simulirano slanje u KSeF');
  });
}

test('Serbian translates ordinary visible copy and accessible names', async ({ page }) => {
  await page.goto('/');
  await page.locator('.lang-switch').click();
  await expect(page.locator('.topbar')).toHaveAttribute('aria-label', 'Glavna navigacija');
  await expect(page.locator('.brand')).toHaveAttribute('aria-label', 'Stefan Brkljačić — početna');
  await expect(page.locator('.navlinks')).toHaveAttribute('aria-label', 'Odeljci');
  await expect(page.locator('.menu-btn')).toHaveAttribute('aria-label', 'Meni');
  await expect(page.locator('#projectDialogClose')).toHaveAttribute('aria-label', 'Zatvori');
  await expect(page.locator('.education-copy h3')).toContainText('Deveta beogradska gimnazija');
  await expect(page.locator('.fact').first()).toContainText('Beograd, Srbija');
  await expect(page.locator('.method-num').nth(4)).toHaveText('05 / PROVERA');
  await expect(page.locator('.device-proof-label b').last()).toHaveText('Telefon · 390×844');
  await expect(page.locator('.phone-proof img')).toHaveAttribute('alt', /Harmonije Panonije.*pregledaču.*390 puta 844/);
  expect(await page.locator('main').innerText()).not.toMatch(/Respoz|Small surface|Natural Sciences|Keyboard|fallbackovi/);
});

test('Serbian translates project tags and visible decorative captions', async ({ page }) => {
  await page.goto('/');
  await page.locator('.lang-switch').click();
  const tags = await page.locator('.project-tags').allTextContents();
  expect(tags.join(' ')).not.toMatch(/Voice demo|Product design|Responsive UI|Scheduling|Content systems|Workflow UX|CSV mapping|Validation|Multilingual/);
  await expect(page.locator('.hero-coord')).toContainText('Beograd / Srbija');
  await expect(page.locator('.web-tag')).toHaveText('interaktivni prikaz / 01');
});

test('switching language preserves the actual anatomy phase', async ({ page }) => {
  await page.setViewportSize({ width: 1363, height: 936 });
  await page.goto('/');
  await page.locator('#anatomy').evaluate(el => scrollTo(0, el.offsetTop + (el.offsetHeight - innerHeight) * .4));
  await expect(page.locator('#anatomyPhaseNum')).toHaveText('02');
  const switchedLabel = await page.locator('.lang-switch').evaluate(button => {
    button.click();
    return document.querySelector('#anatomyPhaseText').textContent;
  });
  expect(switchedLabel).toBe('Pregled slojeva');
  await expect(page.locator('#anatomyPhaseNum')).toHaveText('02');
  await expect(page.locator('#anatomyPhaseText')).toHaveText('Pregled slojeva');
});

// This failure is injected deliberately; normal console journeys are separate.
test('an invalid future dictionary fails before replacing authored static text', async ({ page }) => {
  const errors = [];
  const errorArguments = [];
  page.on('console', message => {
    if (message.type() !== 'error') return;
    errors.push(message.text());
    // Firefox's console text abbreviates Error objects; inspect the actual arguments.
    errorArguments.push(Promise.all(message.args().map(argument => argument.evaluate(value =>
      value && typeof value === 'object' && 'message' in value ? value.message : String(value)
    ))));
  });
  await page.route('**/scripts/content.js', async route => {
    const response = await route.fetch();
    const source = await response.text();
    expect(source).toContain('"navWork": "Radovi"');
    await route.fulfill({response,body:source.replace('"navWork": "Radovi"','"navWork": ""')});
  });
  const guardErrorEvent = page.waitForEvent('console', { predicate: message => message.type() === 'error' });
  await page.goto('/');
  await guardErrorEvent;
  await expect(page.locator('html')).not.toHaveClass(/language-ready/);
  await expect(page.locator('.navlinks [data-i18n="navWork"]')).toHaveText('Work');
  await expect(page.locator('main')).not.toContainText('undefined');
  await expect(page.locator('#projectStarterInline')).toHaveAttribute('href', /^mailto:/);
  expect(errors).toHaveLength(1);
  expect(errors[0]).toContain('Portfolio enhancements unavailable:');
  expect((await Promise.all(errorArguments)).flat().join(' ')).toContain('Missing or empty sr translation: navWork');
});
