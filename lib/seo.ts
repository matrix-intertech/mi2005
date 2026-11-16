import type { Metadata, MetadataRoute } from "next";

export const siteUrl = "https://www.matrixonline.in";

export const routeSeo = [
  {
    path: "/",
    title: "Matrix Intertech | Turnkey Interiors and Architecture",
    description: "Matrix Intertech delivers premium interior design, architecture coordination and turnkey fitout execution for corporate, residential and commercial spaces.",
  },
  {
    path: "/who-we-are",
    title: "Who We Are | Matrix Intertech",
    description: "Learn about Matrix Intertech, a Delhi-based architecture, interiors and turnkey implementation company founded in 2005.",
  },
  {
    path: "/about-us",
    title: "About Us | Matrix Intertech",
    description: "About Matrix Intertech, a New Delhi interior and architectural services company delivering concept-to-complete turnkey interiors since 2005.",
  },
  {
    path: "/real-estate",
    title: "Real Estate Interiors | Matrix Intertech",
    description: "Experience centres, sales offices and project environments designed and executed for real estate presentation and client engagement.",
  },
  {
    path: "/repair-and-maintenance",
    title: "Repair and Maintenance | Matrix Intertech",
    description: "Repair, refurbishment and upgrade work for occupied offices, commercial spaces and residential properties with practical site planning.",
  },
  {
    path: "/residential",
    title: "Residential Interiors | Matrix Intertech",
    description: "Premium residential interiors for homes and apartments, planned around comfort, storage, finishes and long-term usability.",
  },
  {
    path: "/commercial",
    title: "Commercial Interiors | Matrix Intertech",
    description: "Commercial, corporate, retail, hospitality and institutional interiors delivered with turnkey coordination and handover-focused execution.",
  },
  {
    path: "/process",
    title: "Process | Matrix Intertech",
    description: "Matrix Intertech's turnkey process from site inspection and concept design through detailing, estimates, execution, finishes and handover.",
  },
  {
    path: "/projects",
    title: "Projects | Matrix Intertech",
    description: "Explore Matrix Intertech project categories across corporate offices, residential apartments, commercial showrooms and turnkey execution.",
  },
  {
    path: "/career",
    title: "Career | Matrix Intertech",
    description: "Send career enquiries for interior design, architecture, site execution and project management roles with Matrix Intertech.",
  },
  {
    path: "/clients",
    title: "Our Clients | Matrix Intertech",
    description: "Explore Matrix Intertech client associations across banking, aviation, media, retail, infrastructure, hospitality and corporate interiors.",
  },
  {
    path: "/company-factsheet",
    title: "Company Factsheet | Matrix Intertech",
    description: "Matrix Intertech company factsheet with founding year, Delhi base, turnkey interior capabilities, sectors served and contact details.",
  },
  {
    path: "/contact-us",
    title: "Contact | Matrix Intertech",
    description: "Contact Matrix Intertech for architecture, interiors and turnkey fitout project enquiries in Delhi and beyond.",
  },
] as const;

export type RoutePath = (typeof routeSeo)[number]["path"];

export function getRouteSeo(path: RoutePath) {
  return routeSeo.find((route) => route.path === path)!;
}

export function absoluteUrl(path: string) {
  return `${siteUrl}${path}`;
}

export function sitemapEntries(): MetadataRoute.Sitemap {
  return routeSeo.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.path === "/" ? 1 : route.path === "/contact-us" ? 0.9 : 0.7,
  }));
}



export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = absoluteUrl(path);
  const image = absoluteUrl("/images/matrix/hero-studio.webp");
  return {
    title, description, alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: "Matrix Intertech", title, description,
      images: [{ url: image, width: 1800, height: 771, alt: "Architecture and interior design studio" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export function routeMetadata(path: RoutePath): Metadata {
  const route = getRouteSeo(path);
  return pageMetadata(path, route.title, route.description);
}
