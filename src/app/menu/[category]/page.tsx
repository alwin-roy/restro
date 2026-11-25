import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { foodCategories } from "@/data/foodCategories";
import { getCategory, getCategoryItems } from "@/data/menu";
import { CategoryNavigation } from "@/components/menu/CategoryNavigation";
import { FoodItemCard } from "@/components/menu/FoodItemCard";
import { MenuFocusGrid } from '@/components/menu/MenuFocusGrid';

type Props = { params: Promise<{ category: string }> };
export function generateStaticParams() { return foodCategories.map((category) => ({ category: category.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  return { title: category ? `${category.name} — Menu | Restro` : "Category not found | Restro" };
}
export default async function CategoryMenu({ params }: Props) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const products = getCategoryItems(category.id);
  return (
    <main id="menu-main" tabIndex={-1} className="min-h-[calc(100svh-82px)] bg-[#fafaf7] pb-16 sm:pb-20">
      <div className="bg-white pt-7 pb-8 sm:pt-10 sm:pb-10">
        <div className="categories-container">
          <nav aria-label="Breadcrumb" className="text-xs text-[#666] sm:text-sm"><ol className="flex flex-wrap items-center gap-2"><li><Link href="/">Home</Link></li><li><ChevronRight size={13} aria-hidden="true" /></li><li><Link href="/menu">Menu</Link></li><li><ChevronRight size={13} aria-hidden="true" /></li><li aria-current="page" className="font-semibold text-foreground">{category.name}</li></ol></nav>
          <p className="mt-9 text-xs font-bold tracking-[.16em] text-primary">EXPLORE OUR MENU</p>
          <h1 className="categories-heading mt-3">Our Delicious <span className="text-primary">{category.name}</span></h1>
          <p className="mt-4 text-xs leading-relaxed text-[#c9c4bc]">Sample menu and prices · Illustrative food photography</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#666]">Explore our delicious selection of freshly prepared {category.name.toLowerCase()}.</p>
        </div>
      </div>
      <div className="categories-container pt-7">
        <CategoryNavigation activeCategory={category.id} />
        <MenuFocusGrid className="menu-products-grid mt-7 grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label={`${category.name} specialties`}>
          {products.map((product) => <FoodItemCard key={product.id} product={product} />)}
        </MenuFocusGrid>
        <Link href="/menu" className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"><ArrowLeft size={17} aria-hidden="true" />Back to all categories</Link>
      </div>
    </main>
  );
}
