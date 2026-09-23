import type { Metadata } from "next";
import { getPublicEnv } from "@/lib/env";
import type { LocationCategory } from "@/lib/locations/catalog";
import { categoryPath, locationPath, areaPath } from "@/lib/locations";
import type { LocationRow } from "@/types";
import { APP_NAME } from "@/lib/constants";

export function siteUrl(): string {
  return getPublicEnv().siteUrl.replace(/\/$/, "");
}

export function abs(path: string): string {
  return `${siteUrl()}${path}`;
}

export interface LocationStats {
  total: number;
  rent: number;
  sale: number;
  byType: Record<string, number>;
  minRent: number | null;
  maxRent: number | null;
  minSale: number | null;
  maxSale: number | null;
  lastUpdated: string | null;
}

export const EMPTY_STATS: LocationStats = {
  total: 0,
  rent: 0,
  sale: 0,
  byType: {},
  minRent: null,
  maxRent: null,
  minSale: null,
  maxSale: null,
  lastUpdated: null,
};

function joinAreaNames(location: LocationRow): string {
  const areas = (location.areas ?? []).slice(0, 4);
  if (areas.length === 0) return `${location.name}, ${location.state}`;
  return `${areas.join(", ")}, ${location.name}`;
}

function inr(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

/** Title for the city/town landing page. Root layout appends " | MeraGhar". */
export function locationPageTitle(location: LocationRow): string {
  return `Properties in ${location.name}${location.state ? `, ${location.state}` : ""}`;
}

/** Title for a category page, e.g. "Rooms for Rent in Kaithal". */
export function categoryPageTitle(category: LocationCategory, location: LocationRow): string {
  if (category.slug === "pg") {
    return `PG in ${location.name} | Affordable PG & Paying Guest Rooms`;
  }
  return `${category.label} in ${location.name}`;
}

/** Title for an area page, e.g. "Properties in City Centre, Kaithal". */
export function areaPageTitle(area: string, location: LocationRow): string {
  return `Properties in ${area}, ${location.name}`;
}

function baseDescription(): string {
  return (
    `Rooms, PGs, flats, houses and shops for rent and sale in Haryana. ` +
    `Owners list properties free on ${APP_NAME}; search verified listings with photos, price and contact.`
  );
}

export function locationPageDescription(location: LocationRow, stats: LocationStats): string {
  if (stats.total > 0) {
    return (
      `Search ${stats.total} verified ${stats.total === 1 ? "property" : "properties"} for rent and sale in ${location.name}, ${location.state} on ${APP_NAME}. ` +
      `Popular areas: ${joinAreaNames(location)}.`
    );
  }
  return (
    `Looking for a room, PG, flat or house in ${location.name}, ${location.state}? ` +
    `${APP_NAME} lets local owners list properties free in ${joinAreaNames(location)}.`
  );
}

export function categoryPageDescription(
  category: LocationCategory,
  location: LocationRow,
  stats: LocationStats
): string {
  const label = category.label.toLowerCase();
  const city = location.name;
  if (stats.total > 0) {
    const price = category.purpose === "sale" ? stats.minSale : stats.minRent;
    const pricePart = price != null ? ` starting at ${inr(price)}` : "";
    return (
      `Find ${stats.total} ${label} in ${city}, ${location.state}${pricePart}. ` +
      `Browse photos, rent and owner details on ${APP_NAME} — popular areas: ${joinAreaNames(location)}.`
    );
  }
  return (
    `Browse ${label} in ${city}, ${location.state}. Owners list ${label} free on ${APP_NAME} — ` +
    `check back for new listings in ${joinAreaNames(location)}.`
  );
}

export function areaPageDescription(area: string, location: LocationRow, stats: LocationStats): string {
  if (stats.total > 0) {
    return `Find ${stats.total} verified properties for rent and sale in ${area}, ${location.name}, ${location.state} on ${APP_NAME}. Photos, prices and owner contact.`;
  }
  return `Looking for a property in ${area}, ${location.name}, ${location.state}? ${APP_NAME} lets local owners list rooms, flats and houses free.`;
}

/** Shared tail of every location page metadata object. */
function withSeo(meta: Metadata, { pathname, description, ogTitle }: { pathname: string; description: string; ogTitle: string }): Metadata {
  const canonical = abs(pathname);
  return {
    ...meta,
    description,
    alternates: { canonical },
    openGraph: {
      siteName: APP_NAME,
      type: "website",
      locale: "en_IN",
      title: ogTitle,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export function buildLocationMetadata(location: LocationRow, stats: LocationStats): Metadata {
  const title = locationPageTitle(location);
  const pathname = locationPath(location.slug);
  return withSeo({ title }, {
    pathname,
    description: locationPageDescription(location, stats),
    ogTitle: `${title} | ${APP_NAME}`,
  });
}

export function buildCategoryMetadata(
  category: LocationCategory,
  location: LocationRow,
  stats: LocationStats
): Metadata {
  const title = categoryPageTitle(category, location);
  const pathname = categoryPath(location.slug, category.slug);
  return withSeo({ title }, {
    pathname,
    description: categoryPageDescription(category, location, stats),
    ogTitle: `${title} | ${APP_NAME}`,
  });
}

export function buildAreaMetadata(
  area: string,
  location: LocationRow,
  stats: LocationStats
): Metadata {
  const title = areaPageTitle(area, location);
  const pathname = areaPath(location.slug, area);
  return withSeo({ title }, {
    pathname,
    description: areaPageDescription(area, location, stats),
    ogTitle: `${title} | ${APP_NAME}`,
  });
}

/** Metadata for a location page that has no real listing data yet. */
export function buildEmptyLocationMetadata(location: LocationRow): Metadata {
  const title = locationPageTitle(location);
  const pathname = locationPath(location.slug);
  return withSeo({ title }, {
    pathname,
    description: locationPageDescription(location, EMPTY_STATS),
    ogTitle: `${title} | ${APP_NAME}`,
  });
}

export { baseDescription };