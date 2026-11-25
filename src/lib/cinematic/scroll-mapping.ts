export type ScrollAnchor = { y: number; time: number };
/** Piecewise interpolation keeps a long mobile menu inside its assigned scene. */
export function mapScrollToTime(y: number, anchors: readonly ScrollAnchor[]): number {
  if (!anchors.length) return 0;
  if (y <= anchors[0].y) return anchors[0].time;
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1], b = anchors[i];
    if (y <= b.y) return a.time + (b.time - a.time) * Math.max(0, Math.min(1, (y - a.y) / Math.max(1, b.y - a.y)));
  }
  return anchors[anchors.length - 1].time;
}
export function seekTarget(target: number, duration: number): number {
  return Math.max(0, Math.min(Number.isFinite(target) ? target : 0, Math.max(0, (Number.isFinite(duration) ? duration : 0) - 1 / 24)));
}
export function shouldSeek(current: number, target: number, seeking: boolean): boolean {
  return !seeking && Math.abs(current - target) >= 1 / 24;
}
