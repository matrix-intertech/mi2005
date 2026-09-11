import type { Metadata } from "next";
import { AboutPage } from "@/app/who-we-are/page";
import { getRouteSeo } from "@/lib/seo";

const seo = getRouteSeo("/about-us");
export const metadata: Metadata = { title: seo.title, description: seo.description, alternates: { canonical: seo.path } };

export default function Page() {
  return <AboutPage />;
}
