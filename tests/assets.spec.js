import { test, expect } from '@playwright/test';
import { decodeLoadedImage } from './helpers/journey.js';
import { readFile } from 'node:fs/promises';

// Local extraction and current viewport-proof contracts.
test('local assets and ESM entry point load without embedded payloads', async ({ page, request }) => {
  const html = await readFile('index.html', 'utf8');
  expect(/data:(?:font|image\/(?:jpeg|png));base64/.test(html), 'No embedded font or raster-image payloads').toBe(false);
  expect(html).toContain('type="module" src="scripts/main.js"');
  expect(html).toContain('href="styles/site.css"');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/language-ready/);
  await expect(page.locator('html')).toHaveClass(/inquiry-ready/);
  for (const image of await page.locator('img.shot').all()) {
    await image.scrollIntoViewIfNeeded();
    await decodeLoadedImage(image);
    const dimensions = await image.evaluate(el => ({ actual: [el.naturalWidth, el.naturalHeight], declared: [+el.getAttribute("width"), +el.getAttribute("height")], src: el.getAttribute('src') }));
    expect(dimensions.actual).toEqual(dimensions.declared);
    expect(dimensions.src).toMatch(/^assets\/images\//);
    expect((await request.get(dimensions.src)).status()).toBe(200);
  }
  const css = await (await request.get('styles/site.css')).text();
  const fonts = [...css.matchAll(/url\(['"]?([^)'" ]+\.woff2)['"]?\)/g)].map(match => match[1]);
  expect(fonts).toHaveLength(6);
  for (const font of fonts) expect((await request.get(new URL(font, 'http://127.0.0.1:4173/styles/site.css').href)).status()).toBe(200);
  expect(errors).toEqual([]);
});

test('controller imports do not require DOM or initialize the page', async () => {
  for (const controller of ['content', 'language', 'motion', 'navigation', 'email', 'toast', 'inquiry', 'images']) {
    await import(`../scripts/${controller}.js`);
  }
});

test('owned device captures have local sources, decoded pixels and declared dimensions', async ({ page, request }) => {
  await page.goto('/');
  await page.locator('.device-proof-grid').scrollIntoViewIfNeeded();
  const images = page.locator('.device-proof img');
  await expect(images).toHaveCount(3);
  for (const image of await images.all()) {
    const src = await image.getAttribute('src');
    expect(src, 'Owned proof capture source').toMatch(/^assets\/projects\//);
    expect((await request.get(src)).status()).toBe(200);
    await decodeLoadedImage(image);
    const dimensions = await image.evaluate(el => ({ actual: [el.naturalWidth, el.naturalHeight], declared: [+el.getAttribute('width'), +el.getAttribute('height')] }));
    expect(dimensions.actual).toEqual(dimensions.declared);
  }
});

test('capture provenance and social/entity metadata agree with owned assets', async ({ page, request }) => {
  const captures = JSON.parse(await readFile('assets/projects/capture-manifest.json', 'utf8'));
  expect(captures.map(capture => capture.viewport)).toEqual([{ width:1440, height:900 }, { width:768, height:1024 }, { width:390, height:844 }]);
  for (const capture of captures) {
    expect(capture.url).toBe('https://harmonije-panonije.vercel.app/');
    expect(capture.capturedAt).toMatch(/^2026-10-04T/);
    expect(capture.sourceHtmlSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(capture.responseStatus).toBe(200);
    const response = await request.get(capture.path);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/jpeg');
    const { createHash } = await import('node:crypto');
    expect(createHash('sha256').update(await response.body()).digest('hex')).toBe(capture.imageSha256);
  }
  await page.goto('/');
  const canonical = 'https://stefan-brkljacic.vercel.app/';
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
  const structured = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(structured['@context']).toBe('https://schema.org');
  expect(structured['@graph'].map(entity => [entity['@id'], entity.url])).toEqual([[canonical+'#service', canonical], [canonical+'#person', canonical]]);
  const [service, person] = structured['@graph'];
  expect(service['@type']).toBe('Service');
  // Service permits provider/areaServed plus inherited Thing fields; contact belongs to Person.
  expect(Object.keys(service).sort()).toEqual(['@id','@type','areaServed','description','name','provider','url']);
  expect(person['@type']).toBe('Person');
  expect(person.email).toBe('stefanbrkk@gmail.com');
  expect(service.provider).toEqual({ '@id':canonical+'#person' });
  expect(structured['@graph'][0]).not.toHaveProperty('priceRange');
  expect(await page.locator('link[rel="alternate"][hreflang]').count()).toBe(0);
  const social = await page.locator('meta[property="og:image"]').getAttribute('content');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', social);
  expect(new URL(social).origin).toBe(new URL(canonical).origin);
  const preview = await request.get(new URL(social).pathname);
  const alias = await request.get('/og-preview.jpg');
  expect(preview.status()).toBe(200);
  expect(alias.status()).toBe(200);
  expect(await alias.body()).toEqual(await preview.body());
  const declared = await page.locator('meta[property="og:image:width"],meta[property="og:image:height"]').evaluateAll(elements => elements.map(el => +el.content));
  expect(declared).toEqual([1734,907]);
  const pixels = await page.evaluate(async src => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return [image.naturalWidth,image.naturalHeight];
  },new URL(social).pathname);
  expect(pixels).toEqual(declared);
});

for (const language of ['en','sr']) {
  test(`failed images retain useful titles/links and show a visible fallback in ${language}`, async ({ page }) => {
    await page.route('**/assets/projects/*.jpg', route => route.abort('failed'));
    await page.route('**/assets/images/*.jpg', route => route.abort('failed'));
    await page.goto('/');
    if (language === 'sr') await page.locator('.lang-switch').click();
    for (const project of await page.locator('.project').all()) {
      await project.locator('img').scrollIntoViewIfNeeded();
      await expect(project.locator('.image-fallback')).toBeVisible();
      await expect(project.locator('.image-fallback')).toHaveText(language === 'en' ? 'Preview unavailable. Open project.' : 'Prikaz nije dostupan. Otvori projekat.');
      await project.locator('h3').scrollIntoViewIfNeeded();
      await expect(project.locator('h3')).toBeVisible();
      await expect(project.locator('.project-links a').first()).toHaveAttribute('href', /^https:\/\//);
    }
    for (const proof of await page.locator('.device-proof').all()) {
      await proof.scrollIntoViewIfNeeded();
      await expect(proof.locator('.image-fallback')).toBeVisible();
      await expect(proof.locator('.device-proof-label .sr-only')).toHaveText('Harmonije Panonije');
      await expect(proof).toHaveAttribute('href', 'https://harmonije-panonije.vercel.app/');
      await proof.focus();
      await expect(proof).toBeFocused();
    }
  });
}

test('no JavaScript and failed captures leave native titles, alt text and links available', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled:false, viewport:{width:390,height:844} });
  const page = await context.newPage();
  await page.route('**/assets/projects/*.jpg', route => route.abort('failed'));
  await page.goto('/');
  for (const proof of await page.locator('.device-proof').all()) {
    await proof.scrollIntoViewIfNeeded();
    await expect(proof.locator('.device-proof-label')).toBeVisible();
    await expect(proof.locator('img')).toHaveAttribute('alt', /Harmonije Panonije website captured/);
    await expect(proof).toHaveAttribute('href', 'https://harmonije-panonije.vercel.app/');
    await proof.focus();
    await expect(proof).toBeFocused();
  }
  await expect(page.locator('.proof-disclaimer')).toContainText('4 October 2026');
  await context.close();
});

test('320px Serbian image-failure instructions fit inside every device frame', async ({ page }) => {
  await page.setViewportSize({ width:320, height:844 });
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.route('**/assets/projects/*.jpg', route => route.abort('failed'));
  await page.goto('/');
  await page.locator('.lang-switch').click();
  for (const proof of await page.locator('.device-proof').all()) {
    await proof.scrollIntoViewIfNeeded();
    const fallback = proof.locator('.image-fallback');
    await expect(fallback).toBeVisible();
    const bounds = await fallback.evaluate(el => {
      const frame = el.closest('.device-frame').getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(el);
      const text = range.getBoundingClientRect();
      return { overflow:el.scrollHeight-el.clientHeight, top:text.top-frame.top, bottom:frame.bottom-text.bottom, left:text.left-frame.left, right:frame.right-text.right };
    });
    expect(bounds.overflow).toBeLessThanOrEqual(1);
    for (const edge of ['top','bottom','left','right']) expect(bounds[edge]).toBeGreaterThanOrEqual(-1);
  }
});
