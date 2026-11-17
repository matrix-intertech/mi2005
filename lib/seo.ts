import type { Metadata, MetadataRoute } from "next";

export const siteUrl = "https://www.matrixonline.in";

export const routeSeo = [
  {
    path: "/",
    title: "Turnkey Interior Designers Delhi NCR | Matrix Intertech",
    description: "Delhi-based Matrix Intertech delivers turnkey interior solutions, architectural coordination and fit-out execution for corporate, commercial and residential spaces.",
  },
  {
    path: "/who-we-are",
    title: "Turnkey Interior Company in Delhi | Matrix Intertech",
    description: "Meet Matrix Intertech, a Delhi-based interior design and build company coordinating architecture, site execution and turnkey project delivery since 2005.",
  },
  {
    path: "/about-us",
    title: "Matrix Intertech Private Limited | About Our Company",
    description: "Matrix Intertech Private Limited is a New Delhi architecture and interior company with ISO certifications and concept-to-handover delivery capabilities.",
  },
  {
    path: "/real-estate",
    title: "Real Estate Interior Solutions | Matrix Intertech",
    description: "Real estate interior solutions for sales offices, experience centres and project environments, with developer fit-out support, coordination and property interior execution.",
  },
  {
    path: "/repair-and-maintenance",
    title: "Office Repair and Maintenance Delhi NCR | Matrix Intertech",
    description: "Commercial repair and maintenance, office refurbishment and interior renovation from Delhi-based Matrix Intertech, with phased execution for occupied properties.",
  },
  {
    path: "/residential",
    title: "Residential Interior Designers Delhi NCR | Matrix Intertech",
    description: "Turnkey home interiors and apartment interior design with coordinated layouts, lighting, finishes and residential execution by Delhi-based Matrix Intertech.",
  },
  {
    path: "/commercial",
    title: "Commercial Interior Designers Delhi NCR | Matrix Intertech",
    description: "Corporate office interiors, workplace design and commercial fit-out execution for offices, retail and hospitality by Delhi-based Matrix Intertech.",
  },
  {
    path: "/process",
    title: "Turnkey Interior Project Process | Matrix Intertech",
    description: "Understand the turnkey interior project process: site inspection, design, estimates, execution and project management through finishes and handover.",
  },
  {
    path: "/projects",
    title: "Corporate and Residential Interior Projects | Matrix Intertech",
    description: "Explore corporate interior projects, office fit-out and residential project categories, with an overview of Matrix Intertech turnkey interior execution capabilities.",
  },
  {
    path: "/career",
    title: "Interior Design and Site Execution Careers | Matrix Intertech",
    description: "Explore current interior design, site execution and project delivery openings at Matrix Intertech. Review role requirements and apply for available positions.",
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
    title: "Interior Project Consultation Delhi NCR | Matrix Intertech",
    description: "Contact Matrix Intertech in New Delhi for an interior project consultation, office interior quotation or turnkey project enquiry. Share your site, scope and timeline.",
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
