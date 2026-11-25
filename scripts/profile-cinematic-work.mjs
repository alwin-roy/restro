import fs from 'node:fs';
import { chromium } from '../node_modules/.cache/restro-qa/node_modules/playwright/index.mjs';
const phase = process.argv[2] ?? 'before';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3300/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.status === 'ready');
  const result = await page.evaluate(async () => {
    const canvas = document.querySelector('canvas');
    const stats = { labelMutations: 0, dataMutations: 0, draws: 0, updates: 0 };
    const observer = new MutationObserver(entries => {
      for (const entry of entries) {
        if (entry.target === document.querySelector('.scene-label')) stats.labelMutations++;
        if (entry.type === 'attributes') stats.dataMutations++;
        if (entry.attributeName === 'data-time') stats.updates++;
      }
    });
    observer.observe(canvas, { attributes: true });
    observer.observe(canvas.parentElement, { attributes: true });
    observer.observe(document.querySelector('.scene-label'), { childList: true });
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (...args) { stats.draws++; return draw.apply(this, args); };
    const started = performance.now();
    await new Promise(resolve => {
      function tick(now) {
        scrollTo({ top: Math.min(300, (now - started) / 10), behavior: 'instant' });
        if (now - started < 3000) requestAnimationFrame(tick); else resolve();
      }
      requestAnimationFrame(tick);
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    observer.disconnect();
    return { ...stats, frame: canvas.dataset.renderedFrame, target: canvas.dataset.targetFrame };
  });
  fs.writeFileSync(`artifacts/performance-preservation/${phase}/cinematic-work.json`, JSON.stringify(result, null, 2));
  console.log(phase, result);
} finally { await browser.close(); }
