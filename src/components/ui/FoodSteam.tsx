const hotCategories = new Set(['shawarmas', 'burgers', 'mandi', 'wraps-rolls', 'fried-chicken', 'pizzas', 'sandwiches']);
export function isHotFoodCategory(category: string) { return hotCategories.has(category); }
export function FoodSteam() {
  return <span className="food-steam" aria-hidden="true"><i /><i /><i /></span>;
}
