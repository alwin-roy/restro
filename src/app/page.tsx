import { CinematicBackground } from "@/components/cinematic/CinematicBackground";
import { FoodMarquee } from "@/components/FoodMarquee";
import { FoodCategoriesSection } from "@/components/menu/FoodCategoriesSection";
import { PromotionalOffers } from "@/components/offers/PromotionalOffers";
import { ReservationSection } from "@/components/reservation/ReservationSection";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/features/home/components/hero";
import { Navbar } from "@/features/home/components/navbar";

export default function Home() {
  return (
    <div className="cinematic-home">
      <CinematicBackground />
      <a href="#home" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="home" tabIndex={-1}>
        <Hero />
        <FoodMarquee />
        <PromotionalOffers />
        <FoodCategoriesSection />
        <ReservationSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
