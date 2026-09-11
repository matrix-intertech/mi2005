import type { Metadata } from "next";
import { absoluteUrl, getRouteSeo } from "@/lib/seo";
import "./globals.css";

const homeSeo = getRouteSeo("/");

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: homeSeo.title,
    template: "%s",
  },
  description: homeSeo.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Matrix Intertech",
    title: homeSeo.title,
    description: homeSeo.description,
    images: [{ url: "/images/matrix/hero-studio.webp", width: 1600, height: 1100, alt: "Premium architecture and interior space by Matrix Intertech" }],
  },
  twitter: {
    card: "summary_large_image",
    title: homeSeo.title,
    description: homeSeo.description,
    images: ["/images/matrix/hero-studio.webp"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
