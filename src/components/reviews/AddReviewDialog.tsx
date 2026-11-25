"use client";

import { Star, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { validateReview } from "@/lib/validations/review";
import type { ReviewErrors, ReviewValues } from "@/types/review";

const empty: ReviewValues = { name: "", rating: 0, content: "" };
export function AddReviewDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (values: ReviewValues) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const name = useRef<HTMLInputElement>(null);
  const firstStar = useRef<HTMLInputElement>(null);
  const content = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [hover, setHover] = useState(0);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateReview(values);
    setErrors(result.errors);
    if (!result.valid) {
      if (result.errors.name) name.current?.focus();
      else if (result.errors.rating) firstStar.current?.focus();
      else content.current?.focus();
      return;
    }
    onAdd(result.values);
    setValues(empty);
    setErrors({});
    setHover(0);
  }
  return <dialog ref={dialog} className="review-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-notice`} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <form onSubmit={submit} noValidate className="review-dialog-content">
      <div className="flex items-center justify-between gap-3"><h3 id={`${id}-title`} className="text-xl font-bold">Add your review</h3><button type="button" className="icon-button cursor-pointer" aria-label="Close review form" onClick={onClose}><X size={21} aria-hidden="true" /></button></div>
      <p id={`${id}-notice`} className="mt-3 text-sm leading-relaxed text-[#666]">Share your dining experience with us. Fields marked * are required.</p>
      <div className="mt-6">
        <label htmlFor={`${id}-name`} className="reservation-label">Your Name <span aria-hidden="true">*</span></label>
        <input ref={name} id={`${id}-name`} className="reservation-input" type="text" autoComplete="name" required maxLength={100} placeholder="Enter your name" value={values.name} onChange={(event) => setValues((previous) => ({ ...previous, name: event.target.value }))} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-name-error` : undefined} />
        {errors.name && <p id={`${id}-name-error`} className="reservation-error">{errors.name}</p>}
      </div>
      <fieldset className="mt-6 min-w-0 border-0 p-0" aria-describedby={errors.rating ? `${id}-rating-error` : undefined}>
        <legend className="reservation-label">Your Rating <span aria-hidden="true">*</span></legend>
        <div className="review-star-choices" onPointerLeave={() => setHover(0)}>
          {[1,2,3,4,5].map((rating) => <div key={rating} className="review-star-choice"><input ref={rating === 1 ? firstStar : undefined} className="sr-only" id={`${id}-star-${rating}`} type="radio" name={`${id}-rating`} value={rating} checked={values.rating === rating} required onChange={() => { setValues((previous) => ({ ...previous, rating })); setHover(0); }} aria-describedby={errors.rating ? `${id}-rating-error` : undefined} /><label htmlFor={`${id}-star-${rating}`} aria-label={`Rate ${rating} out of 5 stars`} onPointerEnter={(event) => { if (event.pointerType === "mouse") setHover(rating); }}><Star size={29} fill={rating <= (hover || values.rating) ? "#ffcc00" : "transparent"} stroke={rating <= (hover || values.rating) ? "#d5aa00" : "#c6c6bf"} strokeWidth={1.5} aria-hidden="true" /></label></div>)}
        </div>
        <p className="reservation-hint mt-1">{values.rating ? `${values.rating} out of 5 stars selected` : "Choose 1–5 stars."}</p>
        {errors.rating && <p id={`${id}-rating-error`} className="reservation-error">{errors.rating}</p>}
      </fieldset>
      <div className="mt-6">
        <label htmlFor={`${id}-content`} className="reservation-label">Your Review <span aria-hidden="true">*</span></label>
        <textarea ref={content} id={`${id}-content`} className="reservation-input min-h-36 resize-y" rows={5} required minLength={10} maxLength={1000} placeholder="Share your experience at Restro..." value={values.content} onChange={(event) => setValues((previous) => ({ ...previous, content: event.target.value }))} aria-invalid={!!errors.content} aria-describedby={`${id}-count${errors.content ? ` ${id}-content-error` : ""}`} />
        <p id={`${id}-count`} className="reservation-hint mt-2 text-right">{values.content.length}/1000 characters · minimum 10</p>
        {errors.content && <p id={`${id}-content-error`} className="reservation-error">{errors.content}</p>}
      </div>
      {Object.keys(errors).length > 0 && <p className="reservation-error mt-4" role="alert">Please review the highlighted fields.</p>}
      <button type="submit" className="yellow-button mt-6 min-h-14 w-full cursor-pointer rounded-xl px-5 text-sm">Submit Review</button>
    </form>
  </dialog>;
}
