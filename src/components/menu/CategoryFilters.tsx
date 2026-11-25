import type { ReactNode } from "react";
import { CategoryNavigation } from "./CategoryNavigation";
import { MenuFocusGrid } from './MenuFocusGrid';

// Retains the existing overview wrapper. Specific categories now navigate to
// their product routes rather than filtering the overview down to one card.
export function CategoryFilters({ children, overviewHref = "/menu" }: { children: ReactNode; overviewHref?: string }) {
  return (
    <div className="mt-9 sm:mt-11">
      <CategoryNavigation overviewHref={overviewHref} />
      <MenuFocusGrid id="food-categories-grid" className="mt-6 grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">{children}</MenuFocusGrid>
    </div>
  );
}
