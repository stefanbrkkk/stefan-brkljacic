import { test, expect } from '@playwright/test';

const dialog = page => page.locator('#projectDialog');
const message = page => page.locator('#projectMessagePreview');
const openContact = async page => {
  const inline = page.locator('#projectStarterInline');
  await (await inline.isVisible() ? inline : page.locator('#projectStarterMobile')).click();
  await expect(dialog(page)).toBeVisible();
};

// Break caught: one opener bypasses the shared dialog or leaves a stale return target.
for (const closeMethod of ['close', 'escape', 'backdrop']) {
  test(`service openers restore their own focus after ${closeMethod}`, async ({ page }) => {
    await page.goto('/');
    await openContact(page);
    await page.locator('#projectDialogClose').click();
    for (const [index, type] of ['website', 'prototype', 'polish'].entries()) {
      const opener = page.locator('.svc-cta').nth(index);
      await opener.click();
      await expect(page.locator(`[data-project-type="${type}"]`)).toHaveAttribute('aria-pressed', 'true');
      if (closeMethod === 'close') await page.locator('#projectDialogClose').click();
      else if (closeMethod === 'escape') await page.keyboard.press('Escape');
      else await page.mouse.click(2, 2);
      await expect(dialog(page)).not.toBeVisible();
      await expect(opener).toBeFocused();
    }
  });
}

test('all primary entry points use the guided dialog and keyboard stays contained', async ({ page }) => {
  await page.goto('/');
  for (const opener of await page.locator('[data-i18n="ctaStart"],#projectStarterInline,#projectSignalButton').all()) {
    if (!await opener.isVisible()) continue;
    await opener.click();
    await expect(dialog(page)).toBeVisible();
    for (let i = 0; i < 22; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog(page).evaluate(el => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
  }
});

for (const language of ['en', 'sr']) {
  test(`optional context and editable message survive URL encoding in ${language}`, async ({ page }) => {
    await page.goto('/');
    if (language === 'sr') await page.locator('.lang-switch').click();
    await openContact(page);
    await page.locator('[data-project-type="website"]').click();
    await page.locator('#projectGoal').fill('Čačak & Belgrade\nTwo lines');
    await page.locator('#projectCurrentUrl').fill('https://example.com/?a=1&b=ž');
    await page.locator('#projectTiming').fill('October & November');
    await message(page).fill('Hello Željko & Stefan,\nMy edited brief.');
    const links = await page.locator('#projectEmail, #projectGmail').evaluateAll(els => els.map(el => el.href));
    const email = new URL(links[0]);
    const gmail = new URL(links[1]);
    expect(email.protocol).toBe('mailto:');
    expect(email.pathname).toBe('stefanbrkk@gmail.com');
    const body = email.searchParams.get('body');
    expect(body).toContain('Hello Željko & Stefan,\nMy edited brief.');
    expect(body).toContain('Čačak & Belgrade\nTwo lines');
    expect(body).toContain('https://example.com/?a=1&b=ž');
    expect(body).toContain('October & November');
    expect(gmail.searchParams.get('body')).toBe(body);
    expect(gmail.searchParams.get('su')).toBe(email.searchParams.get('subject'));
    await page.keyboard.press('Escape');
    await openContact(page);
    await expect(message(page)).toHaveValue('Hello Željko & Stefan,\nMy edited brief.');
    await expect(page.locator('#projectGoal')).toHaveValue('Čačak & Belgrade\nTwo lines');
  });
}

test('type and language changes keep visitor edits until an explicit reset', async ({ page }) => {
  await page.goto('/');
  await openContact(page);
  await page.locator('[data-project-type="website"]').click();
  await message(page).fill('Please keep my carefully edited draft.');
  await page.locator('#projectTiming').fill('Next month');
  await page.locator('[data-project-type="prototype"]').click();
  await expect(message(page)).toHaveValue('Please keep my carefully edited draft.');
  await page.locator('#projectDialogLanguage').click();
  await expect(message(page)).toHaveValue('Please keep my carefully edited draft.');
  await expect(page.locator('#projectDraftNotice')).toContainText('Sačuvana');
  await page.locator('#projectMessageReset').click();
  await expect(message(page)).toHaveValue(/Zdravo Stefane/);
  await expect(page.locator('#projectTiming')).toHaveValue('Next month');
});

// Clipboard/popup APIs are external permission surfaces. Deny them explicitly;
// assert real UI recovery and real browser focus, never a mocked success callback.
for (const clipboard of ['denied', 'unsupported']) {
  test(`clipboard ${clipboard} offers selectable recovery without false success`, async ({ page }) => {
    await page.addInitScript(mode => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: mode === 'unsupported' ? undefined : { writeText: async () => { throw new DOMException('Denied', 'NotAllowedError'); } } });
      document.execCommand = () => false;
    }, clipboard);
    await page.goto('/');
    await openContact(page);
    await page.locator('[data-project-type="qa"]').click();
    await page.locator('#projectCopyMessage').click();
    await expect(page.locator('#projectCopyStatus')).toContainText('Could not copy');
    await expect(page.locator('#projectCopyStatus')).not.toContainText('copied');
    await expect(page.locator('#projectCopyFallback')).toBeFocused();
    expect(await page.locator('#projectCopyFallback').evaluate(el => el.selectionEnd - el.selectionStart)).toBeGreaterThan(30);
    await expect(page.locator('#projectEmail')).toHaveAttribute('href', /^mailto:/);
    await expect(page.locator('#projectLinkedIn')).toHaveAttribute('href', /^https:\/\/www.linkedin.com\/in\//);
    await page.route('https://www.linkedin.com/**', route => route.fulfill({ body: 'Profile destination intercepted for test.' }));
    const popup = page.waitForEvent('popup');
    await page.locator('#projectLinkedIn').click();
    const profile = await popup;
    await profile.close();
    await expect(page.locator('#projectCopyStatus')).toContainText('Could not copy');
    await expect(page.locator('#toast')).not.toContainText('Message copied');
  });
}

test('real browser clipboard permission copies the complete composed message', async ({ context, page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Playwright clipboard-read/write permission grants are Chromium-only; Firefox reports Unknown permission: clipboard-read and WebKit does not expose equivalent grants. Denied/unsupported recovery stays enabled for every engine.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await openContact(page);
  await page.locator('[data-project-type="qa"]').click();
  await message(page).fill('Question & answer\nŽeljko');
  await page.locator('#projectGoal').fill('Test goal');
  await page.locator('#projectCopyMessage').click();
  await expect(page.locator('#projectCopyStatus')).toContainText('Message copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('Question & answer\nŽeljko');
  expect(copied).toContain('Test goal');
});

test('no JavaScript keeps ordinary direct email usable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#projectStarterInline')).toHaveAttribute('href', /^mailto:stefanbrkk@gmail.com/);
  await expect(page.locator('[data-i18n="emailDirect"]').first()).toHaveAttribute('href', /^mailto:/);
  await context.close();
});

for (const language of ['en', 'sr']) {
  test(`narrow ${language} dialog keeps all actions reachable`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    if (language === 'sr') await page.locator('.lang-switch').click();
    await openContact(page);
    await page.locator('[data-project-type="polish"]').click();
    for (const id of ['projectGoal', 'projectCurrentUrl', 'projectTiming', 'projectMessagePreview', 'projectEmail', 'projectGmail', 'projectCopyMessage', 'projectLinkedIn']) {
      const control = page.locator(`#${id}`);
      await control.scrollIntoViewIfNeeded();
      const box = await control.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(844);
    }
    const overflow = await dialog(page).evaluate(el => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('LinkedIn profile action never claims an unperformed clipboard copy', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new DOMException('Denied', 'NotAllowedError'); } } });
    document.execCommand = () => false;
  });
  await page.goto('/');
  await openContact(page);
  await page.locator('[data-project-type="qa"]').click();
  await page.route('https://www.linkedin.com/**', route => route.fulfill({ body: 'Profile destination intercepted for test.' }));
  const popup = page.waitForEvent('popup');
  await page.locator('#projectLinkedIn').click();
  const profile = await popup;
  expect(await page.locator('#toast').textContent()).not.toMatch(/copied|kopirana/i);
  await profile.close();
});
