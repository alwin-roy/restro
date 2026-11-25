"use client";

import { useEffect, useRef, type ReactNode } from 'react';

// A carousel's clones share entry history, released when its DOM is collected.
const carouselEntries = new WeakMap<Element, Set<string>>();
type Props = { children: ReactNode; className: string; hot: boolean; as?: 'article' | 'div'; animationKey?: string; tabIndex?: number };

export function FoodEffects({ children, className, hot, as: Tag = 'article', animationKey, tabIndex }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const media = root.querySelector<HTMLElement>('.food-card-media,.offer-image-wrap');
    const image = media?.querySelector('img');
    if (!media) return;
    const frame = root.closest('.offer-frame');
    const carousel = root.closest('.offers-section');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, entered = false, steaming = false, raf = 0;
    let steamTimer: ReturnType<typeof setTimeout> | undefined, touchTimer: ReturnType<typeof setTimeout> | undefined;
    let point = { x: 0, y: 0 }, hovered = false;
    const allowed = () => !motion.matches && !document.hidden && frame?.getAttribute('aria-hidden') !== 'true';
    const stopSteam = () => { clearTimeout(steamTimer); steaming = false; root.classList.remove('is-steaming'); };
    const stop = () => {
      stopSteam(); clearTimeout(touchTimer); cancelAnimationFrame(raf); raf = 0; hovered = false;
      root.classList.remove('is-spotlit');
    };
    const play = () => {
      if (!hot || !visible || !allowed() || steaming || !image?.complete || !image.naturalWidth) return false;
      steaming = true; root.classList.add('is-steaming');
      root.dataset.steamCount = String(Number(root.dataset.steamCount ?? 0) + 1);
      steamTimer = setTimeout(stopSteam, 4200);
      return true;
    };
    const enter = () => {
      if (!allowed()) { stop(); return; }
      if (!visible) { stopSteam(); return; }
      if (!hot || entered) return;
      if (carousel && animationKey) {
        let entries = carouselEntries.get(carousel);
        if (!entries) { entries = new Set(); carouselEntries.set(carousel, entries); }
        if (entries.has(animationKey)) { entered = true; return; }
        if (play()) { entries.add(animationKey); entered = true; }
      } else if (play()) entered = true;
    };
    const updatePoint = () => {
      raf = 0; if (!allowed()) return;
      const rect = root.getBoundingClientRect();
      root.style.setProperty('--food-light-x', `${point.x - rect.left}px`);
      root.style.setProperty('--food-light-y', `${point.y - rect.top}px`);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !allowed()) return;
      point = { x: event.clientX, y: event.clientY }; if (!raf) raf = requestAnimationFrame(updatePoint);
    };
    const pointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !allowed()) return;
      hovered = true; root.classList.add('is-spotlit'); move(event); play();
    };
    const pointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      hovered = false;
      if (!root.contains(document.activeElement)) root.classList.remove('is-spotlit');
    };
    const focusIn = (event: FocusEvent) => {
      if (!allowed()) return;
      root.style.setProperty('--food-light-x', '50%'); root.style.setProperty('--food-light-y', '40%');
      root.classList.add('is-spotlit');
      if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) play();
    };
    const focusOut = (event: FocusEvent) => {
      if (!hovered && (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget))) root.classList.remove('is-spotlit');
    };
    const touch = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || !allowed()) return;
      point = { x: event.clientX, y: event.clientY }; updatePoint();
      root.classList.add('is-spotlit'); clearTimeout(touchTimer);
      touchTimer = setTimeout(() => root.classList.remove('is-spotlit'), 700);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .4;
      enter();
    }, { threshold: [0, .4] });
    observer.observe(media);
    const activeObserver = new MutationObserver(enter);
    if (frame) activeObserver.observe(frame, { attributes: true, attributeFilter: ['aria-hidden', 'inert'] });
    const preference = () => { stop(); enter(); };
    root.addEventListener('pointerenter', pointerEnter); root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', pointerLeave); root.addEventListener('pointerdown', touch, { passive: true });
    root.addEventListener('focusin', focusIn); root.addEventListener('focusout', focusOut);
    image?.addEventListener('load', enter);
    motion.addEventListener('change', preference); document.addEventListener('visibilitychange', preference);
    return () => {
      stop(); observer.disconnect(); activeObserver.disconnect();
      root.removeEventListener('pointerenter', pointerEnter); root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', pointerLeave); root.removeEventListener('pointerdown', touch);
      root.removeEventListener('focusin', focusIn); root.removeEventListener('focusout', focusOut);
      image?.removeEventListener('load', enter); motion.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', preference);
    };
  }, [hot, animationKey]);
  // Both supported tags are HTMLElement; keeping the same tag preserves layout.
  return <Tag ref={element => { ref.current = element; }} className={`${className} food-effects`} data-hot-food={hot} tabIndex={tabIndex}>{children}</Tag>;
}
