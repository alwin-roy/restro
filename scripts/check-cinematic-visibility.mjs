import { chromium } from '../node_modules/.cache/restro-qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage(); let requests = 0;
  page.on('request', request => { if (/frame-\d+\.webp/.test(request.url())) requests++; });
  await page.goto('http://localhost:3200', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('canvas').dataset.status === 'ready');
  const before = await page.locator('canvas').getAttribute('data-rendered-frame');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    scrollTo({ top: 2000, behavior: 'instant' });
  });
  const count = requests; await page.waitForTimeout(400);
  const hiddenNewRequests = requests - count;
  assert.equal(hiddenNewRequests, 0);
  assert.equal(await page.locator('canvas').getAttribute('data-rendered-frame'), before);
  await page.evaluate(() => {
    delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForFunction(() => {
    const c = document.querySelector('canvas'); return +c.dataset.renderedFrame > 100 && c.dataset.renderedFrame === c.dataset.targetFrame;
  });
  fs.writeFileSync('artifacts/cinematic-continuity/visibility-validation.json', JSON.stringify({
    method: 'Simulated document.hidden and visibilitychange; actual headless background tab remained visible in separate test',
    hiddenFrameHeld: true, hiddenNewRequests, resumed: true,
  }, null, 2));
  console.log('Simulated visibility: no hidden requests/draws; resumed latest position.');
} finally { await browser.close(); }
