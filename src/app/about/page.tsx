import type { Metadata } from "next";
import { Navbar } from "@/features/home/components/navbar";
import { Footer } from "@/components/layout/Footer";
import { AboutStory } from "@/components/about/AboutStory";
import { RestaurantValues } from "@/components/about/RestaurantValues";
import { AboutCTA } from "@/components/about/AboutCTA";

export const metadata: Metadata = {
  title: "About Us | Restro",
  description: "Get to know Restro and our passion for bold flavors, handcrafted recipes, and memorable dining experiences.",
};

export default function AboutPage() {
  return (
    <>
      <a href="#about-main" className="skip-link">Skip to About Us</a>
      <Navbar activePage="about" />
      <main id="about-main" tabIndex={-1}>
        <AboutStory />
        <RestaurantValues />
        <AboutCTA />
      </main>
      <Footer />
    </>
  );
}
