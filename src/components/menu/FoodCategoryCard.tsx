import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FoodCategory } from "@/data/foodCategories";
import { FoodEffects } from '@/components/ui/FoodEffects';
import { FoodSteam, isHotFoodCategory } from '@/components/ui/FoodSteam';

export function FoodCategoryCard({ category }: { category: FoodCategory }) {
  const action = (
    <>
      <span>Explore Category</span>
      <span className="category-arrow flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-foreground">
        <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
      </span>
    </>
  );

  return (
    <FoodEffects className="food-category-card flex h-full flex-col" hot={isHotFoodCategory(category.id)}>
      <div className="food-card-media">
        <Image
          src={category.image}
          alt={category.imageAlt}
          fill
          sizes="(min-width: 1264px) 381px, (min-width: 1024px) calc((100vw - 120px) / 3), (min-width: 640px) calc((100vw - 88px) / 2), calc(100vw - 40px)"
          className="category-photo"
          loading="lazy"
        />
        {isHotFoodCategory(category.id) && <FoodSteam />}
      </div>
      <div className="food-card-body flex flex-1 flex-col">
        <h3 className="category-card-title">{category.name}</h3>
        <p className="mt-3 min-h-20 text-[15px] leading-[1.75] text-[#666]">{category.description}</p>
        <div className="mt-auto pt-6">
          {category.href ? (
            <Link href={category.href} className="category-explore flex min-h-11 w-full items-center justify-between gap-3 text-sm font-semibold" aria-label={`Explore ${category.name} category`}>
              {action}
            </Link>
          ) : (
            <>
              <button type="button" disabled className="category-explore flex min-h-11 w-full items-center justify-between gap-3 text-sm font-semibold" aria-label={`Explore ${category.name} category (coming soon)`} aria-describedby={`category-coming-${category.id}`}>
                {action}
              </button>
              <p id={`category-coming-${category.id}`} className="mt-1 text-xs text-[#777]">Coming soon</p>
            </>
          )}
        </div>
      </div>
    </FoodEffects>
  );
}
