import timeline from "../../../../public/animations/timeline.json";

export type MascotPhase =
  | "running-right"
  | "peeking"
  | "arriving"
  | "dancing"
  | "waving"
  | "turning-left"
  | "running-left";

export { timeline };
const smoothstep = (progress: number) => progress * progress * (3 - 2 * progress);
const travelDuration = (distance: number, speed: number) => Math.max(1.5, Math.min(3, distance / speed));
export type MascotGeometry = ReturnType<typeof getMascotGeometry>;

/** The media playhead is the only clock, including during pauses and buffering. */
export function getMascotPose(time: number, geometry: MascotGeometry) {
  const { startX, exitRightX, peekX } = geometry;
  const t = ((time % timeline.duration) + timeline.duration) % timeline.duration;
  let phase: MascotPhase;
  let x = 0;
  let playbackRate = 1;
  if (t < timeline.runRightEnd) {
    phase = "running-right";
    x = startX + (exitRightX - startX) * smoothstep(t / timeline.runRightEnd);
    playbackRate = 0.5 * timeline.runRightEnd / geometry.runRightDuration;
  } else if (t < timeline.peekEnd) {
    phase = "peeking";
    const progress = Math.min(1, (t - timeline.runRightEnd) / timeline.peekSlideDuration);
    x = exitRightX + (peekX - exitRightX) * smoothstep(progress);
  } else if (t < timeline.arrivalEnd) {
    phase = "arriving";
    x = peekX * (1 - smoothstep((t - timeline.peekEnd) / (timeline.arrivalEnd - timeline.peekEnd)));
    playbackRate = (timeline.arrivalEnd - timeline.peekEnd) / geometry.arrivalDuration;
  } else if (t < timeline.danceEnd) {
    phase = "dancing";
  } else if (t < timeline.waveEnd) {
    phase = "waving";
  } else if (t < timeline.turnEnd) {
    phase = "turning-left";
  } else {
    phase = "running-left";
    x = startX * smoothstep((t - timeline.turnEnd) / (timeline.duration - timeline.turnEnd));
    playbackRate = 0.5 * (timeline.duration - timeline.turnEnd) / geometry.runLeftDuration;
  }
  return { phase, x: x || 0, playbackRate };
}

/** Source peek's canvas edge is aligned to the real viewport, not the hero box. */
export function getMascotGeometry(stageLeft: number, stageWidth: number, viewportWidth: number) {
  const startX = -stageLeft - stageWidth;
  const exitRightX = viewportWidth - stageLeft;
  const peekX = exitRightX - stageWidth * timeline.peekEdgeFraction;
  return {
    startX,
    exitRightX,
    peekX,
    runRightDuration: travelDuration(exitRightX - startX, 650),
    runLeftDuration: travelDuration(Math.abs(startX), 500),
    arrivalDuration: Math.max(.5, Math.min(1.25, Math.abs(peekX) / 500)),
  };
}
