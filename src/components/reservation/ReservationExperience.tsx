"use client";

import { ArrowUpRight, X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

export function ReservationExperience({ children }: { children: ReactNode }) {
  const scene = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const root = scene.current;
    const modal = dialog.current;
    if (!root) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const animations: Animation[] = [];
    let played = false;
    const stop = () => { animations.forEach(animation => animation.cancel()); animations.length = 0; };
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || entries[0].intersectionRatio < .3 || played || motion.matches) return;
      played = true;
      const animate = (selector: string, frames: Keyframe[], duration: number, delay = 0) => {
        const element = root.querySelector(selector);
        if (element) animations.push(element.animate(frames, { duration, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }));
      };
      animate('.reservation-scene-light', [{ opacity: 0, transform: 'scaleX(.5)' }, { opacity: 1, transform: 'scaleX(1)' }], 3200);
      animate('.reservation-wordmark', [{ opacity: .12, backgroundPosition: '100% 0', filter: 'blur(3px)' }, { opacity: 1, backgroundPosition: '0% 0', filter: 'blur(0)' }], 2800);
      ['.reservation-scene-eyebrow', '.reservation-scene-title', '.reservation-scene-description', '.reservation-scene-button'].forEach((selector, index) => {
        animate(selector, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], 1400, 250 + index * 180);
      });
      animate('.reservation-table-setting', [{ opacity: 0 }, { opacity: .65 }], 2800, 200);
    }, { threshold: [0, .3] });
    observer.observe(root);
    const preference = () => { if (motion.matches) stop(); };
    const visibility = () => { if (document.hidden) stop(); };
    motion.addEventListener('change', preference);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect(); stop(); modal?.close();
      motion.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  function open() {
    const modal = dialog.current;
    if (!modal || modal.open) return;
    modal.showModal();
    modal.scrollTop = 0;
    modal.querySelector<HTMLInputElement>('input[name="fullName"]')?.focus({ preventScroll: true });
  }

  return <>
    <div ref={scene} className="reservation-scene">
      <div className="reservation-scene-light" aria-hidden="true" />
      <div className="reservation-table-setting" aria-hidden="true">
        <div className="reservation-scene-plate" /><div className="reservation-scene-glass" /><div className="reservation-scene-candle"><i /></div>
      </div>
      <div className="reservation-scene-copy">
        <p className="reservation-scene-eyebrow">THE EVENING IS YOURS</p>
        <div className="reservation-wordmark" aria-hidden="true">RESTRO</div>
        <h2 id="reservation-heading" className="reservation-scene-title">Your table <em>is waiting.</em></h2>
        <p className="reservation-scene-description">Good food. Warm company. A moment to remember.</p>
        <button type="button" className="reservation-scene-button" onClick={open} aria-haspopup="dialog" aria-controls={id}>
          Reserve a Table <ArrowUpRight size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
    <dialog ref={dialog} id={id} className="reservation-booking-dialog" aria-labelledby={`${id}-title`} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
    }}>
      <div className="reservation-dialog-header">
        <h2 id={`${id}-title`}>Your table is waiting.</h2>
        <button type="button" onClick={() => dialog.current?.close()} className="reservation-dialog-close" aria-label="Close reservation form"><X size={22} aria-hidden="true" /></button>
      </div>
      {children}
    </dialog>
  </>;
}
