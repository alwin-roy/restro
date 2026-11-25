import { Heart, Leaf, Users } from "lucide-react";
import { aboutContent } from "@/data/about";

const icons = { passion: Heart, freshness: Leaf, moments: Users };

export function StoryTimeline() {
  return (
    <ol className="about-timeline" aria-label="Our approach to food and dining">
      {aboutContent.steps.map((step) => {
        const Icon = icons[step.icon];
        return (
          <li key={step.id}>
            <span className="about-timeline-marker" aria-hidden="true" />
            <article className="about-story-card">
              <div className="flex items-center justify-between gap-4">
                <p className="about-step-label">STEP {step.id}</p>
                <span className="about-story-icon"><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span>
              </div>
              <h2>{step.title}</h2>
              <p className="about-story-description">{step.description}</p>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
