"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navigation = ["Home", "Menu", "About", "Reviews", "Contact"];

export function Navbar({ activePage = "home" }: { activePage?: "home" | "menu" | "about" }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [pastOffers, setPastOffers] = useState(false);
  const navVisible = pathname !== "/" || pastOffers;

  useEffect(() => {
    if (pathname !== "/") return;
    const offers = document.querySelector('.offers-section');
    if (!offers) return;
    let threshold = Infinity, frame = 0, disposed = false;
    let shown: boolean | undefined;
    const update = () => {
      frame = 0;
      const next = window.scrollY >= threshold;
      if (shown === next) return;
      shown = next; setPastOffers(next);
      if (!next) {
        setOpen(false);
        const focused = document.activeElement;
        if (focused instanceof HTMLElement && header.current?.contains(focused)) focused.blur();
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => { threshold = offers.getBoundingClientRect().top + window.scrollY; schedule(); };
    const observer = new ResizeObserver(measure);
    document.querySelectorAll('.cinematic-home main > *').forEach(element => observer.observe(element));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('pageshow', measure);
    window.addEventListener('hashchange', measure);
    document.fonts.ready.then(() => { if (!disposed) measure(); });
    measure();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure);
      window.removeEventListener('pageshow', measure); window.removeEventListener('hashchange', measure);
    };
  }, [pathname]);
  const effectiveActive =
    pathname === "/about"
      ? "about"
      : pathname?.startsWith("/menu")
      ? "menu"
      : pathname === "/"
      ? "home"
      : activePage;

  useEffect(() => {
    if (pathname === "/about") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const raf = window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
      return () => window.cancelAnimationFrame(raf);
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    function closeOutside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    }
    const desktop = window.matchMedia("(min-width: 1100px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  function handleLinkClick(label: string, event: React.MouseEvent<HTMLAnchorElement>) {
    setOpen(false);
    if (label === "About") {
      if (pathname === "/about") {
        event.preventDefault();
      }
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }
  }

  function links(items = navigation) {
    return items.map((label) => {
      const isActive = label.toLowerCase() === effectiveActive;
      const href =
        label === "Home"
          ? "/#home"
          : label === "About"
          ? "/about"
          : label === "Reservation"
          ? "/#reservation"
          : label === "Reviews"
          ? "/#reviews"
          : label === "Contact"
          ? "/#contact"
          : "/menu";

      return (
        <li key={label}>
          <Link
            className={`nav-link ${isActive ? "nav-link-active" : ""}`}
            href={href}
            aria-current={isActive ? "page" : undefined}
            onClick={(e) => handleLinkClick(label, e)}
          >
            {label}
          </Link>
        </li>
      );
    });
  }

  return (
    <header ref={header} className="site-header" data-scroll-visible={navVisible} inert={!navVisible} aria-hidden={!navVisible}>
      <div className="site-container navbar flex items-center justify-between gap-3">
        <Link href="/#home" className="brand flex shrink-0 items-center gap-2.5" aria-label="Restro home" onClick={() => setOpen(false)}>
          <span className="wordmark">RESTRO<span>THE ART OF GATHERING</span></span>
        </Link>
        <nav className="desktop-nav navbar-pill" aria-label="Main navigation"><ul className="flex items-center">{links()}</ul></nav>
        <div className="navbar-actions flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/#reservation" className="navbar-reserve" onClick={() => setOpen(false)}><span className="navbar-reserve-full">Reserve a Table</span><span className="navbar-reserve-short">Reserve</span></Link>
          <button ref={toggle} type="button" className="menu-toggle icon-button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
      </div>
      <div id="mobile-navigation" className={`mobile-panel ${open ? "is-open" : ""}`} inert={!open}>
        <div className="mobile-panel-inner">
          <nav className="site-container mobile-nav" aria-label="Mobile navigation"><ul>{links()}</ul></nav>
        </div>
      </div>
    </header>
  );
}
