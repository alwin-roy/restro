import { OffersCarousel } from "@/components/offers/OffersCarousel";
import { OfferSlide } from "@/components/offers/OfferSlide";
import { promotionalOffers } from "@/data/offers";

export function PromotionalOffers() {
  if (!promotionalOffers.length) return null;
  const sequence = [promotionalOffers[promotionalOffers.length - 1], ...promotionalOffers, promotionalOffers[0]];
  return <OffersCarousel labels={promotionalOffers.map((offer) => offer.ctaLabel)} slides={sequence.map((offer, index) => <OfferSlide key={`${offer.id}-${index}`} offer={offer} first={index === 1} />)} />;
}
