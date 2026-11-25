import { ReviewsCarousel } from "@/components/reviews/ReviewsCarousel";

export function ReviewsSection() {
  return <section id="reviews" className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="reviews-heading">
    <div className="categories-container">
      <ReviewsCarousel heading={<div className="reviews-heading-content text-center"><p className="text-xs font-bold tracking-[0.18em] text-primary sm:text-sm">WHAT PEOPLE SAY</p><h2 id="reviews-heading" className="categories-heading mt-4">Our Customers <span className="text-primary">Feedback</span></h2><span className="mx-auto mt-6 block h-[3px] w-12 rounded-full bg-primary" aria-hidden="true" /></div>} />
    </div>
  </section>;
}
