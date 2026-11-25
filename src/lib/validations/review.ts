import type { ReviewErrors, ReviewValues } from "@/types/review";

export function validateReview(input: ReviewValues) {
  const values = { name: input.name.normalize("NFC").trim().replace(/\s+/gu, " "), rating: input.rating, content: input.content.trim() };
  const errors: ReviewErrors = {};
  const length = Array.from(values.name).length;
  if (!length) errors.name = "Please enter your name.";
  else if (length < 2 || length > 100) errors.name = "Your name must contain 2–100 characters.";
  else if (!/^\p{L}[\p{L}\p{M}]*(?: \p{L}[\p{L}\p{M}]*)*$/u.test(values.name)) errors.name = "Use letters and spaces only, without numbers or symbols.";
  if (!Number.isInteger(values.rating) || values.rating < 1 || values.rating > 5) errors.rating = "Please select a rating.";
  if (values.content.length < 10) errors.content = "Please write a review of at least 10 characters.";
  else if (values.content.length > 1000) errors.content = "Please keep your review within 1000 characters.";
  return { values, errors, valid: !Object.keys(errors).length };
}
