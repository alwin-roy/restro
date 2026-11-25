"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';

export function MenuFocusGrid({ children, className, ...props }: ComponentPropsWithoutRef<'div'>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let selected: HTMLElement | null = null, raf = 0;
    let point = { x: 0, y: 0 };
    let touch: { id: number; x: number; y: number; moved: boolean } | null = null;
    const cardAt = (target: EventTarget | null) => {
      const card = target instanceof Element ? target.closest<HTMLElement>('.food-category-card') : null;
      return card?.parentElement === grid ? card : null;
    };
    const select = (card: HTMLElement | null) => {
      if (motion.matches || document.hidden) card = null;
      if (card === selected) return;
      cancelAnimationFrame(raf); raf = 0;
      selected?.classList.remove('is-menu-focused');
      selected?.style.removeProperty('--menu-tilt-x');
      selected?.style.removeProperty('--menu-tilt-y');
      selected = card;
      selected?.classList.add('is-menu-focused');
    };
    const clear = () => { touch = null; select(null); };
    const tilt = () => {
      raf = 0;
      if (!selected) return;
      const rect = selected.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (point.x - rect.left) / rect.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (point.y - rect.top) / rect.height * 2 - 1));
      selected.style.setProperty('--menu-tilt-y', `${x * 4}deg`);
      selected.style.setProperty('--menu-tilt-x', `${y * -4}deg`);
    };
    const over = (event: PointerEvent) => { if (event.pointerType === 'mouse') select(cardAt(event.target)); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        if (touch && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 10) touch.moved = true;
        return;
      }
      select(cardAt(event.target));
      if (!selected) return;
      point = { x: event.clientX, y: event.clientY };
      if (!raf) raf = requestAnimationFrame(tilt);
    };
    const leave = (event: PointerEvent) => { if (event.pointerType === 'mouse') select(cardAt(document.activeElement)); };
    const focus = (event: FocusEvent) => select(cardAt(event.target));
    const blur = (event: FocusEvent) => select(cardAt(event.relatedTarget));
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.isPrimary) touch = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    };
    const up = (event: PointerEvent) => {
      if (touch?.id === event.pointerId && !touch.moved) select(cardAt(event.target));
      touch = null;
    };
    const cancelTouch = () => { touch = null; };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !grid.contains(event.target)) clear(); };
    grid.addEventListener('pointerover', over);
    grid.addEventListener('pointermove', move, { passive: true });
    grid.addEventListener('pointerleave', leave);
    grid.addEventListener('pointerdown', down, { passive: true });
    grid.addEventListener('pointerup', up, { passive: true });
    grid.addEventListener('pointercancel', cancelTouch);
    grid.addEventListener('focusin', focus);
    grid.addEventListener('focusout', blur);
    document.addEventListener('pointerdown', outside, { passive: true });
    document.addEventListener('visibilitychange', clear);
    window.addEventListener('scroll', clear, { passive: true });
    motion.addEventListener('change', clear);
    return () => {
      clear(); cancelAnimationFrame(raf);
      grid.removeEventListener('pointerover', over); grid.removeEventListener('pointermove', move);
      grid.removeEventListener('pointerleave', leave); grid.removeEventListener('pointerdown', down);
      grid.removeEventListener('pointerup', up); grid.removeEventListener('pointercancel', cancelTouch);
      grid.removeEventListener('focusin', focus); grid.removeEventListener('focusout', blur);
      document.removeEventListener('pointerdown', outside); document.removeEventListener('visibilitychange', clear);
      window.removeEventListener('scroll', clear); motion.removeEventListener('change', clear);
    };
  }, []);
  return <div {...props} ref={ref} className={`${className ?? ''} menu-focus-grid`}>{children}</div>;
}
