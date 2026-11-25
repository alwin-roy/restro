"use client";

import { Quote } from "lucide-react";
import { useId } from "react";
import { StarRating } from "@/components/reviews/StarRating";
import type { Review } from "@/types/review";

export function ReviewCard({ review, expanded, onToggle }: { review: Review; expanded: boolean; onToggle: () => void }) {
  const id = useId();
  const long = review.content.length > 180;
  return (
    <article className="review-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-lg leading-snug font-bold [overflow-wrap:anywhere]">{review.name}</h3>
        <Quote size={28} fill="#fff4bd" stroke="#e7c64c" strokeWidth={1.2} className="shrink-0" aria-hidden="true" />
      </div>
      <StarRating rating={review.rating} />
      <p className="review-source">{review.source === "local" ? "Browser-only review" : "Sample review"}</p>
      <p id={id} className={`review-content ${long && !expanded ? "review-content-clamped" : ""}`}>{review.content}</p>
      {long && (
        <button type="button" className="review-read-more" aria-expanded={expanded} aria-controls={id} onClick={onToggle}>
          {expanded ? "Show Less" : "Read More"}
          <span className="sr-only"> — {review.name}</span>
        </button>
      )}
    </article>
  );
}
