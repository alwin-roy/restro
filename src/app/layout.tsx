import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./cinematic.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0D0B09",
};

export const metadata: Metadata = {
  title: "Restro",
  description:
    "Experience bold flavors at Restro. Freshly prepared shawarmas and your favorite fast-food dishes, made to satisfy.",
  applicationName: "Restro",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Restro",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body id="page-top" tabIndex={-1} className="flex min-h-screen flex-col font-sans">{children}</body>
    </html>
  );
}

