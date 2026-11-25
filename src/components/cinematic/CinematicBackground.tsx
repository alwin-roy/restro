"use client";

import { useEffect, useRef } from 'react';
import { startCinematicCanvas } from '@/lib/cinematic/canvas-controller';

export function CinematicBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    surface.dataset.fallback = 'none';
    surface.dataset.status = 'loading';
    return startCinematicCanvas({ canvas: surface, label: label.current, debug: null,
      onFailure: reason => {
        surface.dataset.fallback = reason;
        surface.dataset.status = 'static';
      } });
  }, []);

  return <>
    <div className="cinematic-background" aria-hidden="true">
      <div className="cinematic-poster" />
      <canvas ref={canvas} className="cinematic-canvas" />
      <div className="cinematic-overlay" /><div className="cinematic-grid" />
    </div>
    <div className="cinematic-tools">
      <span ref={label} className="scene-label">01 / Arrival</span>
    </div>
  </>;
}
