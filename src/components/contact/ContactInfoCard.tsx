import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { restaurantContact, type SocialPlatform } from "@/data/restaurantContact";
import { contactEmailHref, contactPhoneHref, contactSocialHref } from "@/lib/contact";

const socialLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  x: "X (Twitter)",
};

export function ContactInfoCard() {
  const phoneHref = contactPhoneHref(restaurantContact.phone);
  const emailHref = contactEmailHref(restaurantContact.email);
  const items = [
    { label: "ADDRESS", Icon: MapPin, value: restaurantContact.address.trim(), href: null },
    { label: "PHONE", Icon: Phone, value: restaurantContact.phone.trim(), href: phoneHref },
    { label: "EMAIL", Icon: Mail, value: restaurantContact.email.trim(), href: emailHref },
    { label: "WORKING HOURS", Icon: Clock3, value: restaurantContact.workingHours.trim(), href: null },
  ];
  const socials = (Object.keys(socialLabels) as SocialPlatform[]).map((platform) => ({
    platform,
    label: socialLabels[platform],
    href: contactSocialHref(platform, restaurantContact.socialLinks[platform]),
  }));

  return (
    <aside className="contact-info-card" aria-labelledby="contact-talk-heading">
      <div>
        <h3 id="contact-talk-heading" className="contact-talk-heading">Let&apos;s Talk</h3>
        <p className="mt-4 text-sm leading-[1.8] text-[#c9c9c9]">Have a question or special request? Get in touch with our team.</p>
      </div>
      <dl className="contact-detail-list">
        {items.map(({ label, Icon, value, href }) => (
          <div key={label} className="contact-detail">
            <dt>
              <span className="contact-detail-icon">
                <Icon size={19} aria-hidden="true" />
              </span>
              {label}
            </dt>
            <dd>{href ? <a href={href}>{value}</a> : value}</dd>
          </div>
        ))}
      </dl>
      <div className="contact-social-area">
        <div className="flex flex-wrap gap-2.5" aria-label="Restaurant social profiles">
          {socials.map(({ platform, label, href }) =>
            href ? (
              <a
                key={platform}
                className="contact-social"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} — opens in a new tab`}
              >
                <SocialIcon platform={platform} />
              </a>
            ) : null
          )}
        </div>
      </div>
    </aside>
  );
}
