import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";
import { fetchPublicProperties, cityNameVariants } from "@/lib/queries";
import { fetchActiveLocations } from "@/lib/locations";
import { LOCATION_CATEGORIES } from "@/lib/locations/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicEnv().siteUrl.replace(/\/$/, "");

  const urls: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/properties`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/requirements`, lastModified: new Date(), priority: 0.6 },
    { url: `${base}/login`, lastModified: new Date(), priority: 0.3 },
    { url: `${base}/signup`, lastModified: new Date(), priority: 0.3 },
    { url: `${base}/post-requirement`, lastModified: new Date(), priority: 0.5 },
  ];

  const result = await fetchPublicProperties({ pageSize: 3000, sort: "newest" });
  for (const property of result.properties) {
    urls.push({
      url: `${base}/properties/${property.id}`,
      lastModified: new Date(property.created_at),
      changeFrequency: "weekly" as const,
      priority: property.is_featured ? 0.8 : 0.7,
    });
  }

  const locations = await fetchActiveLocations();

  // Area URLs are only added to the sitemap when that locality has real
  // approved listings, so we never advertise empty pages.
  const areaWithListings = new Set<string>();
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    for (const location of locations) {
      const { data } = await supabase
        .from("properties")
        .select("locality")
        .eq("status", "approved")
        .in("city", cityNameVariants(location.name))
        .limit(100);
      const locals = Array.from(
        new Set((data ?? []).map((r) => r.locality).filter((v): v is string => Boolean(v)))
      );
      for (const area of locals) {
        const areaSlug = slugifySegment(area);
        if (areaSlug) areaWithListings.add(`${location.slug.toLowerCase()}/${areaSlug}`);
      }
    }
  }

  for (const location of locations) {
    const slug = location.slug.toLowerCase();
    const lastModified = new Date(location.created_at);

    urls.push({
      url: `${base}/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    });

    for (const category of LOCATION_CATEGORIES) {
      urls.push({
        url: `${base}/${slug}/${category.slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      });
    }

    if (location.parent_slug) {
      urls.push({
        url: `${base}/${location.parent_slug.toLowerCase()}/${slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      });
    }

    for (const area of location.areas ?? []) {
      const areaSlug = slugifySegment(area);
      const key = areaSlug ? `${slug}/${areaSlug}` : null;
      if (key && areaWithListings.has(key)) {
        urls.push({
          url: `${base}/${key}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.5,
        });
      }
    }
  }

  return urls;
}