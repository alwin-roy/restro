export type Sequence = {
  frameCount: number; fps: number; width: number; height: number;
  pattern: string; startIndex: number; endIndex: number;
};
export type FrameImage = { source: CanvasImageSource; width: number; height: number; close: () => void };

export function frameAtTime(time: number, sequence: Sequence) {
  const safe = Number.isFinite(time) ? time : 0;
  return Math.max(sequence.startIndex, Math.min(sequence.endIndex, Math.floor(safe * sequence.fps) + sequence.startIndex));
}
export function frameWindow(target: number, direction: number, sequence: Sequence, ahead = 12, behind = 4) {
  const result = [target];
  for (let offset = 1; offset <= Math.max(ahead, behind); offset++) {
    if (offset <= ahead) result.push(target + offset * direction);
    if (offset <= behind) result.push(target - offset * direction);
  }
  return result.filter(index => index >= sequence.startIndex && index <= sequence.endIndex);
}

/** Prefer bitmap decoding; older engines can decode the same fetched Blob as an image. */
export async function decodeFrame(blob: Blob): Promise<FrameImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch { /* A supported WebP image may still be unsupported by ImageBitmap. */ }
  }
  const url = URL.createObjectURL(blob);
  const image = new Image(); image.decoding = 'async';
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve(); image.onerror = () => reject(new Error('WebP decoding failed')); image.src = url;
    });
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => { image.src = ''; } };
  } finally { URL.revokeObjectURL(url); }
}

/** Small compressed lookahead plus a separate, conservative decoded-memory budget. */
export class FrameSequence {
  readonly cache = new Map<number, FrameImage>();
  readonly pending = new Map<number, AbortController>();
  readonly compressed = new Map<number, Blob>();
  readonly failures = new Map<number, number>();
  private decoding = new Set<number>();
  private queue: number[] = [];
  private decodeQueue: number[] = [];
  private disposed = false;
  private suspended = false;
  target = 1;
  direction = 1;
  constructor(readonly sequence: Sequence, readonly limit: number, readonly concurrency: number,
    private onFrame: () => void, private onFailure: (reason: string) => void = () => {}) {}

  request(target: number) {
    // Completion handlers already pump these windows. Rebuilding them for the
    // same target on every scroll/decode callback cannot change their priority.
    if (this.disposed || (target === this.target && this.queue.length > 0)) return;
    this.direction = target === this.target ? this.direction : target > this.target ? 1 : -1;
    this.target = target;
    this.queue = frameWindow(target, this.direction, this.sequence, this.concurrency === 3 ? 20 : 36, 6);
    const behind = Math.floor((this.limit - 1) / 3);
    this.decodeQueue = frameWindow(target, this.direction, this.sequence, this.limit - 1 - behind, behind);
    const wanted = new Set(this.queue);
    for (const [index, controller] of this.pending) if (!wanted.has(index)) controller.abort();
    this.pump();
  }
  get(index: number) { return this.cache.get(index); }
  /** Only a close, chronologically appropriate decoded frame may bridge a miss. */
  nearest(target: number, displayed: number) {
    if (this.cache.has(target)) return target;
    let nearest: number | undefined, distance = Infinity;
    for (const index of this.cache.keys()) {
      const delta = Math.abs(index - target);
      if (delta > 12 || delta >= distance ||
        (displayed >= 0 && !(target >= displayed ? index >= displayed && index <= target : index <= displayed && index >= target))) continue;
      nearest = index; distance = delta;
    }
    return nearest;
  }
  pause(paused: boolean) {
    this.suspended = paused;
    if (paused) for (const controller of this.pending.values()) controller.abort();
    else this.pump();
  }
  get decodingCount() { return this.decoding.size; }
  get estimatedBytes() { return (this.cache.size + this.decoding.size) * this.sequence.width * this.sequence.height * 4; }
  private evict<T>(map: Map<number, T>, limit: number, release: (value: T) => void, wanted: number[]) {
    if (map.size <= limit) return;
    const preferred = new Set(wanted);
    while (map.size > limit) {
      let farthest: number | undefined, priority = Infinity, distance = -1;
      for (const index of map.keys()) {
        const nextPriority = Number(preferred.has(index)), nextDistance = Math.abs(index - this.target);
        if (nextPriority < priority || (nextPriority === priority && nextDistance > distance)) {
          farthest = index; priority = nextPriority; distance = nextDistance;
        }
      }
      if (farthest === undefined) break;
      release(map.get(farthest)!); map.delete(farthest);
    }
  }
  private pump() {
    if (this.disposed || this.suspended) return;
    // Decode only the inner window. Compressed lookahead never churns the bitmap cache.
    for (const index of this.decodeQueue) {
      if (this.decoding.size >= 2) break;
      const blob = this.compressed.get(index);
      if (!blob || this.cache.has(index) || this.decoding.has(index) || (this.failures.get(index) ?? 0) >= 2) continue;
      this.decoding.add(index);
      void decodeFrame(blob).then(image => {
        if (this.disposed || this.suspended || !this.decodeQueue.includes(index)) { image.close(); return; }
        this.cache.set(index, image); this.evict(this.cache, this.limit, image => image.close(), this.decodeQueue); this.onFrame();
      }).catch(() => this.recordFailure(index)).finally(() => { this.decoding.delete(index); this.pump(); });
    }
    for (const index of this.queue) {
      if (this.pending.size >= this.concurrency) break;
      if (this.compressed.has(index) || this.pending.has(index) || (this.failures.get(index) ?? 0) >= 2) continue;
      const controller = new AbortController(); this.pending.set(index, controller);
      let timedOut = false;
      const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 12000);
      const url = this.sequence.pattern.replace('%05d', String(index).padStart(5, '0'));
      void fetch(url, { signal: controller.signal }).then(response => {
        if (!response.ok) throw new Error(`Frame HTTP ${response.status}`); return response.blob();
      }).then(blob => {
        if (this.disposed || controller.signal.aborted || !this.queue.includes(index)) return;
        this.compressed.set(index, blob);
        this.evict(this.compressed, this.concurrency === 3 ? 40 : 64, () => {}, this.queue);
      }).catch(() => { if (!controller.signal.aborted || timedOut) this.recordFailure(index); })
        .finally(() => { clearTimeout(timeout); this.pending.delete(index); this.pump(); if (!this.disposed) this.onFrame(); });
    }
  }
  private recordFailure(index: number) {
    if (this.disposed || this.suspended) return;
    this.failures.set(index, (this.failures.get(index) ?? 0) + 1);
    const failed = this.queue.filter(index => (this.failures.get(index) ?? 0) >= 2);
    if (failed.length >= 3 && !this.queue.some(index => this.cache.has(index))) this.onFailure('Repeated frame download or decoding failures');
    this.onFrame();
  }
  dispose() {
    this.disposed = true;
    for (const controller of this.pending.values()) controller.abort();
    for (const image of this.cache.values()) image.close();
    this.cache.clear(); this.compressed.clear(); this.queue = []; this.decodeQueue = [];
  }
}
