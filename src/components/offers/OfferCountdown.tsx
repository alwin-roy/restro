"use client";

import { useSyncExternalStore } from "react";
import { remainingOfferTime } from "@/lib/offers-carousel";

let currentTime = 0;
let timer: number | undefined;
const listeners = new Set<() => void>();
function subscribe(callback: () => void) {
  listeners.add(callback);
  currentTime = Date.now();
  if (timer === undefined) timer = window.setInterval(() => {
    currentTime = Date.now();
    listeners.forEach((listener) => listener());
  }, 1000);
  callback();
  return () => {
    listeners.delete(callback);
    if (!listeners.size) { window.clearInterval(timer); timer = undefined; }
  };
}
const now = () => currentTime;
const serverNow = () => 0;

export function OfferCountdown({ expiresAt }: { expiresAt: string }) {
  const time = useSyncExternalStore(subscribe, now, serverNow);
  const remaining = time ? remainingOfferTime(expiresAt, time) : null;
  return <time dateTime={expiresAt} className="offer-countdown">{remaining ?? ""}</time>;
}
