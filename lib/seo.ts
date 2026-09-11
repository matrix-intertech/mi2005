import type { MetadataRoute } from "next";

export const siteUrl = "https://matrixonline.in";

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
  return `${siteUrl}${path === "/" ? "" : path}`;
}

export function sitemapEntries(): MetadataRoute.Sitemap {
  return routeSeo.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.path === "/" ? 1 : route.path === "/contact-us" ? 0.9 : 0.7,
  }));
}
