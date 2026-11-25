import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { chromium } from '../node_modules/.cache/restro-qa/node_modules/playwright/index.mjs';
const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const url = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const timeline = url(compile('src/data/cinematicTimeline.ts')), mapping = url(compile('src/lib/cinematic/scroll-mapping.ts'));
const moduleFor = phase => {
  const original = phase === 'before';
  const sequence = url(compile(original ? 'artifacts/performance-preservation/before/frame-sequence.ts.txt' : 'src/lib/cinematic/frame-sequence.ts'));
  return url(compile(original ? 'artifacts/performance-preservation/before/canvas-controller.ts.txt' : 'src/lib/cinematic/canvas-controller.ts')
    .replace(/from ['"]@\/data\/cinematicTimeline['"]/, `from '${timeline}'`)
    .replace(/from ['"]\.\/frame-sequence['"]/, `from '${sequence}'`)
    .replace(/from ['"]\.\/scroll-mapping['"]/, `from '${mapping}'`));
};
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto('http://localhost:3300/', { waitUntil: 'networkidle' });
    await page.evaluate(async modules => {
      window.__comparison = [];
      for (const source of modules) {
        const rendererModule = await import(source);
        const container = document.createElement('div'); container.hidden = true;
        const canvas = document.createElement('canvas'); container.append(canvas); document.body.append(container);
        const dispose = rendererModule.startCinematicCanvas({ canvas, label: null, debug: null, onFailure: reason => { throw new Error(reason); } });
        window.__comparison.push({ canvas, dispose, container });
      }
    }, [moduleFor('before'), moduleFor('after')]);
    for (const progress of [0, .1, .25, .45, .65, .9, 1, .5, .15, 0]) {
      await page.evaluate(progress => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * progress, behavior: 'instant' }), progress);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.waitForFunction(() => window.__comparison.every(({ canvas }) => canvas.dataset.status === 'ready' && canvas.dataset.targetFrame === canvas.dataset.renderedFrame), null, { timeout: 30000 });
      const pair = await page.evaluate(async () => Promise.all(window.__comparison.map(async ({ canvas }) => {
        const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        const digest = await crypto.subtle.digest('SHA-256', pixels);
        return { frame: canvas.dataset.renderedFrame, target: canvas.dataset.targetFrame, width: canvas.width, height: canvas.height,
          hash: [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('') };
      })));
      assert.deepEqual(pair[1], pair[0]);
      results.push({ viewport: width, progress, ...pair[0] });
    }
    await page.evaluate(() => window.__comparison.forEach(({ dispose, container }) => { dispose(); container.remove(); }));
    await page.close();
  }
  fs.writeFileSync('artifacts/performance-preservation/renderer-pixels.json', JSON.stringify(results, null, 2));
  console.log('20 desktop/mobile forward/reverse samples: original and optimized controllers produce byte-identical full Canvas pixels, dimensions and frame indexes.');
} finally { await browser.close(); }
