import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';
import { chromium } from '../node_modules/.cache/restro-qa/node_modules/playwright/index.mjs';
const root = path.resolve('artifacts/performance-preservation');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  for (const width of [1440, 390]) {
    const samples = [];
    const w = width === 1440 ? 360 : 156, h = Math.round(w * 900 / width);
    for (const phase of ['before', 'after']) {
      const body = fs.readFileSync(path.join(root, phase, `${width}-scroll.webm`));
      await page.route('http://recording.local/clip.webm', route => {
        const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers().range ?? '');
        const start = range ? +range[1] : 0, end = range?.[2] ? +range[2] : body.length - 1;
        return route.fulfill({ status: range ? 206 : 200, body: body.subarray(start, end + 1), contentType: 'video/webm', headers: {
          'access-control-allow-origin': '*', 'accept-ranges': 'bytes',
          ...(range ? { 'content-range': `bytes ${start}-${end}/${body.length}` } : {}),
        } });
      });
      await page.setContent('<video crossorigin="anonymous" src="http://recording.local/clip.webm" preload="auto"></video>');
      await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
      for (const time of [4, 8, 12, 16]) {
        const png = await page.evaluate(async ({ time, w, h }) => {
          const video = document.querySelector('video');
          await new Promise(resolve => {
            video.onseeked = () => requestAnimationFrame(() => requestAnimationFrame(resolve));
            video.currentTime = time;
          });
          const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(video, 0, 0, w, h);
          return canvas.toDataURL('image/png').split(',')[1];
        }, { time, w, h });
        samples.push({ input: Buffer.from(png, 'base64'), left: [4, 8, 12, 16].indexOf(time) * w, top: phase === 'before' ? 0 : h });
      }
      await page.unroute('http://recording.local/clip.webm');
    }
    await sharp({ create: { width: w * 4, height: h * 2, channels: 3, background: '#100d0b' } }).composite(samples).png().toFile(path.join(root, `${width}-recording-review.png`));
  }
  fs.writeFileSync(path.join(root, 'recording-review.json'), JSON.stringify({ times: [4, 8, 12, 16], rows: ['before', 'after'], viewports: [1440, 390], purpose: 'Sample actual before/after recordings through forward and reverse scroll; compare full Canvas pixels separately in renderer-pixels.json.' }, null, 2));
  console.log('Extracted paired forward/reverse filmstrips from all four actual recordings.');
} finally { await browser.close(); }
