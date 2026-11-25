import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { aboutContent } from "@/data/about";
import { AboutMedia } from "@/components/about/AboutMedia";
import { StoryTimeline } from "@/components/about/StoryTimeline";

export function AboutStory() {
  return (
    <section className="about-story" aria-labelledby="about-heading">
      <div className="site-container about-story-grid">
        <div className="about-intro">
          <p className="about-badge"><span aria-hidden="true" />{aboutContent.badge}</p>
          <h1 id="about-heading" className="about-title">{aboutContent.title}<span>{aboutContent.highlight}</span></h1>
          <p className="about-intro-description">{aboutContent.description}</p>
          <Link href={aboutContent.menuHref} className="yellow-button about-menu-button">Explore Our Menu<ArrowUpRight size={19} aria-hidden="true" /></Link>
          <AboutMedia media={aboutContent.media} />
        </div>
        <StoryTimeline />
      </div>
    </section>
  );
}
