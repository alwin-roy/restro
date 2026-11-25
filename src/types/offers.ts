export interface PromotionalOffer {
  id: string;
  badge: string;
  title: string;
  highlightText: string;
  description: string;
  image: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  status: "demo" | "verified";
  discount?: string;
  /** Only configure a verified, fixed ISO deadline, never a rolling duration. */
  expiresAt?: string;
  pricePaise?: number;
  originalPricePaise?: number;
}
