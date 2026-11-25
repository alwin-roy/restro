import type { SocialPlatform } from "@/data/restaurantContact";

export function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "facebook") return <span className="contact-facebook" aria-hidden="true">f</span>;
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    {platform === "instagram" ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></> : platform === "youtube" ? <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" /></> : <><path d="M4 3h4l12 18h-4Z" /><path d="m20 3-7 8M4 21l7-8" /></>}
  </svg>;
}
