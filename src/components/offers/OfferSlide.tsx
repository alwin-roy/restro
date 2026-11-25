import Image from "next/image";

import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { OfferCountdown } from "@/components/offers/OfferCountdown";

import { formatPaise } from "@/lib/currency";

import type { PromotionalOffer } from "@/types/offers";
import { FoodEffects } from '@/components/ui/FoodEffects';
import { FoodSteam, isHotFoodCategory } from '@/components/ui/FoodSteam';



export function OfferSlide({ offer, first = false }: { offer: PromotionalOffer; first?: boolean }) {

  const verified = offer.status === "verified";
  const hot = isHotFoodCategory(offer.ctaHref.replace('/menu/', ''));

  return (

    <FoodEffects as="div" className="offer-slide" hot={hot} animationKey={offer.id}>

      <div className="offer-copy">

        <span className="offer-badge">Sample · {offer.badge}</span>

        <h2 className="offer-title"><span>{offer.highlightText}</span>{offer.title}</h2>

        <p className="offer-description">{offer.description}</p>

        {verified && offer.discount && <p className="mt-3 font-bold text-primary">{offer.discount}</p>}

        {verified && offer.pricePaise !== undefined && <p className="mt-3 text-xl font-bold">{formatPaise(offer.pricePaise)}{offer.originalPricePaise !== undefined && <del className="ml-3 text-sm font-normal text-[#aaa]">{formatPaise(offer.originalPricePaise)}</del>}</p>}

        {verified && offer.expiresAt && Number.isFinite(Date.parse(offer.expiresAt)) && <OfferCountdown expiresAt={offer.expiresAt} />}

      

      </div>

      <div className="offer-image-wrap">
        <span className="offer-reveal-glow" aria-hidden="true" />

        <Image src={offer.image} alt={offer.imageAlt} fill sizes="(min-width: 1280px) 600px, (min-width: 768px) 46vw, 85vw" className="offer-image" draggable={false} loading="eager" fetchPriority={first ? "high" : "low"} />
        {hot && <FoodSteam />}

      </div>

      <Link href={offer.ctaHref} className="offer-cta yellow-button">{offer.ctaLabel}<ArrowUpRight size={19} aria-hidden="true" /></Link>

    </FoodEffects>

  );

}


