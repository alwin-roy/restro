import Image from "next/image";
import type { AboutMediaContent } from "@/data/about";

export function AboutMedia({ media }: { media: AboutMediaContent }) {
  return (
    <figure className="about-media">
      <div className="about-media-frame">
        {media.type === "video" ? (
          <video controls playsInline preload="none" poster={media.poster} aria-label={media.alt}>
            <source src={media.src} />
            Your browser does not support this video.
          </video>
        ) : (
          <Image src={media.src} alt={media.alt} fill sizes="(min-width: 1328px) 660px, (min-width: 1024px) 55vw, calc(100vw - 40px)" className="about-media-image object-cover" loading="lazy" />
        )}
      </div>
      <figcaption>{media.caption}</figcaption>
    </figure>
  );
}
