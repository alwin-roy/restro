import { Star } from "lucide-react";

export function StarRating({ rating }: { rating: number }) {
  return <div className="mt-3 flex items-center gap-1" role="img" aria-label={`${rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={17} strokeWidth={1.6} fill={index < rating ? "#ffcc00" : "#e5e5e5"} color={index < rating ? "#ffcc00" : "#e5e5e5"} aria-hidden="true" />)}<span className="ml-2 text-xs font-semibold text-[#666]" aria-hidden="true">{rating}/5</span></div>;
}
