"use client";

import { useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { CarouselControls } from "@/components/offers/CarouselControls";
import { useOfferReveal } from '@/hooks/useOfferReveal';
import { carouselReducer, initialCarouselState, OFFER_INTERVAL_MS, OFFER_TRANSITION_MS } from "@/lib/offers-carousel";

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
const pageHidden = () => document.hidden;
const serverFalse = () => false;

// Static slide children are composed on the server, including two boundary clones.
export function OffersCarousel({ slides, labels }: { slides: ReactNode[]; labels: readonly string[] }) {
  const count = labels.length;
  const section = useRef<HTMLElement>(null);
  const [state, dispatch] = useReducer(carouselReducer, initialCarouselState);
  const reduce = useSyncExternalStore(subscribeMotion, reducedMotion, serverFalse);
  const hidden = useSyncExternalStore(subscribeVisibility, pageHidden, serverFalse);
  useOfferReveal(section, state.position, state.active, reduce || hidden);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ id: number; x: number; y: number; horizontal: boolean; vertical: boolean } | null>(null);
  const suppressClick = useRef(false);
  const paused = reduce || hovered || focused || dragging || hidden;
  const move = useCallback((step: -1 | 1) => dispatch({ type: "move", step, count, reduced: reduce }), [count, reduce]);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = window.setTimeout(() => move(1), OFFER_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [paused, state.active, count, move]);

  useEffect(() => {
    if (reduce) dispatch({ type: "settle", count });
  }, [reduce, count]);

  useEffect(() => {
    if (!dragging) return;
    const release = () => { gesture.current = null; setDragging(false); };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [dragging]);

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false, vertical: false };
    setDragging(true);
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId || start.vertical) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal && Math.max(Math.abs(dx), Math.abs(dy)) > 10) {
      start.horizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
      start.vertical = !start.horizontal;
      if (start.horizontal) event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (start.horizontal) suppressClick.current = true;
  }
  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (start?.id !== event.pointerId) return;
    if (event.type !== "pointercancel" && start.horizontal && Math.abs(event.clientX - start.x) >= 45) move(event.clientX < start.x ? 1 : -1);
    gesture.current = null;
    setDragging(false);
  }

  return (
    <section ref={section} className="offers-section" aria-label="Promotional inspiration" aria-roledescription="carousel" onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="offers-container">
        <div className="offer-viewport" onDragStart={(event) => event.preventDefault()} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={() => { gesture.current = null; setDragging(false); }} onClickCapture={(event) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>
          <div className="offer-track" style={{ transform: `translateX(-${state.position * 100}%)`, transition: state.animate && !reduce ? `transform ${OFFER_TRANSITION_MS}ms cubic-bezier(.22,.68,.18,1)` : "none" }} onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === "transform") dispatch({ type: "settle", count }); }} onTransitionCancel={() => dispatch({ type: "settle", count })} aria-live="off">
            {slides.map((slide, position) => <div key={position} className="offer-frame" role="group" aria-roledescription="slide" aria-label={`${(position - 1 + count) % count + 1} of ${count}`} aria-hidden={state.position !== position} inert={state.position !== position}>{slide}</div>)}
          </div>
        </div>
        <CarouselControls labels={labels} active={state.active} moving={state.moving} onPrevious={() => move(-1)} onNext={() => move(1)} onSelect={(target) => dispatch({ type: "move", target, count, reduced: reduce })} />
      </div>
    </section>
  );
}

