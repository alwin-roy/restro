import { chromium } from '../node_modules/.cache/restro-qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3202', { waitUntil: 'networkidle' });
  await page.locator('.cinematic-debug').waitFor();
  await page.waitForFunction(() => document.querySelector('canvas').dataset.renderedFrame === '1');
  const samples = [];
  for (const y of [10, 30, 60, 90, 120]) {
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(150);
    samples.push(await page.locator('canvas').evaluate(c => ({ ...c.dataset,
      pixel: Array.from(c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data) })));
  }
  assert.ok(new Set(samples.map(s => s.renderedFrame)).size >= 4);
  assert.ok(new Set(samples.map(s => JSON.stringify(s.pixel))).size >= 4);
  await page.screenshot({ path: 'artifacts/cinematic-continuity/development-debug.png' });
  fs.writeFileSync('artifacts/cinematic-continuity/development-debug.json', JSON.stringify({ samples,
    panel: await page.locator('.cinematic-debug').textContent() }, null, 2));
  console.log('Development panel verified against changing actual Canvas pixels and displayed indexes.');
} finally { await browser.close(); }
