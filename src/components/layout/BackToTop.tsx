"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const shown = useRef(false);
  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const focusedForm = document.activeElement?.closest("form, dialog");
      const next = window.scrollY > 600 && !focusedForm;
      if (shown.current !== next) { shown.current = next; setVisible(next); }
    }
    function schedule() { if (!frame) frame = window.requestAnimationFrame(update); }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("focusin", schedule);
      document.removeEventListener("focusout", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, []);
  if (!visible) return null;
  return <button type="button" className="back-to-top" aria-label="Back to top" onClick={() => {
    document.getElementById("page-top")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }}><ArrowUp size={22} strokeWidth={2.2} aria-hidden="true" /></button>;
}
