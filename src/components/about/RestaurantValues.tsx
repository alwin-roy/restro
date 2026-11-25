import { Sparkles, UtensilsCrossed, Users } from "lucide-react";
import { aboutContent } from "@/data/about";

const icons = { passion: UtensilsCrossed, freshness: Sparkles, moments: Users };

export function RestaurantValues() {
  return (
    <section className="about-values" aria-labelledby="about-values-heading">
      <div className="site-container">
        <div className="about-values-heading">
          <p className="about-eyebrow">THE RESTRO SPIRIT</p>
          <h2 id="about-values-heading">What Makes Restro <span>Special?</span></h2>
          <span className="about-heading-line" aria-hidden="true" />
        </div>
        <div className="about-values-grid">
          {aboutContent.values.map((value) => {
            const Icon = icons[value.icon];
            return <article key={value.title} className="about-value-card"><span className="about-value-icon"><Icon size={25} strokeWidth={1.6} aria-hidden="true" /></span><h3>{value.title}</h3><p>{value.description}</p></article>;
          })}
        </div>
      </div>
    </section>
  );
}
