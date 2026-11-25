export type SocialPlatform = "instagram" | "facebook" | "youtube" | "x";
export interface RestaurantContactConfig {
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  socialLinks: Record<SocialPlatform, string>;
  placeholders: { address: string; phone: string; email: string; workingHours: string; };
}

export const restaurantContact: RestaurantContactConfig = {
  address: "124 MG Road, Indiranagar, Bengaluru, Karnataka 560038",
  phone: "+91 98765 43210",
  email: "hello@restro.com",
  workingHours: "Mon – Sun: 11:00 AM – 11:00 PM",
  socialLinks: {
    instagram: "https://instagram.com/restro",
    facebook: "https://facebook.com/restro",
    youtube: "https://youtube.com/@restro",
    x: "https://x.com/restro",
  },
  placeholders: {
    address: "124 MG Road, Indiranagar, Bengaluru, Karnataka 560038",
    phone: "+91 98765 43210",
    email: "hello@restro.com",
    workingHours: "Mon – Sun: 11:00 AM – 11:00 PM",
  },
};
