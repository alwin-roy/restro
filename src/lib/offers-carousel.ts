export const OFFER_INTERVAL_MS = 3000;
export const OFFER_TRANSITION_MS = 600;

export interface CarouselState {
  position: number;
  active: number;
  moving: boolean;
  animate: boolean;
}
export const initialCarouselState: CarouselState = { position: 1, active: 0, moving: false, animate: false };
export type CarouselAction =
  | { type: "move"; count: number; step?: -1 | 1; target?: number; reduced: boolean }
  | { type: "settle"; count: number };

export function carouselReducer(state: CarouselState, action: CarouselAction): CarouselState {
  if (action.type === "settle") {
    const boundary = state.position === 0 || state.position === action.count + 1;
    return { ...state, position: boundary ? state.active + 1 : state.position, moving: false, animate: boundary ? false : state.animate };
  }
  if (state.moving || action.count < 2) return state;
  const active = action.target ?? (state.active + (action.step ?? 1) + action.count) % action.count;
  if (!Number.isInteger(active) || active < 0 || active >= action.count || active === state.active) return state;
  const position = action.target === undefined ? state.position + (action.step ?? 1) : active + 1;
  return { active, position: action.reduced ? active + 1 : position, moving: !action.reduced, animate: !action.reduced };
}

export function remainingOfferTime(expiresAt: string, now: number): string | null {
  const deadline = Date.parse(expiresAt);
  if (!Number.isFinite(deadline)) return null;
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  if (!seconds) return "Offer ended";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  return `${days ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds % 60}s remaining`;
}
