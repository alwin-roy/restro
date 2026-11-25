import Link from "next/link";
import { cacheLife } from "next/cache";
import { ChevronRight, Clock3, Mail, MapPin, Phone, Utensils } from "lucide-react";
import { BackToTop } from "@/components/layout/BackToTop";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { foodCategories } from "@/data/foodCategories";
import { restaurantContact, type SocialPlatform } from "@/data/restaurantContact";
import { contactEmailHref, contactPhoneHref, contactSocialHref } from "@/lib/contact";

interface FooterLink { label: string; href?: string; }
const quickLinks: readonly FooterLink[] = [
  { label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Our Menu", href: "/menu" },
  { label: "Reservation", href: "/#reservation" }, { label: "Reviews", href: "/#reviews" }, { label: "Contact", href: "/#contact" },
];
const socialPlatforms: readonly { platform: SocialPlatform; label: string }[] = [
  { platform: "facebook", label: "Facebook" }, { platform: "instagram", label: "Instagram" }, { platform: "youtube", label: "YouTube" }, { platform: "x", label: "X (Twitter)" },
];

function FooterLinks({ heading, label, items }: { heading: string; label: string; items: readonly FooterLink[] }) {
  return <nav aria-label={label}><h2 className="footer-heading">{heading}</h2><ul className="footer-link-list">{items.map((item) => <li key={item.label}>{item.href ? <Link className="footer-link" href={item.href}><ChevronRight size={14} aria-hidden="true" />{item.label}</Link> : <span className="footer-link footer-link-unavailable" aria-disabled="true"><ChevronRight size={14} aria-hidden="true" /><span>{item.label}<span className="footer-coming-soon">Coming soon</span></span></span>}</li>)}</ul></nav>;
}

export async function Footer() {
  "use cache";
  cacheLife("hours");
  const year = new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date());
  const socials = socialPlatforms.flatMap(({ platform, label }) => {
    const href = contactSocialHref(platform, restaurantContact.socialLinks[platform]);
    return href ? [{ platform, label, href }] : [];
  });
  const phoneHref = contactPhoneHref(restaurantContact.phone);
  const emailHref = contactEmailHref(restaurantContact.email);
  const details = [
    { label: "Address", Icon: MapPin, value: restaurantContact.address.trim() || restaurantContact.placeholders.address, href: null },
    { label: "Phone", Icon: Phone, value: phoneHref ? restaurantContact.phone.trim() : restaurantContact.placeholders.phone, href: phoneHref },
    { label: "Email", Icon: Mail, value: emailHref ? restaurantContact.email.trim() : restaurantContact.placeholders.email, href: emailHref },
    { label: "Hours", Icon: Clock3, value: restaurantContact.workingHours.trim() || restaurantContact.placeholders.workingHours, href: null },
  ];
  return <>
    <footer id="footer" className="site-footer">
      <div className="site-container footer-grid">
        <div>
          <Link href="/#home" className="footer-brand" aria-label="Restro home"><span className="brand-icon flex shrink-0 items-center justify-center"><Utensils size={23} strokeWidth={2.7} aria-hidden="true" /></span><span>Restro</span></Link>
          <p className="footer-description">Bringing you delicious food, bold flavors, and memorable dining experiences. From flavorful shawarmas to mouthwatering meals, every bite is made with care.</p>
          {socials.length > 0 && <nav className="footer-socials" aria-label="Footer social profiles">{socials.map(({ platform, label, href }) => <a key={platform} className="contact-social" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} — opens in a new tab`}><SocialIcon platform={platform} /></a>)}</nav>}
        </div>
        <FooterLinks heading="Quick Links" label="Footer quick links" items={quickLinks} />
        <FooterLinks heading="Our Menu" label="Footer menu categories" items={foodCategories.map((category) => ({ label: category.name, href: category.href }))} />
        <div><h2 className="footer-heading">Get In Touch</h2><dl className="footer-contact-list">{details.map(({ label, Icon, value, href }) => <div key={label} className="footer-contact-row"><dt><span className="footer-contact-icon"><Icon size={18} aria-hidden="true" /></span>{label}</dt><dd>{href ? <a href={href}>{value}</a> : value}</dd></div>)}</dl></div>
      </div>
      <div className="footer-bottom"><div className="site-container footer-bottom-inner"><p>© {year} <span>Restro.</span> All Rights Reserved.</p></div></div>
    </footer>
    <BackToTop />
  </>;
}
