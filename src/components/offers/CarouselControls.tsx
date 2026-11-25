"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  labels: readonly string[];
  active: number;
  moving: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}
export function CarouselControls({ labels, active, moving, onPrevious, onNext, onSelect }: Props) {
  return (
    <div className="offer-controls">
      <button type="button" className="offer-arrow" aria-label="Previous promotion" disabled={moving} onClick={onPrevious}><ArrowLeft size={20} aria-hidden="true" /></button>
      <div className="offer-dots" aria-label="Choose a promotion">
        {labels.map((label, index) => <button key={label} type="button" className="offer-dot-button" aria-label={`Show promotion ${index + 1}: ${label}`} aria-current={active === index ? "true" : undefined} disabled={moving} onClick={() => onSelect(index)}><span /></button>)}
      </div>
      <button type="button" className="offer-arrow" aria-label="Next promotion" disabled={moving} onClick={onNext}><ArrowRight size={20} aria-hidden="true" /></button>
    </div>
  );
}
