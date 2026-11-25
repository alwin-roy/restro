import { validateReview } from "@/lib/validations/review";
import type { Review } from "@/types/review";

export const REVIEW_STORAGE_KEY = "restro-preview-reviews-v1";
export const REVIEW_INTERVAL_MS = 4000;
export const REVIEW_TRANSITION_MS = 600;
export const REVIEW_CLONES = 3;

export function readLocalReviews(raw: string | null): Review[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("version" in parsed) || parsed.version !== 1 || !("reviews" in parsed) || !Array.isArray(parsed.reviews)) return [];
    const ids = new Set<string>();
    return parsed.reviews.flatMap((entry: unknown) => {
      if (!entry || typeof entry !== "object") return [];
      const review = entry as Partial<Review>;
      if (typeof review.id !== "string" || !/^local-[A-Za-z0-9-]{1,80}$/.test(review.id) || ids.has(review.id) || typeof review.name !== "string" || typeof review.rating !== "number" || typeof review.content !== "string") return [];
      const checked = validateReview({ name: review.name, rating: review.rating, content: review.content });
      if (!checked.valid) return [];
      ids.add(review.id);
      return [{ id: review.id, ...checked.values, source: "local" as const }];
    });
  } catch { return []; }
}
export const writeLocalReviews = (reviews: Review[]) => JSON.stringify({ version: 1, reviews: reviews.map(({ id, name, rating, content }) => ({ id, name, rating, content })) });

export interface ReviewsState { local: Review[]; ready: boolean; storageAvailable: boolean; }
export const initialReviewsState: ReviewsState = { local: [], ready: false, storageAvailable: true };
export type ReviewsAction = { type: "restore"; local: Review[]; storageAvailable: boolean } | { type: "add"; review: Review } | { type: "storage-error" };
export function reviewsReducer(state: ReviewsState, action: ReviewsAction): ReviewsState {
  if (action.type === "restore") return { local: action.local, ready: true, storageAvailable: action.storageAvailable };
  if (action.type === "storage-error") return state.storageAvailable ? { ...state, storageAvailable: false } : state;
  if (!state.ready) return state;
  return { ...state, local: [...state.local, action.review] };
}

export interface ReviewCarouselState { active: number; position: number; moving: boolean; animate: boolean; }
export const initialReviewCarousel: ReviewCarouselState = { active: 0, position: REVIEW_CLONES, moving: false, animate: false };
export type ReviewCarouselAction = { type: "move"; count: number; step?: -1 | 1; target?: number; reduced: boolean } | { type: "settle"; count: number } | { type: "reset"; count: number; target?: number };
export function reviewCarouselReducer(state: ReviewCarouselState, action: ReviewCarouselAction): ReviewCarouselState {
  if (action.type === "reset") {
    const active = Math.min(action.target ?? state.active, action.count - 1);
    if (state.active === active && state.position === active + REVIEW_CLONES && !state.moving && !state.animate) return state;
    return { active, position: active + REVIEW_CLONES, moving: false, animate: false };
  }
  if (action.type === "settle") {
    const boundary = state.position < REVIEW_CLONES || state.position >= action.count + REVIEW_CLONES;
    return { ...state, position: boundary ? state.active + REVIEW_CLONES : state.position, moving: false, animate: boundary ? false : state.animate };
  }
  if (state.moving || action.count < 2) return state;
  const active = action.target ?? (state.active + (action.step ?? 1) + action.count) % action.count;
  if (!Number.isInteger(active) || active < 0 || active >= action.count || active === state.active) return state;
  const position = action.target === undefined ? state.position + (action.step ?? 1) : active + REVIEW_CLONES;
  return { active, position: action.reduced ? active + REVIEW_CLONES : position, moving: !action.reduced, animate: !action.reduced };
}
