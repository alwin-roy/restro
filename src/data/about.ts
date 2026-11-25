export type AboutIcon = "passion" | "freshness" | "moments";

export interface AboutStoryStep {
  id: string;
  icon: AboutIcon;
  title: string;
  description: string;
}

export type AboutMediaContent = {
  alt: string;
  caption: string;
} & ({ type: "image"; src: string } | { type: "video"; src: string; poster: string });

export const aboutContent = {
  badge: "GET TO KNOW US",
  title: "More Than Just",
  highlight: "Delicious Food",
  description: "At Restro, we believe great food brings people together. From flavorful shawarmas and juicy burgers to aromatic mandi and delicious desserts, we're here to make every meal an experience worth remembering.",
  disclosure: "",
  menuHref: "/menu",
  media: {
    type: "image",
    src: "/images/categories/shawarmas.webp",
    alt: "Toasted chicken shawarma wraps with fresh fillings and signature garlic sauce",
    caption: "Crafted fresh daily with authentic ingredients.",
  } satisfies AboutMediaContent,
  steps: [
    { id: "01", icon: "passion", title: "Crafted With Passion", description: "We believe every great meal begins with a love for good food. Our menu brings together bold flavors, delicious combinations, and familiar favorites." },
    { id: "02", icon: "freshness", title: "Freshness In Every Bite", description: "From flavorful shawarmas to satisfying burgers and mandi, our focus is on creating meals that taste as good as they look." },
    { id: "03", icon: "moments", title: "Made For Great Moments", description: "Whether you're grabbing a quick meal or enjoying time with friends and family, Restro is all about making every visit enjoyable." },
  ] satisfies readonly AboutStoryStep[],
  values: [
    { icon: "passion", title: "Bold Flavors", description: "Explore a delicious variety of food made for every craving." },
    { icon: "freshness", title: "Something For Everyone", description: "From savory dishes to sweet treats, there's always something to discover." },
    { icon: "moments", title: "Memorable Moments", description: "Good food, great company, and moments worth sharing." },
  ] satisfies readonly Omit<AboutStoryStep, "id">[],
  closing: {
    title: "Ready to Taste the Difference?",
    description: "Explore our full menu and experience the vibrant flavors of Restro today.",
  },
};
