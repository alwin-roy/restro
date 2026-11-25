"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getMascotGeometry, getMascotPose, timeline } from "../lib/mascot-timeline";

const motionQuery = "(prefers-reduced-motion: reduce)";
const poster = "/animations/shawarma-poster.png";
function subscribe(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getReducedMotion = () => window.matchMedia(motionQuery).matches;
const getServerSnapshot = () => true;

type MediaStatus = "poster" | "loading" | "ready" | "unavailable" | "blocked";

/** Detect actual decoded alpha, rather than relying on a codec-support string. */
function probeAlpha(signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    let settled = false;
    const finish = (supported: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
      video.removeAttribute("src");
      video.load();
      resolve(supported);
    };
    const onAbort = () => finish(false);
    const timeout = window.setTimeout(() => finish(false), 6000);
    signal.addEventListener("abort", onAbort, { once: true });
    video.onerror = () => finish(false);
    video.onloadeddata = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 2;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return finish(false);
        context.drawImage(video, 0, 0, 2, 2);
        const pixels = context.getImageData(0, 0, 2, 2).data;
        finish(pixels[3] === 0 && pixels[15] > 240);
      } catch { finish(false); }
    };
    video.src = "/animations/alpha-probe.webm";
    video.load();
  });
}

export function ShawarmaVisual() {
  const reducedMotion = useSyncExternalStore(subscribe, getReducedMotion, getServerSnapshot);
  const [playOverride, setPlayOverride] = useState<boolean | null>(null);
  const [status, setStatus] = useState<MediaStatus>("poster");
  const wantsPlayback = playOverride ?? !reducedMotion;
  const stage = useRef<HTMLDivElement>(null);
  const actor = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const desiredPlayback = useRef(false);
  const controller = useRef<{ sync: () => void; start: () => void; showPoster: () => void } | null>(null);

  useEffect(() => {
    const media = video.current;
    const anchor = stage.current;
    const sprite = actor.current;
    if (!media || !anchor || !sprite) return;
    const abort = new AbortController();
    let disposed = false;
    let initialized = false;
    let initializing = false;
    let alphaSupported = false;
    let inView = false;
    let animationFrame = 0;
    let playPending = false;
    let hasStarted = false;
    let geometry = getMascotGeometry(0, 0, 0);

    const draw = () => {
      const pose = getMascotPose(media.currentTime, geometry);
      sprite.style.transform = `translate3d(${pose.x}px, 0, 0)`;
      sprite.dataset.phase = pose.phase;
      if (media.playbackRate !== pose.playbackRate) media.playbackRate = pose.playbackRate;
    };
    const tick = () => {
      draw();
      if (!media.paused && !media.ended) animationFrame = requestAnimationFrame(tick);
    };
    const measure = () => {
      const rect = anchor.getBoundingClientRect();
      geometry = getMascotGeometry(rect.left, rect.width, document.documentElement.clientWidth);
      if (hasStarted) draw();
    };
    const canPlay = () => desiredPlayback.current && inView && !document.hidden && alphaSupported && media.readyState >= 2;
    const sync = () => {
      if (!canPlay()) {
        media.pause();
        cancelAnimationFrame(animationFrame);
        if (hasStarted) draw();
        return;
      }
      if (!media.paused || playPending) return;
      playPending = true;
      draw();
      media.play().then(() => {
        if (disposed) { media.pause(); return; }
        playPending = false;
        if (!canPlay()) { media.pause(); return; }
        hasStarted = true;
        setStatus("ready");
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(tick);
      }).catch(() => {
        playPending = false;
        if (disposed) return;
        if (!desiredPlayback.current || !inView || document.hidden) {
          if (!hasStarted) sprite.style.transform = "none";
          return;
        }
        if (hasStarted) setPlayOverride(false);
        else { sprite.style.transform = "none"; setStatus("blocked"); }
      });
    };
    const start = () => {
      if (initialized) { sync(); return; }
      if (initializing) return;
      initializing = true;
      setStatus("loading");
      void probeAlpha(abort.signal).then((supported) => {
        if (disposed) return;
        initializing = false;
        alphaSupported = supported;
        if (!supported) { setStatus("unavailable"); return; }
        initialized = true;
        measure();
        media.src = "/animations/shawarma-cycle.webm";
        media.load();
      });
    };
    const loaded = () => {
      if (disposed) return;
      // Only reveal the first decoded RGBA frame after the transparency probe.
      if (alphaSupported) sync();
    };
    const failed = () => {
      if (disposed) return;
      alphaSupported = false;
      cancelAnimationFrame(animationFrame);
      media.pause();
      sprite.style.transform = "none";
      setStatus("unavailable");
    };
    const visibilityChanged = () => sync();
    const showPoster = () => {
      media.pause();
      cancelAnimationFrame(animationFrame);
      hasStarted = false;
      if (media.readyState >= 1) media.currentTime = 0;
      sprite.style.transform = "none";
      sprite.dataset.phase = "paused";
      setStatus("poster");
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && desiredPlayback.current) start();
      sync();
    }, { rootMargin: "80px" });
    const resizeObserver = new ResizeObserver(measure);
    observer.observe(anchor);
    resizeObserver.observe(anchor);
    const hero = anchor.closest(".hero");
    if (hero) resizeObserver.observe(hero);
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", visibilityChanged);
    media.addEventListener("loadeddata", loaded);
    media.addEventListener("canplay", sync);
    media.addEventListener("error", failed);
    controller.current = { sync, start, showPoster };
    measure();
    return () => {
      disposed = true;
      abort.abort();
      controller.current = null;
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", visibilityChanged);
      media.removeEventListener("loadeddata", loaded);
      media.removeEventListener("canplay", sync);
      media.removeEventListener("error", failed);
      media.pause();
      media.removeAttribute("src");
      media.load();
    };
  }, []);

  useEffect(() => {
    desiredPlayback.current = wantsPlayback;
    if (reducedMotion && playOverride === null) {
      controller.current?.showPoster();
      return;
    }
    if (wantsPlayback) controller.current?.start();
    controller.current?.sync();
  }, [wantsPlayback, reducedMotion, playOverride]);

  const showingVideo = status === "ready";

  return (
    <div className="hero-visual mascot-visual relative">
      <div ref={stage} className="mascot-stage" role="img" aria-label="Restro's smiling cartoon shawarma mascot">
        <div ref={actor} className="mascot-actor" data-phase="paused" data-media-status={status}>
          <Image src={poster} alt="" width={timeline.width} height={timeline.height} unoptimized loading="eager" className={`mascot-poster ${showingVideo ? "mascot-hidden" : ""}`} />
          <video ref={video} width={timeline.width} height={timeline.height} className={`mascot-video ${showingVideo ? "" : "mascot-hidden"}`} muted playsInline loop preload="none" aria-hidden="true" disablePictureInPicture tabIndex={-1} />
        </div>
      </div>
    </div>
  );
}
