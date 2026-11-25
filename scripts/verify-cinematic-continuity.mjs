import { chromium, firefox, webkit } from '../node_modules/.cache/restro-qa/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const out = path.resolve('artifacts/cinematic-continuity');
const base = 'http://localhost:3200';
const result = { responsive: [], engines: {}, scenarios: {} };
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function ready(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForFunction(() => {
    const c = document.querySelector('.cinematic-canvas'); return c?.dataset.targetFrame === c?.dataset.renderedFrame && c?.dataset.status === 'ready';
  }, null, { timeout: 20000 });
}
const state = page => page.locator('canvas').evaluate(c => ({ ...c.dataset, pixels: Array.from(c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data),
  overflow: document.documentElement.scrollWidth > innerWidth }));
try {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [320, 360, 375, 390, 430, 768, 1024, 1440, 1920]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } }); const page = await context.newPage();
      await page.goto(base, { waitUntil: 'networkidle' }); await ready(page);
      const samples = [];
      for (const selector of ['.cinema-hero', '.food-categories', '#reservation', '#reviews', '#contact', '.site-footer']) {
        await page.locator(selector).scrollIntoViewIfNeeded(); await ready(page); const sample = await state(page);
        assert.ok(!sample.overflow); assert.ok(sample.pixels.slice(0, 3).some(v => v > 0)); samples.push(sample);
      }
      result.responsive.push({ width, variant: width < 768 ? 'mobile' : 'desktop', samples });
      await context.close(); console.log('Responsive', width, 'passed');
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.addInitScript(() => { window.createImageBitmap = undefined; });
    await page.goto(`${base}/#reservation`, { waitUntil: 'networkidle' }); await ready(page);
    assert.ok(+(await state(page)).renderedFrame > 700);
    result.scenarios.htmlImageAlternative = 'Rendered real WebP with createImageBitmap disabled';
    const anchorFrame = +(await state(page)).renderedFrame;
    await page.reload({ waitUntil: 'networkidle' }); await ready(page);
    assert.ok(Math.abs(+(await state(page)).renderedFrame - anchorFrame) <= 1);
    result.scenarios.anchorReload = 'Reservation hash and reload preserve chronological frame';
    const input = page.locator('#reservation input').first(); await input.focus();
    const editingFrame = (await state(page)).renderedFrame;
    await page.setViewportSize({ width: 390, height: 560 }); await wait(200);
    assert.equal((await state(page)).renderedFrame, editingFrame);
    await input.blur(); await ready(page);
    result.scenarios.keyboard = 'Focused form held its frame during emulated keyboard viewport shrink; resumed after blur';
    await page.setViewportSize({ width: 390, height: 844 }); await ready(page);
    await page.locator('#reservation button[type=submit]').click();
    assert.ok(await page.locator('#reservation [aria-invalid=true]').count() > 0);
    await page.locator('input:focus').blur(); await ready(page);
    // Existing clock and review dialogs remain usable above the Canvas.
    await page.getByRole('button', { name: 'Choose reservation time' }).click();
    await page.locator('dialog[open]').waitFor(); await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Add Review', exact: true }).click();
    await page.locator('dialog[open]').waitFor(); await page.keyboard.press('Escape');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('#contact button[type=submit]').click();
    assert.ok(await page.locator('#contact [aria-invalid=true]').count() > 0);
    result.scenarios.formsAndDialogs = 'Reservation/enquiry validation, analog clock and Add Review dialog preserved';
    await page.locator('input:focus').blur();
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await ready(page);
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Contact', exact: true }).click();
    await page.waitForFunction(() => Math.abs(document.querySelector('#contact').getBoundingClientRect().top) < 160);
    await ready(page); assert.ok(+(await state(page)).renderedFrame > 1000);
    await page.getByRole('button', { name: 'Back to top', exact: true }).click();
    await page.waitForFunction(() => scrollY === 0); await ready(page);
    assert.equal(+(await state(page)).renderedFrame, 1);
    result.scenarios.mobileNavigation = 'Menu anchor and Back to Top update the actual rendered frame';
    await context.close();
    const missing = await browser.newContext(); const missingPage = await missing.newPage();
    await missingPage.route('**/desktop/frame-00001.webp', route => route.fulfill({ status: 404, body: '' }));
    await missingPage.goto(base, { waitUntil: 'networkidle' });
    await missingPage.waitForFunction(() => +document.querySelector('canvas').dataset.renderedFrame > 0);
    assert.equal((await state(missingPage)).fallback, 'none');
    await missingPage.evaluate(() => scrollTo({ top: 500, behavior: 'instant' })); await ready(missingPage);
    result.scenarios.singleMissing = 'One missing frame used nearby chronological image; next position recovered without static fallback';
    await missing.close();
    const broken = await browser.newContext(); const brokenPage = await broken.newPage();
    await brokenPage.route('**/frame-*.webp', route => route.fulfill({ status: 503, body: '' }));
    await brokenPage.goto(base, { waitUntil: 'networkidle' });
    await brokenPage.getByRole('button', { name: 'Frame sequence unavailable, retry cinema mode' }).waitFor();
    assert.match((await state(brokenPage)).fallback, /Repeated/);
    await brokenPage.unroute('**/frame-*.webp');
    await brokenPage.getByRole('button', { name: 'Frame sequence unavailable, retry cinema mode' }).click(); await ready(brokenPage);
    result.scenarios.repeatedFailures = 'Repeated 503 responses expose reason and retry restores animation';
    await broken.close();
    const performanceContext = await browser.newContext(); const p = await performanceContext.newPage();
    await p.goto(base, { waitUntil: 'networkidle' }); await ready(p);
    const warmBefore = await p.evaluate(() => performance.getEntriesByType('resource').reduce((sum, e) => sum + e.transferSize, 0));
    await p.reload({ waitUntil: 'networkidle' }); await ready(p);
    result.scenarios.transfer = { coldResourceBytes: warmBefore, warmReloadResourceBytes: await p.evaluate(() => performance.getEntriesByType('resource').reduce((sum, e) => sum + e.transferSize, 0)), note: 'Resource Timing response bytes, excludes HTML and aborted requests' };
    result.scenarios.blurComparison = await p.evaluate(async () => {
      const header = document.querySelector('.site-header'); const results = [];
      for (const blur of ['6px', '2px', '0px']) {
        header.style.backdropFilter = `blur(${blur})`; scrollTo({ top: 0, behavior: 'instant' });
        const intervals = []; let last = performance.now(); const start = last;
        await new Promise(resolve => {
          function tick(now) { intervals.push(now - last); last = now; scrollTo({ top: (now - start) / 7, behavior: 'instant' }); if (now - start < 1500) requestAnimationFrame(tick); else resolve(); }
          requestAnimationFrame(tick);
        });
        intervals.sort((a, b) => a - b); results.push({ blur, animationTickP95Ms: intervals[Math.floor(intervals.length * .95)], delayedTicks: intervals.filter(ms => ms > 25).length });
      }
      header.style.backdropFilter = ''; return { results, note: 'Sequential local rAF comparison; affected by warm cache, not an isolated GPU cost measurement' };
    });
    const foreground = await performanceContext.newPage(); await foreground.goto('about:blank'); await foreground.bringToFront();
    result.scenarios.visibility = await p.evaluate(() => ({ hidden: document.hidden, pending: document.querySelector('canvas').dataset.pendingFrames }));
    if (result.scenarios.visibility.hidden) { await wait(300); assert.equal(+(await state(p)).pendingFrames, 0); }
    await p.bringToFront(); await ready(p); await performanceContext.close();
  } finally { await browser.close(); }
  for (const [name, engine] of Object.entries({ firefox, webkit })) {
    let browser;
    try { browser = await engine.launch({ headless: true }); } catch (error) { result.engines[name] = { unavailable: String(error) }; continue; }
    try {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(String(error)));
      await page.goto(base, { waitUntil: 'networkidle' }); await ready(page);
      const frames = [];
      for (const fraction of [0, .2, .6, 1, .5, 0]) {
        await page.evaluate(fraction => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * fraction, behavior: 'instant' }), fraction);
        await ready(page); const s = await state(page); frames.push(+s.renderedFrame); assert.ok(!s.overflow); assert.ok(s.pixels.slice(0, 3).some(v => v > 0));
      }
      assert.equal(frames[3], 1340); assert.equal(frames.at(-1), 1); assert.deepEqual(errors, []);
      await page.screenshot({ path: path.join(out, `${name}-mobile.png`) }); result.engines[name] = { frames, errors, passed: true };
      await context.close();
    } finally { await browser.close(); }
  }
} finally { fs.writeFileSync(path.join(out, 'extended-validation.json'), JSON.stringify(result, null, 2)); }
console.log('Extended continuity checks complete');
