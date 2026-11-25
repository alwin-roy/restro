import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { foodCategories } from "@/data/foodCategories";
import { FoodCategoryCard } from "./FoodCategoryCard";
import { CategoryFilters } from "./CategoryFilters";

export function FoodCategoriesSection({ showFullMenuLink = true, overviewHref = "/#food-categories-heading" }: { showFullMenuLink?: boolean; overviewHref?: string }) {
  return (
    <section className="food-categories bg-[#fafaf7] py-16 sm:py-20 lg:py-24" aria-labelledby="food-categories-heading">
      <div className="categories-container">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="text-xs font-bold tracking-[0.18em] text-primary sm:text-sm">EXPLORE OUR SPECIALTIES</p>
          <h2 id="food-categories-heading" className="categories-heading mt-4">Explore Our Delicious <span className="text-primary">Menu</span></h2>
          <p className="mx-auto mt-5 max-w-[660px] text-base leading-[1.8] text-[#666]">From delicious shawarmas and juicy burgers to flavorful mandi and irresistible desserts, discover something for every craving.</p>
          <span className="mx-auto mt-6 block h-[3px] w-12 rounded-full bg-primary" aria-hidden="true" />
        </div>
        
        <CategoryFilters overviewHref={overviewHref}>
          {foodCategories.map((category) => <FoodCategoryCard key={category.id} category={category} />)}
        </CategoryFilters>
        {showFullMenuLink && (
          <div className="mt-12 text-center sm:mt-14">
            <Link href="/menu" className="yellow-button min-h-14 rounded-full px-8 text-[15px]">
              View Full Menu <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

