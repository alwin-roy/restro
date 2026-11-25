import { foodCategories } from "@/data/foodCategories";
import type { MenuItem } from "@/types/menu";

// DEMONSTRATION DATA ONLY: these are sample products and invented demo prices,
// not verified restaurant offerings. Replace this catalog with confirmed data.
type Sample = readonly [slug: string, name: string, description: string, pricePaise: number];
function products(categoryId: string, samples: readonly Sample[]): MenuItem[] {
  const category = foodCategories.find((entry) => entry.id === categoryId);
  if (!category) throw new Error(`Unknown sample category: ${categoryId}`);
  return samples.map(([slug, name, description, pricePaise]) => ({
    id: `${categoryId}-${slug}`, categoryId, name, description, pricePaise,
    image: category.image,
    imageAlt: `Illustrative ${category.name} image for ${name}`,
  }));
}

export const menuItems: readonly MenuItem[] = [
  ...products("shawarmas", [
    ["classic-chicken", "Classic Chicken Shawarma", "Tender chicken, crisp vegetables, pickles, and creamy garlic sauce.", 14900],
    ["beef", "Beef Shawarma", "Seasoned beef, fresh vegetables, and a smooth tahini-style sauce.", 17900],
    ["mexican", "Mexican Shawarma", "Chicken, crunchy peppers, and a lively Mexican-inspired sauce.", 16900],
    ["special", "Special Shawarma", "A generous chicken filling with cheese and a creamy house-style sauce.", 19900],
    ["cheese", "Cheese Shawarma", "Juicy chicken and melted cheese wrapped with fresh vegetables.", 17900],
    ["peri-peri", "Peri Peri Shawarma", "Spiced chicken, crunchy greens, and a tangy peri peri kick.", 18900],
  ]),
  ...products("burgers", [
    ["classic-chicken", "Classic Chicken Burger", "A chicken patty with crisp lettuce, tomato, and creamy sauce.", 15900],
    ["crispy-chicken", "Crispy Chicken Burger", "Crunchy chicken, fresh slaw, and a soft toasted bun.", 17900],
    ["beef", "Beef Burger", "A seared beef patty with pickles, lettuce, and a savory sauce.", 19900],
    ["double-cheese", "Double Cheese Burger", "Two patties, melted cheese, and a satisfying toasted bun.", 24900],
    ["zinger", "Zinger Burger", "Crispy spiced chicken layered with lettuce and creamy dressing.", 18900],
    ["spicy-chicken", "Spicy Chicken Burger", "Chicken with a peppery sauce, fresh greens, and a toasted bun.", 18900],
  ]),
  ...products("mandi", [
    ["chicken", "Chicken Mandi", "Aromatic long-grain rice served with tender roasted chicken.", 29900],
    ["beef", "Beef Mandi", "Slow-cooked beef and fragrant rice with warming spices.", 34900],
    ["al-faham", "Al Faham Mandi", "Chargrilled chicken over fragrant mandi-style rice.", 32900],
    ["peri-peri", "Peri Peri Mandi", "Peri peri chicken paired with delicately seasoned rice.", 33900],
    ["mixed", "Mixed Mandi", "Chicken and beef together with a generous serving of aromatic rice.", 44900],
  ]),
  ...products("desserts", [
    ["brownie", "Chocolate Brownie", "A rich chocolate brownie with a soft, fudgy center.", 11900],
    ["lava-cake", "Chocolate Lava Cake", "A warm chocolate cake with a flowing chocolate center.", 14900],
    ["sundae", "Ice Cream Sundae", "Creamy ice cream layered with chocolate sauce and crunchy toppings.", 13900],
    ["cheesecake", "Cheesecake", "A creamy cheesecake slice on a delicate biscuit base.", 17900],
    ["mousse", "Chocolate Mousse", "A light and silky chocolate dessert with a rich finish.", 12900],
  ]),
  ...products("drinks", [
    ["fresh-lime", "Fresh Lime", "Fresh lime with a refreshing sweet-and-tangy finish.", 6900],
    ["mint-lime", "Mint Lime", "A chilled lime cooler with fresh mint.", 7900],
    ["mojito", "Mojito", "A refreshing alcohol-free mint and lime cooler.", 9900],
    ["chocolate-shake", "Chocolate Milkshake", "A creamy chocolate shake with a rich cocoa flavor.", 13900],
    ["strawberry-shake", "Strawberry Milkshake", "A creamy shake with a bright strawberry flavor.", 13900],
    ["mango", "Mango Juice", "A chilled mango drink with a naturally tropical flavor.", 9900],
  ]),
  ...products("wraps-rolls", [
    ["chicken", "Chicken Wrap", "Grilled chicken and crisp vegetables in a soft toasted wrap.", 14900],
    ["beef", "Beef Wrap", "Seasoned beef, crunchy greens, and creamy sauce in a warm wrap.", 17900],
    ["mexican", "Mexican Wrap", "Chicken, peppers, and a zesty Mexican-inspired filling.", 16900],
    ["peri-peri", "Peri Peri Wrap", "Spicy chicken, fresh vegetables, and peri peri sauce.", 16900],
    ["cheese-chicken", "Cheese Chicken Roll", "Tender chicken and melted cheese in a toasted roll.", 17900],
  ]),
  ...products("fried-chicken", [
    ["crispy", "Crispy Chicken", "Golden chicken with a crunchy, delicately seasoned coating.", 22900],
    ["spicy", "Spicy Fried Chicken", "Crispy chicken with a bold, warming spice blend.", 23900],
    ["strips", "Chicken Strips", "Tender strips of chicken with a golden crumb coating.", 17900],
    ["wings", "Chicken Wings", "Seasoned chicken wings with a crisp, flavorful finish.", 19900],
    ["popcorn", "Chicken Popcorn", "Bite-sized crispy chicken pieces for a satisfying snack.", 14900],
  ]),
  ...products("pizzas", [
    ["margherita", "Margherita Pizza", "Tomato, melted mozzarella, and basil on a golden crust.", 24900],
    ["chicken-bbq", "Chicken BBQ Pizza", "Chicken, melted cheese, and a smoky barbecue-style sauce.", 32900],
    ["peri-peri", "Peri Peri Chicken Pizza", "Peri peri chicken and peppers over a cheesy tomato base.", 32900],
    ["supreme", "Chicken Supreme Pizza", "Chicken, vegetables, and generous cheese on a baked crust.", 34900],
    ["veggie", "Veggie Pizza", "Colorful vegetables, tomato sauce, and melted mozzarella.", 27900],
  ]),
  ...products("sandwiches", [
    ["grilled-chicken", "Grilled Chicken Sandwich", "Grilled chicken, fresh greens, and sauce in toasted bread.", 15900],
    ["club", "Club Sandwich", "Layers of chicken, fresh vegetables, and creamy dressing.", 19900],
    ["cheese", "Cheese Sandwich", "Golden toasted bread filled with warm, melted cheese.", 11900],
    ["bbq-chicken", "BBQ Chicken Sandwich", "Chicken with a smoky barbecue-style sauce and fresh slaw.", 17900],
    ["veggie", "Veggie Sandwich", "Fresh vegetables and a creamy spread between toasted slices.", 12900],
  ]),
];

const itemIndex = new Map(menuItems.map((item) => [item.id, item]));
export const getMenuItem = (id: string) => itemIndex.get(id);
export const getCategory = (slug: string) => foodCategories.find((category) => category.id === slug);
export const getCategoryItems = (slug: string) => menuItems.filter((item) => item.categoryId === slug);
