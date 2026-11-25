# Food category photography

Nine illustrative food photographs created with the built-in image_gen tool for
this Restro section. They are not photographs of verified restaurant dishes.
The page labels them as illustrative. Implemented demo category routes reuse each
category photo for its sample product cards; these are temporary category-image
placeholders, not photographs of each individual named dish.
No random third-party image URLs or stock-image licensing assumptions are used.

The exact common prompt and nine subject prompts are saved in `prompts.json`.
Each selected image is stored here as a 1200 x 800 WebP (quality 82). The original
outputs remain in the image tool's generated-images directory. The page uses
Next.js Image optimization, responsive sizes, fixed image areas, and lazy loading.

Files: shawarmas.webp, burgers.webp, mandi.webp, desserts.webp, drinks.webp,
wraps-rolls.webp, fried-chicken.webp, pizzas.webp, sandwiches.webp.

To replace imagery, add an appropriately licensed local photograph and update
`image` / `imageAlt` in `src/data/foodCategories.ts`. Keep each subject centered
for the responsive object-cover crop. Names, descriptions, filter labels, and
category order are maintained in that same data file. All nine categories now link to implemented `/menu/[category]` demo destinations.
Product records in `src/data/menu.ts` inherit category photos; replace individual
product `image` / `imageAlt` values there when verified dish photos are supplied.
