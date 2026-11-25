export interface FoodCategory {
  id: string;
  name: string;
  filterLabel: string;
  description: string;
  image: string;
  imageAlt: string;
  href?: string;
}

// Demonstration categories, not a verified live restaurant menu.
// Reorder or edit this array to update both the cards and the filter bar.
export const foodCategories: readonly FoodCategory[] = [
  {
    id: "shawarmas",
    name: "Shawarmas",
    filterLabel: "Shawarmas",
    description: "Juicy, flavorful shawarmas packed with delicious fillings and signature sauces.",
    image: "/images/promotions/shawarmas-cutout.webp",
    imageAlt: "Toasted chicken shawarma halves filled with chicken, pickles, greens, and garlic sauce",
  },
  {
    id: "burgers",
    name: "Burgers",
    filterLabel: "Burgers",
    description: "Freshly prepared burgers with juicy patties, melted cheese, and bold flavors.",
    image: "/images/promotions/burgers-cutout.webp",
    imageAlt: "Brioche cheeseburger with a seared patty, melted cheese, lettuce, and tomato",
  },
  {
    id: "mandi",
    name: "Mandi",
    filterLabel: "Mandi",
    description: "Aromatic rice, tender meat, and traditional spices in every delicious serving.",
    image: "/images/promotions/mandi-cutout.webp",
    imageAlt: "Roasted chicken mandi served over aromatic long-grain rice with toasted nuts",
  },
  {
    id: "desserts",
    name: "Desserts",
    filterLabel: "Desserts",
    description: "Indulge in sweet treats, rich chocolate creations, and delightful desserts.",
    image: "/images/promotions/desserts-cutout.webp",
    imageAlt: "Fudgy chocolate brownie with chocolate drizzle and vanilla ice cream",
  },
  {
    id: "drinks",
    name: "Drinks",
    filterLabel: "Drinks",
    description: "Refresh yourself with chilled beverages, creamy shakes, and delicious coolers.",
    image: "/images/promotions/drinks-cutout.webp",
    imageAlt: "Chocolate milkshake, pink fruit cooler, and mint-lime cooler",
  },
  {
    id: "wraps-rolls",
    name: "Wraps & Rolls",
    filterLabel: "Wraps",
    description: "Delicious fillings wrapped to perfection for a satisfying bite.",
    image: "/images/menu-cutouts/wraps-rolls.webp",
    imageAlt: "Assorted toasted chicken wraps with fresh vegetables and creamy sauce",
  },
  {
    id: "fried-chicken",
    name: "Fried Chicken",
    filterLabel: "Chicken",
    description: "Golden, crispy, and perfectly seasoned chicken made for every craving.",
    image: "/images/menu-cutouts/fried-chicken.webp",
    imageAlt: "Golden fried chicken pieces with a crisp seasoned coating and a light herb garnish",
  },
  {
    id: "pizzas",
    name: "Pizzas",
    filterLabel: "Pizzas",
    description: "Cheesy, freshly baked pizzas loaded with your favorite toppings.",
    image: "/images/menu-cutouts/pizzas.webp",
    imageAlt: "Freshly baked pizza with melted mozzarella, tomato, basil, and a golden crust",
  },
  {
    id: "sandwiches",
    name: "Sandwiches",
    filterLabel: "Sandwiches",
    description: "Freshly prepared sandwiches filled with flavorful ingredients.",
    image: "/images/menu-cutouts/sandwiches.webp",
    imageAlt: "Toasted sandwich triangles filled with grilled chicken, lettuce, tomato, and sauce",
  },
].map((category) => ({ ...category, href: `/menu/${category.id}` }));
