import { ArrowDown } from "lucide-react";

export function Hero() {
  return <section className="cinema-hero" aria-labelledby="hero-heading">
    <div className="cinema-hero-copy">
      <p className="editorial-eyebrow">THE RESTRO EXPERIENCE</p>
      <h1 id="hero-heading">Beyond the <em>Taste.</em></h1>
      <p className="cinema-intro">Discover the art of flavour, the warmth of hospitality,<br className="hidden sm:block" /> and the moments that bring us together.</p>
    </div>
    <a href="#food-favorites" className="hero-scroll">SCROLL TO DISCOVER <ArrowDown size={13} aria-hidden="true" /></a>
  </section>;
}
