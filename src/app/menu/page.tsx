import type { Metadata } from "next";
import { FoodCategoriesSection } from "@/components/menu/FoodCategoriesSection";

export const metadata: Metadata = {
  title: "Our Menu | Restro",
  description: "Browse Restro's delicious menu categories and food specialties.",
};

export default function MenuPage() {
  return (
    <main id="menu-main" tabIndex={-1}>
      <h1 className="sr-only">Our menu categories</h1>
      <FoodCategoriesSection showFullMenuLink={false} overviewHref="/menu" />
    </main>
  );
}
