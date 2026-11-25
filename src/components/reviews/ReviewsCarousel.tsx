"use client";

import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { AddReviewDialog } from "@/components/reviews/AddReviewDialog";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { demoReviews } from "@/data/reviews";
import { initialReviewCarousel, initialReviewsState, readLocalReviews, REVIEW_CLONES, REVIEW_INTERVAL_MS, REVIEW_STORAGE_KEY, REVIEW_TRANSITION_MS, reviewCarouselReducer, reviewsReducer, writeLocalReviews } from "@/lib/reviews";
import type { Review, ReviewValues } from "@/types/review";

function subscribeMotion(callback: () => void) { const query = matchMedia("(prefers-reduced-motion: reduce)"); query.addEventListener("change", callback); return () => query.removeEventListener("change", callback); }
const motionSnapshot = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function subscribeVisibility(callback: () => void) { document.addEventListener("visibilitychange", callback); return () => document.removeEventListener("visibilitychange", callback); }
const visibilitySnapshot = () => document.hidden;
function subscribeColumns(callback: () => void) {
  const queries = [matchMedia("(min-width: 640px)"), matchMedia("(min-width: 1024px)")];
  queries.forEach((query) => query.addEventListener("change", callback));
  return () => queries.forEach((query) => query.removeEventListener("change", callback));
}
const columnsSnapshot = () => matchMedia("(min-width: 1024px)").matches ? 3 : matchMedia("(min-width: 640px)").matches ? 2 : 1;
const serverFalse = () => false;
const serverColumns = () => 1;

export function ReviewsCarousel({ heading }: { heading: ReactNode }) {
  const [collection, updateCollection] = useReducer(reviewsReducer, initialReviewsState);
  const [state, dispatch] = useReducer(reviewCarouselReducer, initialReviewCarousel);
  const reviews = useMemo(() => [...demoReviews, ...collection.local], [collection.local]);
  const count = reviews.length;
  const sequence = [...reviews.slice(-REVIEW_CLONES), ...reviews, ...reviews.slice(0, REVIEW_CLONES)];
  const visible = useSyncExternalStore(subscribeColumns, columnsSnapshot, serverColumns);
  const reduce = useSyncExternalStore(subscribeMotion, motionSnapshot, serverFalse);
  const hidden = useSyncExternalStore(subscribeVisibility, visibilitySnapshot, serverFalse);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");
  const viewport = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number; horizontal: boolean; vertical: boolean } | null>(null);
  const suppressClick = useRef(false);
  const paused = !collection.ready || reduce || hidden || dialogOpen || hovered || focused || dragging || expanded.size > 0;
  const move = useCallback((step: -1 | 1) => dispatch({ type: "move", count, step, reduced: reduce }), [count, reduce]);
  useEffect(() => {
    let local: Review[] = [];
    let storageAvailable = true;
    try { local = readLocalReviews(localStorage.getItem(REVIEW_STORAGE_KEY)); } catch { storageAvailable = false; }
    updateCollection({ type: "restore", local, storageAvailable });
  }, []);
  useEffect(() => {
    if (!collection.ready) return;
    try { localStorage.setItem(REVIEW_STORAGE_KEY, writeLocalReviews(collection.local)); } catch { updateCollection({ type: "storage-error" }); }
  }, [collection.local, collection.ready]);
  useEffect(() => {
    if (paused || count <= visible) return;
    const timer = window.setTimeout(() => move(1), REVIEW_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [paused, count, visible, state.active, move]);
  useEffect(() => {
    let width = -1;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width !== width) { width = entry.contentRect.width; dispatch({ type: "reset", count }); }
    });
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [count]);
  useEffect(() => { if (reduce) dispatch({ type: "reset", count }); }, [reduce, count]);
  useEffect(() => {
    if (!dragging) return;
    const release = () => { gesture.current = null; setDragging(false); };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => { window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release); };
  }, [dragging]);
  function navigate(step: -1 | 1) { setExpanded(new Set()); move(step); }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || (event.target instanceof Element && event.target.closest("button,a,input"))) return;
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
    if (start.horizontal) { suppressClick.current = true; event.preventDefault(); }
  }
  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (start?.id !== event.pointerId) return;
    if (event.type !== "pointercancel" && start.horizontal && Math.abs(event.clientX - start.x) >= 45) navigate(event.clientX < start.x ? 1 : -1);
    gesture.current = null;
    setDragging(false);
  }
  function addReview(values: ReviewValues) {
    const review: Review = { id: `local-${crypto.randomUUID()}`, ...values, source: "local" };
    updateCollection({ type: "add", review });
    dispatch({ type: "reset", count: count + 1, target: count });
    setExpanded(new Set());
    setDialogOpen(false);
    setNotice("Thank you! Your review has been added.");
  }
  return <>
    <div className="reviews-heading">
      {heading}
      <button type="button" className="yellow-button review-add-button" disabled={!collection.ready} aria-haspopup="dialog" onClick={() => setDialogOpen(true)}><Plus size={18} aria-hidden="true" />Add Review</button>
    </div>
    <div className="reviews-carousel mt-8 sm:mt-10" role="region" aria-label="Customer reviews" aria-roledescription="carousel" onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div ref={viewport} className={`reviews-viewport ${dragging ? "is-dragging" : ""}`} onDragStart={(event) => event.preventDefault()} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={() => { gesture.current = null; setDragging(false); }} onClickCapture={(event) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>
        <div className="reviews-track" aria-live="off" style={{ transform: `translateX(calc(-${state.position} * (100% + var(--reviews-gap)) / var(--reviews-visible)))`, transition: state.animate && !reduce ? `transform ${REVIEW_TRANSITION_MS}ms cubic-bezier(.22,.68,.18,1)` : "none" }} onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === "transform") dispatch({ type: "settle", count }); }} onTransitionCancel={() => dispatch({ type: "settle", count })}>
          {sequence.map((review, index) => {
            const hidden = index < state.position || index >= state.position + visible;
            return <div key={`${review.id}-${index}`} className="review-frame" role="group" aria-roledescription="slide" aria-label={`Review ${(index - REVIEW_CLONES + count) % count + 1} of ${count}`} aria-hidden={hidden} inert={hidden}><ReviewCard review={review} expanded={expanded.has(review.id)} onToggle={() => setExpanded((previous) => { const next = new Set(previous); if (next.has(review.id)) next.delete(review.id); else next.add(review.id); return next; })} /></div>;
          })}
        </div>
      </div>
      <div className="review-controls">
        <button type="button" className="yellow-button review-arrow" aria-label="Previous review" disabled={state.moving} onClick={() => navigate(-1)}><ArrowLeft size={19} aria-hidden="true" /></button>
        <div className="review-dots" aria-label="Choose review position">{reviews.map((review, index) => <button key={review.id} type="button" className="review-dot" aria-label={`Show reviews starting with ${review.name}`} aria-current={state.active === index ? "true" : undefined} disabled={state.moving} onClick={() => { setExpanded(new Set()); dispatch({ type: "move", count, target: index, reduced: reduce }); }}><span /></button>)}</div>
        <button type="button" className="yellow-button review-arrow" aria-label="Next review" disabled={state.moving} onClick={() => navigate(1)}><ArrowRight size={19} aria-hidden="true" /></button>
      </div>
      {expanded.size > 0 && <p className="reservation-hint mt-3 text-center">Rotation paused while a review is expanded.</p>}
    </div>
    <p role="status" aria-live="polite" className="mt-4 min-h-6 text-center text-sm leading-relaxed text-[#555]">{notice}</p>
    {!collection.storageAvailable && <p className="reservation-error text-center">Browser storage is unavailable. Local reviews will only last for this visit.</p>}
    <AddReviewDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={addReview} />
  </>;
}
