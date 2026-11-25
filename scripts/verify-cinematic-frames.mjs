/* Run after npm build and starting a production preview. Uses an ignored QA tool. */
import { chromium } from '../node_modules/.cache/restro-qa/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const out = path.resolve('artifacts/cinematic-continuity');
fs.mkdirSync(out, { recursive: true });
const base = process.env.RESTRO_QA_URL || 'http://localhost:3200';
const report = { environment: 'Local production, installed Chrome, emulated mobile; cold browser contexts', variants: {} };
if (process.env.RESTRO_QA_REUSE_RECORDINGS) {
  report.variants = JSON.parse(fs.readFileSync(path.join(out, 'browser-validation.json'), 'utf8')).variants;
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function settled(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForFunction(() => {
    const c = document.querySelector('canvas.cinematic-canvas');
    return c?.dataset.targetFrame && c.dataset.targetFrame === c.dataset.renderedFrame;
  }, null, { timeout: 15000 });
}
async function sample(page) {
  return page.locator('canvas.cinematic-canvas').evaluate(c => ({ ...c.dataset, width: c.width, height: c.height,
    y: scrollY, overflow: document.documentElement.scrollWidth > innerWidth,
    pixel: [...c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data] }));
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const [name, viewport] of process.env.RESTRO_QA_REUSE_RECORDINGS ? [] : [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
      const context = await browser.newContext({ viewport, isMobile: name === 'mobile', hasTouch: name === 'mobile',
        recordVideo: { dir: out, size: viewport } });
      const page = await context.newPage();
      const requests = [], errors = [], snapshots = [];
      page.on('request', req => { if (/frame-\d+\.webp/.test(req.url())) requests.push(req.url()); });
      page.on('pageerror', error => errors.push(String(error)));
      await page.addInitScript(() => {
        performance.setResourceTimingBufferSize(20000);
        window.cinemaMetrics = { draws: [], longTasks: [], drawTimes: [], lag: [] };
        const original = CanvasRenderingContext2D.prototype.drawImage;
        CanvasRenderingContext2D.prototype.drawImage = function (...args) {
          const start = performance.now(); const result = original.apply(this, args);
          window.cinemaMetrics.draws.push(performance.now() - start); window.cinemaMetrics.drawTimes.push(performance.now()); return result;
        };
        new PerformanceObserver(list => window.cinemaMetrics.longTasks.push(...list.getEntries().map(e => e.duration))).observe({ type: 'longtask', buffered: true });
      });
      await page.goto(base, { waitUntil: 'networkidle' });
      await settled(page);
      snapshots.push(await sample(page));
      const initialTransfer = await page.evaluate(() => performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0));
      assert.equal(await page.locator('.cinematic-debug').count(), 0);
      await page.screenshot({ path: path.join(out, `${name}-canvas-hero.png`) });
      const tinyFrames = [];
      for (let y = 10; y <= 100; y += 10) {
        await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
        await settled(page); tinyFrames.push(Number((await sample(page)).renderedFrame));
      }
      assert.ok(new Set(tinyFrames).size >= 4, 'small scrolls did not expose intermediate frames');
      const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      // Real input smoke test, including touch gesture on the emulated handset.
      if (name === 'mobile') {
        const cdp = await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 600 }] });
        for (let step = 1; step <= 20; step++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 600 - step * 20 }] });
          await sleep(20);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else await page.mouse.wheel(0, 400);
      await sleep(700); await settled(page);
      assert.ok((await sample(page)).y > 0);
      // A six-second, rAF-paced slow scroll exposes actual in-section motion.
      const slowMotion = await page.evaluate(async () => {
        const c = document.querySelector('canvas.cinematic-canvas');
        scrollTo({ top: 100, behavior: 'instant' });
        const frames = [], intervals = [], started = performance.now(); let last = started;
        await new Promise(resolve => {
          function tick(now) {
            intervals.push(now - last); last = now;
            const elapsed = now - started;
            scrollTo({ top: 100 + Math.min(600, elapsed / 10), behavior: 'instant' });
            frames.push({ target: +c.dataset.targetFrame, displayed: +c.dataset.renderedFrame });
            if (elapsed < 6000) requestAnimationFrame(tick); else resolve();
          }
          requestAnimationFrame(tick);
        });
        return { uniqueDisplayedFrames: new Set(frames.map(frame => frame.displayed)).size,
          maxFrameLag: Math.max(...frames.map(frame => Math.abs(frame.target - frame.displayed))),
          exactSampleFraction: frames.filter(frame => frame.target === frame.displayed).length / frames.length,
          delayedAnimationTicks: intervals.filter(ms => ms > 25).length, ticks: intervals.length };
      });
      assert.ok(slowMotion.uniqueDisplayedFrames > 30, 'slow movement failed to draw sequential pictures');
      await settled(page); await sleep(500);
      // Rapid scroll and direction changes always settle on the newest target.
      for (const fraction of [.95, .2, .8, .1, 1]) {
        await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), max * fraction); await sleep(35);
      }
      await settled(page); assert.equal(+(await sample(page)).renderedFrame, name === 'mobile' ? 1340 : 1675);
      // Full forward/reverse sweeps. Native document scroll; no cinematic seek API.
      for (const direction of [1, -1]) {
        for (let i = 0; i <= 120; i++) {
          const y = max * (direction === 1 ? i / 120 : 1 - i / 120);
          await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
          await sleep(90);
          if (i % 12 === 0) { await settled(page); snapshots.push(await sample(page)); }
        }
        await settled(page);
        await page.screenshot({ path: path.join(out, `${name}-canvas-${direction === 1 ? 'footer' : 'returned'}.png`) });
      }
      // Interior points of every section must move, not just section transitions.
      const sections = await page.evaluate(() => [...document.querySelectorAll('.cinema-hero,.food-marquee,.offers-section,.food-categories,#reservation,#reviews,#contact,.site-footer')].map(el => ({
        selector: el.id || el.className, top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height
      })));
      const sectionChecks = [];
      for (const section of sections) {
        const frames = [];
        for (const fraction of [.2, .5, .8]) {
          const y = section.selector === 'footer' ? max - Math.min(250, viewport.height * .35) * (1 - fraction) : Math.min(max, section.top + section.height * fraction);
          await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
          await settled(page); frames.push(Number((await sample(page)).renderedFrame));
        }
        if (section.selector === 'footer' || section.top + section.height * .8 < max) assert.ok(new Set(frames).size > 1, `${name}: no motion in ${section.selector}`);
        sectionChecks.push({ section: section.selector, frames });
      }
      const still = await sample(page); await sleep(500); assert.equal((await sample(page)).renderedFrame, still.renderedFrame);
      assert.ok(requests.every(url => url.includes(`/${name}/`)), 'cross-variant downloads');
      assert.ok(snapshots.every(s => !s.overflow));
      assert.ok(snapshots.every(s => +s.cachedFrames <= (name === 'mobile' ? 12 : 18)));
      assert.ok(snapshots.every(s => +s.pendingFrames <= (name === 'mobile' ? 3 : 4)));
      assert.ok(snapshots.every(s => s.pixel.slice(0, 3).some(v => v > 0)), 'black canvas');
      const metrics = await page.evaluate(() => window.cinemaMetrics);
      metrics.draws.sort((a, b) => a - b);
      const transfer = await page.evaluate(() => performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0));
      report.variants[name] = { viewport, requests: requests.length, initialTransferBytes: initialTransfer, traversalTransferBytes: transfer,
        slowMotion, snapshots, sectionChecks, tinyFrames, errors,
        drawCount: metrics.draws.length, drawP95Milliseconds: metrics.draws[Math.floor(metrics.draws.length * .95)],
        longTaskCount: metrics.longTasks.length, longestTaskMilliseconds: Math.max(0, ...metrics.longTasks) };
      assert.deepEqual(errors, []);
      await page.getByRole('button', { name: 'Use static background', exact: true }).click();
      await sleep(300); const stoppedRequests = requests.length; await sleep(400); assert.equal(requests.length, stoppedRequests);
      const video = page.video(); await context.close();
      await video.saveAs(path.join(out, `${name}-scroll-recording.webm`));
      await video.delete();
      console.log(name, 'forward/reverse, section interiors, freeze, limits, single variant, static mode passed');
    }
    const reduced = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await reduced.newPage(); let frameRequests = 0;
    page.on('request', req => { if (/frame-\d+\.webp/.test(req.url())) frameRequests++; });
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(frameRequests, 0); assert.equal(await page.locator('.cinematic-canvas.is-ready').count(), 0);
    report.reducedMotion = 'Static by default; zero frame requests'; await reduced.close();
    const failure = await browser.newContext(); const failedPage = await failure.newPage();
    await failedPage.route('**/manifest.json', route => route.abort());
    await failedPage.goto(base, { waitUntil: 'networkidle' });
    await failedPage.getByRole('button', { name: 'Frame sequence unavailable, retry cinema mode' }).waitFor();
    report.manifestFailure = 'Reason exposed; stable poster remains after two failed manifest requests';
    await failedPage.unroute('**/manifest.json');
    await failedPage.getByRole('button', { name: 'Frame sequence unavailable, retry cinema mode' }).click();
    await settled(failedPage); report.manifestRetry = 'Explicit retry restores continuous sequence'; await failure.close();
    const slow = await browser.newContext(); const slowPage = await slow.newPage();
    await slowPage.goto(base, { waitUntil: 'networkidle' }); await settled(slowPage);
    const initial = await sample(slowPage);
    await slowPage.route('**/frame-*.webp', async route => { await sleep(900); await route.continue().catch(() => {}); });
    await slowPage.evaluate(() => scrollTo({ top: 3500, behavior: 'instant' }));
    await sleep(200); const held = await sample(slowPage);
    assert.equal(held.renderedFrame, initial.renderedFrame); assert.ok(held.pixel.slice(0, 3).some(v => v > 0));
    await settled(slowPage); report.delayedFrames = 'Last picture held during 900ms delay; latest target rendered after load';
    const beforeResize = await sample(slowPage);
    await slowPage.setViewportSize({ width: 390, height: 844 }); await settled(slowPage);
    const afterResize = await sample(slowPage);
    console.log('Variant resize timestamps', beforeResize.time, afterResize.time);
    assert.equal(afterResize.variant, 'mobile');
    assert.ok(Math.abs(+beforeResize.time - +afterResize.time) < .05, 'variant chronology reset');
    await slowPage.locator('.site-footer').getByRole('link', { name: 'About Us', exact: true }).click();
    await slowPage.waitForURL(`${base}/about`); await sleep(500);
    assert.equal(await slowPage.locator('canvas.cinematic-canvas:visible').count(), 0);
    report.resizeAndRoute = 'Variant switches at breakpoint preserving timestamp; client navigation to About removes visible sequence renderer'; await slow.close();
  } finally {
    await browser.close(); fs.writeFileSync(path.join(out, 'browser-validation.json'), JSON.stringify(report, null, 2));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
