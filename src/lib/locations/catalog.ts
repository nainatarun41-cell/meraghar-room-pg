import type { PropertyPurpose, PropertyType } from "@/types";

/**
 * SEO category registry for location pages.
 *
 * Each category maps to real property filters (purpose / property type) so the
 * category pages show only genuinely matching listings. The slugs here are the
 * second path segment on location pages, e.g. /kaithal/rooms-for-rent.
 */
export interface LocationCategory {
  slug: string;
  label: string;
  purpose?: PropertyPurpose;
  type?: PropertyType;
}

export const LOCATION_CATEGORIES: LocationCategory[] = [
  { slug: "properties-for-rent", label: "Properties for Rent", purpose: "rent" },
  { slug: "properties-for-sale", label: "Properties for Sale", purpose: "sale" },
  { slug: "pg", label: "PG", type: "pg" },
  { slug: "rooms-for-rent", label: "Rooms for Rent", purpose: "rent", type: "room" },
  { slug: "flats-for-rent", label: "Flats for Rent", purpose: "rent", type: "flat" },
  { slug: "flats-for-sale", label: "Flats for Sale", purpose: "sale", type: "flat" },
  { slug: "houses-for-rent", label: "Houses for Rent", purpose: "rent", type: "house" },
  { slug: "houses-for-sale", label: "Houses for Sale", purpose: "sale", type: "house" },
  { slug: "shops-for-rent", label: "Shops for Rent", purpose: "rent", type: "shop" },
  { slug: "shops-for-sale", label: "Shops for Sale", purpose: "sale", type: "shop" },
  { slug: "offices-for-rent", label: "Office Spaces for Rent", purpose: "rent", type: "office" },
  { slug: "offices-for-sale", label: "Office Spaces for Sale", purpose: "sale", type: "office" },
  { slug: "plots-for-sale", label: "Plots for Sale", purpose: "sale", type: "plot" },
];

export function getCategoryBySlug(slug: string): LocationCategory | undefined {
  return LOCATION_CATEGORIES.find((c) => c.slug === slug);
}

/** Property types that map to BHK-style pages reachable from a location page. */
export const BHK_TYPE_OPTIONS: { type: PropertyType; label: string }[] = [
  { type: "1 bhk", label: "1 BHK" },
  { type: "2 bhk", label: "2 BHK" },
  { type: "3 bhk", label: "3 BHK" },
];