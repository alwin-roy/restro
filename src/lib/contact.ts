import type { SocialPlatform } from "@/data/restaurantContact";
import { isValidContactEmail } from "@/lib/validations/enquiry";

export function contactPhoneHref(value: string): string | null {
  const number = value.trim().replace(/[\s()-]/g, "");
  return /^\+[1-9][0-9]{6,14}$/.test(number) ? `tel:${number}` : null;
}
export function contactEmailHref(value: string): string | null {
  const email = value.trim();
  return isValidContactEmail(email) ? `mailto:${encodeURIComponent(email).replace("%40", "@")}` : null;
}
const domains: Record<SocialPlatform, readonly string[]> = { instagram: ["instagram.com"], facebook: ["facebook.com"], youtube: ["youtube.com", "youtu.be"], x: ["x.com", "twitter.com"] };
export function contactSocialHref(platform: SocialPlatform, value: string): string | null {
  if (!value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && domains[platform].some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)) ? url.href : null;
  } catch { return null; }
}
