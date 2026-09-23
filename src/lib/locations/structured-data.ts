import type { PropertyWithImages } from "@/types";
import { slugify } from "@/lib/utils";

export interface Crumb {
  name: string;
  url: string;
}

export function websiteJsonLd(siteUrl: string, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/properties?city={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function itemListJsonLd(items: { url: string; title: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: it.url,
      name: it.title,
    })),
  };
}

function propertyPrice(property: PropertyWithImages): number {
  return Number(property.price) || 0;
}

/** Factual RealEstateListing schema built only from real property data. */
export function realEstateListingJsonLd(property: PropertyWithImages, siteUrl: string) {
  const price = propertyPrice(property);
  const sold = property.status === "rented" || property.status === "sold";
  const image =
    property.images?.[0]?.image_url
      ? [...(property.images ?? [])]
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((i) => i.image_url)
      : undefined;

  const listing: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${siteUrl}/properties/${property.id}#listing`,
    name: property.title,
    url: `${siteUrl}/properties/${property.id}`,
    description: (property.description ?? "").slice(0, 500),
    datePosted: property.created_at,
    image,
    address: {
      "@type": "PostalAddress",
      streetAddress: [property.locality, property.address].filter(Boolean).join(", ") || undefined,
      addressRegion: undefined,
      addressCountry: "IN",
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
      availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
  };

  if (property.bhk != null) {
    listing.numberOfRooms = property.bhk;
  }
  if (property.area_sqft != null) {
    listing.floorSize = {
      "@type": "QuantitativeValue",
      value: Number(property.area_sqft),
      unitCode: "FTK",
    };
  }
  if (property.furnishing) {
    listing["additionalProperty"] = [
      {
        "@type": "PropertyValue",
        name: "furnishing",
        value: property.furnishing.replace(/_/g, " "),
      },
    ];
  }

  return listing;
}

/** SEO slug for a locality display name — shared with the route lookup. */
export function localitySlug(displayName: string): string {
  return slugify(displayName);
}