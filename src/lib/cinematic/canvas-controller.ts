import { cinematicTimeline } from '@/data/cinematicTimeline';
import { FrameSequence, frameAtTime, type FrameImage, type Sequence } from './frame-sequence';
import { mapScrollToTime, type ScrollAnchor } from './scroll-mapping';

type Manifest = { duration: number; sequences: Record<'desktop' | 'mobile', Sequence> };
type Options = { canvas: HTMLCanvasElement; label: HTMLElement | null; debug: HTMLElement | null; onFailure: (reason: string) => void };

export function startCinematicCanvas({ canvas, label, debug, onFailure }: Options) {
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) { onFailure('Canvas 2D is unavailable'); return () => {}; }
  let disposed = false, raf = 0, geometryDirty = true, sizeDirty = true;
  let anchors: ScrollAnchor[] = [], manifest: Manifest | undefined, loader: FrameSequence | undefined;
  let variant: 'desktop' | 'mobile' = innerWidth < 768 ? 'mobile' : 'desktop';
  let targetTime = 0, displayed = -1, direction = 1, previousY = scrollY, scene = 0, focal = .5;
  let held: FrameImage | undefined, drawTimes: number[] = [], lastDebug = 0;
  let resizeTime: number | undefined;
  let continuityAnchor: ScrollAnchor | undefined;
  const request = new AbortController();
  const editing = () => !!document.activeElement?.matches('input,textarea,select') || !!document.querySelector('dialog[open]');
  const schedule = () => { if (!disposed && !document.hidden && !raf) raf = requestAnimationFrame(update); };
  const measure = () => { geometryDirty = true; schedule(); };
  const resize = () => { if (displayed >= 0 && !editing()) resizeTime = targetTime; sizeDirty = true; measure(); };
  const fail = (reason: string) => { if (!disposed) onFailure(reason); };

  function selectVariant(next: 'desktop' | 'mobile') {
    if (!manifest) return;
    // The Canvas itself retains the old picture while its entire old cache is released.
    loader?.dispose(); held = undefined; displayed = -1; variant = next;
    loader = new FrameSequence(manifest.sequences[next], next === 'mobile' ? 14 : 20, next === 'mobile' ? 5 : 7, schedule, fail);
    canvas.dataset.variant = next; sizeDirty = true;
    loader.request(frameAtTime(targetTime, loader.sequence));
  }
  function geometry() {
    const previousTime = anchors.length ? mapScrollToTime(scrollY, anchors) : undefined;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const next: ScrollAnchor[] = [];
    for (const item of cinematicTimeline) {
      const el = document.querySelector(item.selector); if (!el) continue;
      const ceiling = item.selector === '.site-footer' ? max - Math.min(250, innerHeight * .35) : max - 1;
      const y = item.time === 0 ? 0 : Math.max(0, Math.min(ceiling, el.getBoundingClientRect().top + scrollY - 100));
      if (!next.length || y > next[next.length - 1].y) next.push({ y, time: item.time });
    }
    next.push({ y: max, time: manifest?.duration ?? 55.833333 });
    const newTime = mapScrollToTime(scrollY, next);
    if (resizeTime !== undefined && scrollY > 0 && scrollY < max) continuityAnchor = { y: scrollY, time: resizeTime };
    if (!continuityAnchor && previousTime !== undefined && Math.abs(previousTime - newTime) > .001 && Math.abs(previousTime - newTime) < .75 && scrollY > 0 && scrollY < max) {
      continuityAnchor = { y: scrollY, time: previousTime };
    }
    const stable = continuityAnchor && continuityAnchor.y > 0 && continuityAnchor.y < max ? continuityAnchor : undefined;
    // Keep the camera stable through orientation/reflow without moving the document
    // or introducing non-monotonic time. Endpoints always retain their exact frames.
    anchors = stable ? [...next.filter(anchor => anchor.y < stable.y ? anchor.time < stable.time : anchor.y > stable.y && anchor.time > stable.time),
      stable].sort((a, b) => a.y - b.y) : next;
    resizeTime = undefined; geometryDirty = false;
  }
  function draw(image: FrameImage, index: number, xFocus: number) {
    if (!context) return;
    if (sizeDirty) {
      const ratio = Math.min(devicePixelRatio || 1, variant === 'mobile' ? 1.5 : 2, loader!.sequence.width / innerWidth);
      const width = Math.max(1, Math.round(innerWidth * ratio)), height = Math.max(1, Math.round(innerHeight * ratio));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      sizeDirty = false;
    }
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    context.drawImage(image.source, (canvas.width - image.width * scale) * xFocus,
      (canvas.height - image.height * scale) / 2, image.width * scale, image.height * scale);
    displayed = index; focal = xFocus; held = image;
    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
    if (canvas.dataset.renderedFrame !== String(index)) canvas.dataset.renderedFrame = String(index);
    if (debug) {
      const now = performance.now(); drawTimes = drawTimes.filter(time => time > now - 1000); drawTimes.push(now);
    }
  }
  function update() {
    raf = 0;
    if (disposed || document.hidden || editing()) return;
    if (geometryDirty) geometry();
    if (scrollY !== previousY) direction = scrollY > previousY ? 1 : -1;
    previousY = scrollY;
    targetTime = mapScrollToTime(scrollY, anchors);
    if (!manifest) return;
    const nextVariant = innerWidth < 768 ? 'mobile' : 'desktop';
    if (!loader || nextVariant !== variant) selectVariant(nextVariant);
    if (!loader) return;
    scene = Math.max(0, cinematicTimeline.findLastIndex(item => targetTime >= item.time));
    const sceneValue = String(scene);
    if (canvas.parentElement!.dataset.scene !== sceneValue) canvas.parentElement!.dataset.scene = sceneValue;
    const sceneLabel = `${String(scene + 1).padStart(2, '0')} / ${cinematicTimeline[scene].label}`;
    if (label && label.textContent !== sceneLabel) label.textContent = sceneLabel;
    const target = frameAtTime(targetTime, loader.sequence);
    loader.request(target);
    const index = loader.nearest(target, displayed);
    // A smooth focal envelope follows the kitchen sequence, never a section-edge jump.
    const kitchen = Math.min(1, Math.max(0, (targetTime - 18) / 3), Math.max(0, (35 - targetTime) / 3));
    const xFocus = variant === 'mobile' ? .5 + .1 * kitchen * kitchen * (3 - 2 * kitchen) : .5;
    const image = index !== undefined ? loader.get(index) : held && loader.get(displayed) === held ? held : undefined;
    const drawableIndex = index ?? displayed;
    if (image && (drawableIndex !== displayed || sizeDirty || Math.abs(focal - xFocus) > .001)) draw(image, drawableIndex, xFocus);
    const progress = scrollY / Math.max(1, anchors[anchors.length - 1].y);
    const metadata = { targetFrame: String(target), cachedFrames: String(loader.cache.size), pendingFrames: String(loader.pending.size),
      totalFrames: String(loader.sequence.frameCount), direction: String(direction), progress: progress.toFixed(5),
      memoryBytes: String(loader.estimatedBytes + canvas.width * canvas.height * 4),
      status: displayed === target ? 'ready' : 'buffering', fallback: 'none', time: targetTime.toFixed(5) };
    for (const [key, value] of Object.entries(metadata)) if (canvas.dataset[key] !== value) canvas.dataset[key] = value;
    if (debug && performance.now() - lastDebug > 100) {
      lastDebug = performance.now();
      debug.textContent = JSON.stringify({ ...canvas.dataset, section: cinematicTimeline[scene].label,
        compressedFrames: loader.compressed.size, decoding: loader.decodingCount,
        visibleDrawsLastSecond: drawTimes.filter(time => time > performance.now() - 1000).length,
        frameLag: Math.abs(target - displayed), fallbackReason: 'none' }, null, 2);
    }
  }
  const visibility = () => {
    loader?.pause(document.hidden); if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else measure();
  };
  const observer = new ResizeObserver(measure);
  document.querySelectorAll('.cinematic-home main > *, .site-footer').forEach(el => observer.observe(el));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', resize); window.addEventListener('orientationchange', resize);
  window.addEventListener('pageshow', measure); window.addEventListener('hashchange', measure);
  document.addEventListener('visibilitychange', visibility); document.addEventListener('focusout', resize);
  document.addEventListener('close', resize, true);
  document.fonts.ready.then(() => { if (!disposed) measure(); });
  void (async () => {
    // One transient manifest error must not permanently lock a capable browser in static mode.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch('/images/cinematic%20hero%20section/manifest.json', {
          signal: AbortSignal.any([request.signal, AbortSignal.timeout(10000)]), cache: 'no-cache',
        });
        if (!response.ok) throw new Error(`Frame manifest HTTP ${response.status}`);
        const value: Manifest = await response.json();
        for (const sequence of Object.values(value.sequences)) {
          if (!Number.isInteger(sequence.frameCount) || sequence.frameCount < 2 || sequence.endIndex - sequence.startIndex + 1 !== sequence.frameCount ||
            !Number.isFinite(sequence.fps) || sequence.fps <= 0 || sequence.width <= 0 || sequence.height <= 0 || !sequence.pattern.startsWith('/images/cinematic%20hero%20section/')) throw new Error('Invalid frame manifest');
        }
        if (!value.sequences.desktop || !value.sequences.mobile || !Number.isFinite(value.duration) || value.duration <= 0) throw new Error('Incomplete frame manifest');
        if (disposed) return; manifest = value; geometryDirty = true; schedule();
        if (typeof requestIdleCallback === 'function') {
          requestIdleCallback(() => {
            if (!disposed && scrollY < 50 && loader) loader.warmup(1, 28);
          }, { timeout: 2000 });
        } else {
          setTimeout(() => {
            if (!disposed && scrollY < 50 && loader) loader.warmup(1, 20);
          }, 1000);
        }
        return;
      } catch (error) {
        if (disposed) return;
        if (attempt === 1) fail(error instanceof Error ? error.message : 'Frame manifest unavailable');
      }
    }
  })();
  schedule();
  return () => {
    disposed = true; request.abort(); cancelAnimationFrame(raf); observer.disconnect(); loader?.dispose(); held = undefined;
    window.removeEventListener('scroll', schedule); window.removeEventListener('resize', resize); window.removeEventListener('orientationchange', resize);
    window.removeEventListener('pageshow', measure); window.removeEventListener('hashchange', measure);
    document.removeEventListener('visibilitychange', visibility); document.removeEventListener('focusout', resize); document.removeEventListener('close', resize, true);
    canvas.dataset.pendingFrames = '0'; canvas.dataset.cachedFrames = '0';
  };
}
