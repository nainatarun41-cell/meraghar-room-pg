import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";
import { fetchPublicProperties } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const env = getPublicEnv();
  const base = env.siteUrl.replace(/\/$/, "");

  const staticPages = [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/properties`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/requirements`, lastModified: new Date(), priority: 0.6 },
    { url: `${base}/login`, lastModified: new Date(), priority: 0.3 },
    { url: `${base}/signup`, lastModified: new Date(), priority: 0.3 },
    { url: `${base}/post-requirement`, lastModified: new Date(), priority: 0.5 },
  ];

  const result = await fetchPublicProperties({ pageSize: 500, sort: "newest" });

  const properties = result.properties.map((p) => ({
    url: `${base}/properties/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly" as const,
    priority: p.is_featured ? 0.8 : 0.7,
  }));

  return [...staticPages, ...properties];
}