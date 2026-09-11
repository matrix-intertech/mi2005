import type { Metadata } from "next";
import { getRouteSeo } from "@/lib/seo";

const seo = getRouteSeo("/residential");
export const metadata: Metadata = { title: seo.title, description: seo.description, alternates: { canonical: seo.path } };
import { ServicePage } from "@/components/service-page";
export default function Page() { return <ServicePage slug="residential" />; }

