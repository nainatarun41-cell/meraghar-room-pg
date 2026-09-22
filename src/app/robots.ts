import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const env = getPublicEnv();
  const base = env.siteUrl.replace(/\/$/, "");

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/favorites", "/add-property", "/edit-property", "/post-requirement"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}