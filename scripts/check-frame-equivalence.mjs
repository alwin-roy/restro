import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
async function load(file) {
  const source = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const before = await load('artifacts/performance-preservation/before/frame-sequence.ts.txt');
const after = await load('src/lib/cinematic/frame-sequence.ts');
const sequence = { frameCount: 1675, fps: 30, startIndex: 1, endIndex: 1675, pattern: '/frame-%05d.webp', width: 1280, height: 720 };
let seed = 21;
const random = max => { seed = seed * 16807 % 2147483647; return Math.floor(seed / 2147483647 * max); };
for (let trial = 0; trial < 1500; trial++) {
  const original = new before.FrameSequence(sequence, 18, 4, () => {});
  const optimized = new after.FrameSequence(sequence, 18, 4, () => {});
  const target = random(1675) + 1, displayed = random(3) ? random(1675) + 1 : -1;
  for (let i = 0; i < 65; i++) {
    const index = random(1675) + 1;
    original.cache.set(index, {}); optimized.cache.set(index, {});
  }
  assert.equal(optimized.nearest(target, displayed), original.nearest(target, displayed));
  // Include dense equal-distance ties; insertion order must stay authoritative.
  for (const index of [target - 2, target + 2, target - 1, target + 1]) {
    original.cache.set(index, {}); optimized.cache.set(index, {});
  }
  assert.equal(optimized.nearest(target, displayed), original.nearest(target, displayed));
  original.target = target; optimized.target = target;
  const wanted = before.frameWindow(target, trial % 2 ? 1 : -1, sequence, 20, 6);
  const releasedBefore = [], releasedAfter = [];
  const first = new Map([...original.cache.keys()].map(index => [index, index]));
  const second = new Map(first);
  original.evict(first, 18, value => releasedBefore.push(value), wanted);
  optimized.evict(second, 18, value => releasedAfter.push(value), wanted);
  assert.deepEqual(releasedAfter, releasedBefore);
  assert.deepEqual([...second.keys()], [...first.keys()]);
}
for (const fps of [24, 30]) for (let i = -10; i < 2000; i++) {
  const time = i / fps;
  assert.equal(after.frameAtTime(time, { ...sequence, fps }), before.frameAtTime(time, { ...sequence, fps }));
}
console.log('1,500 randomized cache/tie/eviction comparisons and unchanged 24/30fps frame indexing passed against the saved baseline.');
