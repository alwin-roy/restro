"use client";

import { useEffect, useRef, type RefObject } from 'react';

// Keep the same animation time when a boundary clone swaps to its real slide.
export function useOfferReveal(section: RefObject<HTMLElement | null>, position: number, active: number, disabled: boolean) {
  const history = useRef<{ active: number; start: number | null }>({ active: -1, start: null });

  useEffect(() => {
    if (history.current.active !== active) history.current = { active, start: null };
    if (disabled) return;
    const frame = section.current?.querySelectorAll<HTMLElement>('.offer-frame')[position];
    const media = frame?.querySelector<HTMLElement>('.offer-image-wrap');
    const image = media?.querySelector<HTMLImageElement>('img');
    if (!frame || !media || !image) return;
    let disposed = false, visible = false, ready = false, played = false;
    const animations: Animation[] = [];
    const cancel = () => { animations.forEach(animation => animation.cancel()); animations.length = 0; };
    const reveal = () => {
      if (disposed || played || !visible || !ready || document.hidden || frame.getAttribute('aria-hidden') === 'true') return;
      played = true;
      const now = performance.now();
      history.current.start ??= now;
      const elapsed = now - history.current.start;
      if (elapsed >= 2000) return;
      const animate = (element: Element | null, keyframes: Keyframe[], duration: number, delay = 0) => {
        if (!element) return;
        const animation = element.animate(keyframes, { duration, delay, fill: 'both', easing: 'cubic-bezier(.16,1,.3,1)' });
        animation.currentTime = elapsed;
        animations.push(animation);
      };
      animate(image, [
        { opacity: 0, transform: 'translateY(85px) rotate(5deg) scale(.9)' },
        { opacity: 1, offset: .38 },
        { opacity: 1, transform: 'translateY(-8px) rotate(-1deg) scale(1.015)', offset: .75 },
        { opacity: 1, transform: 'translateY(0) rotate(0deg) scale(1)' },
      ], 1500);
      animate(media.querySelector('.offer-reveal-glow'), [
        { opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' },
      ], 1900, 100);
      ['.offer-badge', '.offer-title', '.offer-description', '.offer-cta'].forEach((selector, index) => {
        animate(frame.querySelector(selector), [
          { opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' },
        ], 950, 230 + index * 135);
      });
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .25;
      if (visible) reveal(); else cancel();
    }, { threshold: [0, .25] });
    observer.observe(media);
    void image.decode().then(() => { ready = true; reveal(); }).catch(() => {});
    return () => { disposed = true; observer.disconnect(); cancel(); };
  }, [section, position, active, disabled]);
}
