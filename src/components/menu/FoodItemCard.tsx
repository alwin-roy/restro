import Image from "next/image";
import { foodCategories } from "@/data/foodCategories";
import { formatPaise } from "@/lib/currency";
import type { MenuItem } from "@/types/menu";
import { FoodEffects } from '@/components/ui/FoodEffects';
import { FoodSteam, isHotFoodCategory } from '@/components/ui/FoodSteam';

export function FoodItemCard({ product }: { product: MenuItem }) {
  const category = foodCategories.find((entry) => entry.id === product.categoryId);
  return (
    <FoodEffects className="food-category-card food-item-card flex h-full flex-col" hot={isHotFoodCategory(product.categoryId)} tabIndex={0}>
      <div className="food-card-media">
        <Image src={product.image} alt={product.imageAlt} fill sizes="(min-width: 1264px) 384px, (min-width: 1024px) calc((100vw - 112px) / 3), (min-width: 640px) calc((100vw - 88px) / 2), calc(100vw - 40px)" className="category-photo" loading="lazy" />
        {isHotFoodCategory(product.categoryId) && <FoodSteam />}
      </div>
      <div className="food-card-body flex flex-1 flex-col">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[.14em] text-[#777] uppercase"><span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />{category?.name}</p>
        <h2 className="text-xl leading-snug font-bold tracking-tight">{product.name}</h2>
        <p className="mt-2 flex-1 text-[15px] leading-[1.75] text-[#666]">{product.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#efefeb] pt-4">
          <p className="text-2xl font-bold tracking-tight">{formatPaise(product.pricePaise)}</p>
        </div>
      </div>
    </FoodEffects>
  );
}
