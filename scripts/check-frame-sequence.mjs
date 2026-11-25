import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync('src/lib/cinematic/frame-sequence.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { frameAtTime, frameWindow, FrameSequence } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const sequence = { frameCount: 1675, fps: 30, startIndex: 1, endIndex: 1675, pattern: '/frame-%05d.webp' };
assert.equal(frameAtTime(0, sequence), 1);
assert.equal(frameAtTime(55.833333, sequence), 1675);
assert.equal(frameAtTime(-10, sequence), 1);
assert.equal(frameAtTime(1 / 30, sequence), 2);
assert.equal(frameAtTime(NaN, sequence), 1);
for (const progress of [0, .1, .35, .7, 1]) {
  const mobile = { ...sequence, fps: 24, frameCount: 1340, endIndex: 1340 };
  const time = progress * 55.833333;
  assert.ok(Math.abs((frameAtTime(time, sequence) - 1) / 30 - (frameAtTime(time, mobile) - 1) / 24) <= 1 / 24);
}
assert.deepEqual(frameWindow(100, 1, sequence).slice(0, 5), [100, 101, 99, 102, 98]);
assert.deepEqual(frameWindow(100, -1, sequence).slice(0, 5), [100, 99, 101, 98, 102]);
assert.ok(frameWindow(1, -1, sequence).every(n => n >= 1));
let active = 0, peak = 0, closed = 0;
const requested = new Map();
globalThis.fetch = async (_url, { signal }) => {
  requested.set(_url, (requested.get(_url) ?? 0) + 1);
  active++; peak = Math.max(peak, active);
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 5);
      signal.addEventListener('abort', () => { clearTimeout(timer); reject(new Error('aborted')); }, { once: true });
    });
    return { ok: true, blob: async () => ({}) };
  } finally { active--; }
};
globalThis.createImageBitmap = async () => ({ close: () => closed++ });
const loader = new FrameSequence(sequence, 20, 3, () => {});
loader.request(100);
loader.request(100);
await new Promise(resolve => setTimeout(resolve, 80));
assert.ok(loader.get(100));
assert.equal(requested.get('/frame-00100.webp'), 1);
assert.equal(loader.nearest(101, 100), 101);
loader.request(1000);
loader.request(500);
await new Promise(resolve => setTimeout(resolve, 100));
assert.ok(loader.get(500));
assert.ok(loader.cache.size <= 20);
assert.ok(peak <= 3);
assert.ok(!loader.cache.has(1000));
loader.dispose();
assert.equal(loader.cache.size, 0);
assert.ok(closed > 0);
let failureReason = '';
globalThis.fetch = async () => ({ ok: false, status: 404 });
const failed = new FrameSequence(sequence, 12, 3, () => {}, reason => { failureReason = reason; failed.dispose(); });
failed.request(1);
await new Promise(resolve => setTimeout(resolve, 30));
assert.match(failureReason, /failures/);
assert.equal(failed.cache.size, 0);
console.log('Indexing, normalized variant timestamps, priority, deduplication, cancellation, concurrency, eviction, failed-frame fallback and disposal passed.');
