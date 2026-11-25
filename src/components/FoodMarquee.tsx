export const foodItems = [
  "Chicken Shawarma",
  "Beef Shawarma",
  "Special Shawarma",
  "Mexican Shawarma",
  "Chicken Mandi",
  "Al Faham Mandi",
  "Beef Mandi",
  "Classic Burgers",
  "Chicken Burgers",
  "Chocolate Brownies",
  "Ice Cream & Desserts",
  "Loaded Fries",
] as const;

function FoodGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      aria-hidden={duplicate || undefined}
      className="food-marquee-group m-0 flex min-w-[100vw] shrink-0 list-none p-0"
    >
      {foodItems.map((food) => (
        <li key={food} className="flex h-[52px] flex-auto shrink-0 items-center gap-6 pr-6 sm:gap-8 sm:pr-8">
          <span className="whitespace-nowrap">{food}</span>
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-white/75" />
        </li>
      ))}
    </ul>
  );
}

export function FoodMarquee() {
  return (
    <section
      id="food-favorites"
      aria-label="Food favorites"
      tabIndex={0}
      className="food-marquee w-full overflow-hidden bg-primary font-sans text-lg leading-none font-extrabold text-white sm:text-xl"
    >
      <div className="food-marquee-track flex w-max">
        <FoodGroup />
        <FoodGroup duplicate />
      </div>
    </section>
  );
}
