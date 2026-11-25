import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from '../node_modules/.cache/restro-qa/node_modules/playwright/index.mjs';

const phase = process.argv[2] ?? 'before';
const base = process.env.PERF_BASE ?? 'http://localhost:3300';
const out = path.resolve('artifacts/performance-preservation', phase);
fs.mkdirSync(out, { recursive: true });
const assets = [];
function inventory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) inventory(file);
    else assets.push({ file: path.relative('public', file).replaceAll('\\', '/'), bytes: fs.statSync(file).size, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') });
  }
}
inventory('public');
fs.writeFileSync(path.join(out, 'assets.json'), JSON.stringify(assets, null, 2));
const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ready = async page => {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForFunction(() => {
    const canvas = document.querySelector('.cinematic-canvas');
    return canvas?.dataset.targetFrame === canvas?.dataset.renderedFrame && canvas?.dataset.status === 'ready';
  }, null, { timeout: 30000 });
};
try {
  for (const width of [1440, 390]) for (let run = 0; run < 3; run++) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390,
      ...(run === 0 ? { recordVideo: { dir: out, size: { width, height: 900 } } } : {}) });
    const page = await context.newPage();
    const errors = [], requests = [], failed = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('request', request => requests.push(request.url()));
    page.on('requestfailed', request => failed.push(request.url()));
    await page.addInitScript(() => {
      window.__profile = { draws: 0, decodes: 0, rectReads: 0, maxBitmapBytes: 0, bitmapBytes: 0, maxPending: 0, maxCache: 0 };
      const stats = window.__profile;
      const draw = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (...args) { stats.draws++; return draw.apply(this, args); };
      const bitmap = window.createImageBitmap;
      window.createImageBitmap = async function (...args) {
        stats.decodes++;
        const image = await bitmap.apply(this, args), bytes = image.width * image.height * 4;
        stats.bitmapBytes += bytes; stats.maxBitmapBytes = Math.max(stats.maxBitmapBytes, stats.bitmapBytes);
        const close = image.close.bind(image); let closed = false;
        image.close = () => { if (!closed) { stats.bitmapBytes -= bytes; closed = true; } close(); };
        return image;
      };
      const rect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function () { stats.rectReads++; return rect.call(this); };
      new PerformanceObserver(list => { window.__longTasks ??= []; window.__longTasks.push(...list.getEntries().map(entry => entry.duration)); }).observe({ type: 'longtask', buffered: true });
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    const start = performance.now();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await ready(page);
    const readyMs = performance.now() - start;
    await page.waitForTimeout(1200);
    const cold = await page.evaluate(() => ({ resourceBytes: performance.getEntriesByType('resource').reduce((n, e) => n + e.transferSize, 0), ...window.__profile }));
    const metricStart = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(metric => [metric.name, metric.value]));
    const scroll = await page.evaluate(async () => {
      const intervals = [], lag = []; let previous = performance.now();
      const max = document.documentElement.scrollHeight - innerHeight;
      for (const reverse of [false, true]) {
        const start = performance.now();
        await new Promise(resolve => {
          function step(now) {
            intervals.push(now - previous); previous = now;
            const progress = Math.min(1, (now - start) / 6500);
            scrollTo({ top: max * (reverse ? 1 - progress : progress), behavior: 'instant' });
            const canvas = document.querySelector('.cinematic-canvas');
            lag.push(Math.abs(Number(canvas.dataset.targetFrame) - Number(canvas.dataset.renderedFrame)));
            const stats = window.__profile;
            stats.maxPending = Math.max(stats.maxPending, +canvas.dataset.pendingFrames || 0);
            stats.maxCache = Math.max(stats.maxCache, +canvas.dataset.cachedFrames || 0);
            if (progress < 1) requestAnimationFrame(step); else resolve();
          }
          requestAnimationFrame(step);
        });
        await new Promise(resolve => setTimeout(resolve, 700)); previous = performance.now();
      }
      intervals.sort((a, b) => a - b); lag.sort((a, b) => a - b);
      return { rAFFrames: intervals.length, intervalP50: intervals[Math.floor(intervals.length * .5)], intervalP95: intervals[Math.floor(intervals.length * .95)], over34ms: intervals.filter(n => n > 34).length, frameLagP95: lag[Math.floor(lag.length * .95)] };
    });
    await ready(page);
    const metricEnd = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(metric => [metric.name, metric.value]));
    const counters = await page.evaluate(() => ({ ...window.__profile, longTaskCount: window.__longTasks?.length ?? 0, longTaskMs: (window.__longTasks ?? []).reduce((a, b) => a + b, 0), ...document.querySelector('canvas').dataset }));
    const scrollRequests = requests.length;
    const frameRequests = requests.filter(url => /frame-\d+\.webp/.test(url));
    const report = { width, run, readyMs, cold, scroll, counters, cpu: Object.fromEntries(['ScriptDuration', 'TaskDuration', 'LayoutDuration', 'RecalcStyleDuration', 'LayoutCount', 'JSHeapUsedSize'].map(key => [key, key === 'JSHeapUsedSize' ? metricEnd[key] : metricEnd[key] - metricStart[key]])), requests: scrollRequests, frameRequests: frameRequests.length, duplicateFrameRequests: frameRequests.length - new Set(frameRequests).size, wrongVariantRequests: frameRequests.filter(url => url.includes(width === 390 ? '/desktop/' : '/mobile/')).length, failedRequests: failed.length, errors };
    if (run === 0) {
      report.snapshots = [];
      for (const [name, selector] of [['hero', '.cinema-hero'], ['offers', '.offers-section'], ['menu', '.food-categories'], ['reservation', '#reservation'], ['contact', '#contact']]) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        if (name === 'offers') { await page.locator(selector).hover(); await page.getByRole('button', { name: /Show promotion 1:/ }).click(); }
        await page.mouse.move(0, 0);
        await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
        await ready(page); await page.waitForTimeout(3500);
        // Freeze only the test capture, at identical animation times in both phases.
        await page.evaluate(() => document.getAnimations().forEach(animation => {
          if (animation.effect.getTiming().iterations === Infinity) { animation.pause(); animation.currentTime = 1000; }
          else animation.finish();
        }));
        await ready(page);
        const state = await page.locator('canvas').evaluate(c => ({ ...c.dataset, width: c.width, height: c.height, pixel: [...c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data] }));
        const file = `${width}-${name}.png`;
        await page.locator(selector).screenshot({ path: path.join(out, file), animations: 'allow' });
        report.snapshots.push({ name, file, state });
      }
    }
    // Same browser's warm reload: measure real transfer rather than inferring caching.
    await page.goto(base, { waitUntil: 'domcontentloaded' }); await ready(page); await page.waitForTimeout(1200);
    report.warm = await page.evaluate(() => ({ resourceBytes: performance.getEntriesByType('resource').reduce((n, e) => n + e.transferSize, 0), ...window.__profile }));
    await context.close();
    if (run === 0) { const video = await page.video().path(); fs.renameSync(video, path.join(out, `${width}-scroll.webm`)); }
    results.push(report);
    fs.writeFileSync(path.join(out, 'metrics.json'), JSON.stringify(results, null, 2));
    console.log(`${phase} ${width}px run ${run + 1}: ready ${readyMs.toFixed(0)}ms, script ${(report.cpu.ScriptDuration * 1000).toFixed(1)}ms, draws ${counters.draws}, requests ${report.frameRequests}`);
  }
} finally { await browser.close(); }
