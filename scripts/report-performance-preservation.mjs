import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root = 'artifacts/performance-preservation';
const read = file => JSON.parse(fs.readFileSync(`${root}/${file}`, 'utf8'));
const baselineAssets = read('before/assets.json'), optimizedAssets = read('after/assets.json');
assert.deepEqual(optimizedAssets, baselineAssets, 'Public asset bytes changed');
const source = read('before/source-hashes.json');
const changedSource = source.filter(entry => crypto.createHash('sha256').update(fs.readFileSync(entry.file)).digest('hex') !== entry.sha256).map(entry => entry.file);
assert.deepEqual(changedSource.sort(), ['src/lib/cinematic/canvas-controller.ts', 'src/lib/cinematic/frame-sequence.ts']);
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const metrics = Object.fromEntries(['before', 'after'].map(phase => [phase, read(`${phase}/metrics.json`)]));
const summary = [];
for (const width of [1440, 390]) {
  const collect = phase => {
    const trials = metrics[phase].filter(item => item.width === width);
    assert.equal(trials.length, 3);
    assert.ok(trials.every(item => item.errors.length === 0 && item.wrongVariantRequests === 0));
    return { readyMs: median(trials.map(t => t.readyMs)), scriptMs: median(trials.map(t => t.cpu.ScriptDuration * 1000)), taskMs: median(trials.map(t => t.cpu.TaskDuration * 1000)), layoutMs: median(trials.map(t => t.cpu.LayoutDuration * 1000)), heapMiB: median(trials.map(t => t.cpu.JSHeapUsedSize / 1048576)), peakBitmapMiB: median(trials.map(t => t.counters.maxBitmapBytes / 1048576)), draws: median(trials.map(t => t.counters.draws)), frameRequests: median(trials.map(t => t.frameRequests)), duplicateFrameRequests: median(trials.map(t => t.duplicateFrameRequests)), coldBytes: median(trials.map(t => t.cold.resourceBytes)), warmBytes: median(trials.map(t => t.warm.resourceBytes)), intervalP95: median(trials.map(t => t.scroll.intervalP95)), over34ms: median(trials.map(t => t.scroll.over34ms)), frameLagP95: median(trials.map(t => t.scroll.frameLagP95)) };
  };
  summary.push({ width, before: collect('before'), after: collect('after') });
}
const screenshots = [];
for (const width of [1440, 390]) {
  const before = metrics.before.find(t => t.width === width && t.run === 0), after = metrics.after.find(t => t.width === width && t.run === 0);
  for (const shot of before.snapshots) {
    const match = after.snapshots.find(s => s.name === shot.name);
    const a = await sharp(`${root}/before/${shot.file}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(`${root}/after/${match.file}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.deepEqual(b.info, a.info);
    let pixels = 0, totalDifference = 0;
    for (let i = 0; i < a.data.length; i += 4) {
      let different = false;
      for (let c = 0; c < 3; c++) { const delta = Math.abs(a.data[i + c] - b.data[i + c]); totalDifference += delta; if (delta > 2) different = true; }
      if (different) pixels++;
    }
    screenshots.push({ width, name: shot.name, changedPixelsPercent: pixels / (a.info.width * a.info.height) * 100, meanChannelDifference: totalDifference / (a.info.width * a.info.height * 3), beforeFrame: shot.state.renderedFrame, afterFrame: match.state.renderedFrame, sameCanvasSize: shot.state.width === match.state.width && shot.state.height === match.state.height, samePixel: JSON.stringify(shot.state.pixel) === JSON.stringify(match.state.pixel) });
  }
}
const work = { before: read('before/cinematic-work.json'), after: read('after/cinematic-work.json') };
const scheduler = { before: read('before/scheduler-benchmark.json'), after: read('after/scheduler-benchmark.json') };
const report = { publicAssetCount: baselineAssets.length, publicAssetBytes: baselineAssets.reduce((n, e) => n + e.bytes, 0), changedSource, summary, screenshots, work, scheduler };
fs.writeFileSync(`${root}/comparison.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
