import { expect } from '@playwright/test';

export function watchNormalJourney(page) {
  const evidence = { consoleErrors:[], pageErrors:[], failedLocalRequests:[], unsuccessfulLocalResponses:[] };
  const local = url => new URL(url).origin === 'http://127.0.0.1:4173';
  page.on('console', message => { if (message.type() === 'error') evidence.consoleErrors.push(message.text()); });
  page.on('pageerror', error => evidence.pageErrors.push(error.message));
  page.on('requestfailed', request => { if (local(request.url())) evidence.failedLocalRequests.push({url:request.url(), error:request.failure()?.errorText}); });
  page.on('response', response => { if (local(response.url()) && response.status() >= 400) evidence.unsuccessfulLocalResponses.push({url:response.url(), status:response.status()}); });
  return evidence;
}


// Native lazy loading may select currentSrc on the next rendering frame.
// Keep both successful-load and decode checks; broken assets still fail.
export async function decodeLoadedImage(image) {
  await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
  await image.evaluate(el => el.decode());
}
