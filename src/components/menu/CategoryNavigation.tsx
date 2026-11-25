import Link from "next/link";
import { foodCategories } from "@/data/foodCategories";

export function CategoryNavigation({ activeCategory = "all", overviewHref = "/menu" }: { activeCategory?: string; overviewHref?: string }) {
  const links = [{ id: "all", label: "All", href: overviewHref }, ...foodCategories.map((category) => ({ id: category.id, label: category.filterLabel, href: category.href ?? `/menu/${category.id}` }))];
  return (
    <nav aria-label="Food categories" className="category-filters">
      {links.map((category) => (
        <Link key={category.id} href={category.href} aria-current={activeCategory === category.id ? "page" : undefined} className="category-filter-button">
          <span>{category.label}</span>
        </Link>
      ))}
    </nav>
  );
}
