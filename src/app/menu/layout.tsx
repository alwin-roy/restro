import { Navbar } from "@/features/home/components/navbar";
import { Footer } from "@/components/layout/Footer";

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (<><a href="#menu-main" className="skip-link">Skip to menu</a><Navbar activePage="menu" />{children}<Footer /></>);
}
