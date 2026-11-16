import type { MetadataRoute } from "next";
import { absoluteUrl, sitemapEntries } from "@/lib/seo";
import { getPublicCareers } from "@/lib/public-careers";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A database outage must not publish a misleading sitemap that silently drops jobs.
  const careers = await getPublicCareers();
  return [...sitemapEntries(), ...careers.map((role) => ({
    url: absoluteUrl(`/career/${role._id!.toString()}`),
    lastModified: role.updatedAt || role.createdAt,
    changeFrequency: "weekly" as const, priority: 0.6,
  }))];
}
