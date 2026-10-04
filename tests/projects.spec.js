import { test, expect } from '@playwright/test';
import { decodeLoadedImage } from './helpers/journey.js';

const evidence = () => test.info().outputPath('evidence');
const projects = [
  { id: 'honey', title: /Harmonije\s*Panonije/, live: 'https://harmonije-panonije.vercel.app/', status: ['Client catalogue and inquiry website', 'Klijentski katalog i sajt za upite'] },
  { id: 'ai', title: 'GlasAI', live: 'https://www.glasai.online/', status: ['Interactive concept demo', 'Interaktivna demonstracija koncepta'] },
  { id: 'gym', title: /Gimnastika\s*Kraguj/, live: 'https://gimnastika-kraguj.vercel.app/', status: ['Public preview', 'Javni pregled'] },
  { id: 'sheet', title: 'Sheetpost', live: 'https://sheetpost-seven.vercel.app/', status: ['Multilingual workflow prototype', 'Višejezični prototip radnog toka'] },
];

for (const language of ['en', 'sr']) {
  test(`project evidence stays truthful, translated and inspectable in ${language}`, async ({ page }) => {
    await page.goto('/');
    if (language === 'sr') await page.locator('.lang-switch').click();
    await expect(page.locator('.project').first().locator('h3')).toHaveText(/Harmonije\s*Panonije/);
    for (const project of projects) {
      const article = page.locator(`[data-project="${project.id}"]`);
      await expect(article.locator('h3')).toHaveText(project.title);
      await expect(article.locator('h3 + .project-status')).toHaveText(project.status[language === 'en' ? 0 : 1]);
      const details = article.locator('details');
      await expect(details).not.toHaveAttribute('open');
      const summary = details.locator('summary');
      await expect(summary).toHaveAccessibleName(new RegExp(language === 'en' ? 'Case study' : 'Studija projekta'));
      await summary.scrollIntoViewIfNeeded();
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(details).toHaveAttribute('open', '');
      await expect(details.locator('dt')).toHaveText(language === 'en'
        ? ['Problem', 'Contribution', 'Constraint', 'Solution', 'Deliverables']
        : ['Problem', 'Doprinos', 'Ograničenje', 'Rešenje', 'Isporučeno']);
      for (const description of await details.locator('dd').all()) await expect(description).toBeVisible();
      const live = article.locator('.project-links a').first();
      await expect(live).toHaveAttribute('href', project.live);
      await expect(live).toHaveAttribute('target', '_blank');
      await expect(live).toHaveAttribute('rel', /noreferrer/);
      await summary.focus();
      await page.keyboard.press('Space');
      await expect(details).not.toHaveAttribute('open');
    }
    const honey = page.locator('[data-project="honey"]');
    await expect(honey.locator('.project-links a')).toHaveCount(2);
    await expect(honey.locator('.project-links a').last()).toHaveAttribute('href', 'https://github.com/stefanbrkkk/Harmonije-Panonije');
    for (const id of ['ai', 'gym', 'sheet']) await expect(page.locator(`[data-project="${id}"] .project-links a`)).toHaveCount(1);
    await page.locator('[data-project="ai"] summary').click();
    await expect(page.locator('[data-project="ai"] details')).toContainText(language === 'en' ? 'No production call routing' : 'Nema produkcionog usmeravanja poziva');
    await page.locator('[data-project="sheet"] summary').click();
    await expect(page.locator('[data-project="sheet"] details')).toContainText(language === 'en' ? 'Submission is simulated' : 'Slanje je simulirano');
    expect(await honey.innerText()).not.toMatch(/honey producer|proizvođača meda|solo|samostalno/i);
  });
}

for (const mode of ['no-js', 'blocked-main']) {
  test(`${mode}: native project disclosures work with keyboard`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'no-js', viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    if (mode === 'blocked-main') await page.route('**/scripts/main.js', route => route.abort('failed'));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.lang-switch')).toBeHidden();
    for (const project of projects) {
      const article = page.locator(`[data-project="${project.id}"]`);
      const summary = article.locator('summary');
      await summary.scrollIntoViewIfNeeded();
      await summary.focus();
      await expect(summary).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(article.locator('details')).toHaveAttribute('open', '');
      await expect(article.locator('dd').last()).toBeVisible();
      await page.keyboard.press('Space');
      await expect(article.locator('details')).not.toHaveAttribute('open');
    }
    await context.close();
  });
}

for (const [language, viewport] of [['en', { width: 1363, height: 936 }], ['sr', { width: 390, height: 844 }]]) {
  test(`${language} representative project disclosure fits ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    if (language === 'sr') await page.locator('.lang-switch').click();
    const project = page.locator('[data-project="honey"]');
    await project.locator('summary').click();
    for (const part of await project.locator('.project-status, summary, dt, dd, .project-links a').all()) {
      const box = await part.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      // Link pseudo-elements deliberately extend the hit area by 4px; inspect text/control bounds above.
      if (!await part.evaluate(el => el.matches('a'))) {
        expect(await part.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      }
    }
    // Decode the local project preview before a tall component capture reaches it.
    await project.locator('img.shot').scrollIntoViewIfNeeded();
    await decodeLoadedImage(project.locator('img.shot'));
    const screenshot = { path: `${evidence()}/${language}-${viewport.width}-honey-expanded.png` };
    if (viewport.width < 600) {
      // A real viewport capture avoids duplicated fixed controls in tall component stitching.
      await project.locator('summary').scrollIntoViewIfNeeded();
      await page.screenshot(screenshot);
    } else {
      await project.screenshot(screenshot);
    }
  });
}
