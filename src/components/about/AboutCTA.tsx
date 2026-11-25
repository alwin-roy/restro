import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { aboutContent } from "@/data/about";

export function AboutCTA() {
  return (
    <section className="about-closing" aria-labelledby="about-closing-heading">
      <div className="site-container about-closing-panel">
        <h2 id="about-closing-heading">{aboutContent.closing.title}</h2>
        <p>{aboutContent.closing.description}</p>
        <Link href={aboutContent.menuHref} className="about-dark-button">Explore Menu<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
