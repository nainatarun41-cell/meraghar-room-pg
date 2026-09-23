import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyDetails } from "@/components/PropertyDetails";
import { TrackViews } from "@/components/TrackViews";
import { JsonLd } from "@/components/JsonLd";
import { realEstateListingJsonLd } from "@/lib/locations/structured-data";
import { getPublicEnv } from "@/lib/env";
import { fetchFavoriteIds, fetchPublicOwner, fetchPublicProperties, fetchPublicProperty } from "@/lib/queries";
import { getAuthUser } from "@/lib/auth";
import { formatPriceForCard, propertyTypeLabel } from "@/lib/utils";
import type { AppPageProps } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: AppPageProps<{ id: string }>
): Promise<Metadata> {
  const { id } = await props.params;
  const property = await fetchPublicProperty(id);
  if (!property) return { title: "Property not found" };

  const price = formatPriceForCard(property.price, property.purpose, property.rent_period);
  const image = property.images?.[0]?.image_url;

  return {
    title: `${property.title} - ${price}`,
    description: `${propertyTypeLabel(property.property_type)} · ${property.city}${property.locality ? `, ${property.locality}` : ""}. ${property.description.slice(0, 150)}`,
    openGraph: {
      title: `${property.title} - ${price} | MeraGhar`,
      description: `${property.locality ? `${property.locality}, ` : ""}${property.city}. ${property.description.slice(0, 200)}`,
      images: image ? [{ url: image, alt: property.title }] : undefined,
      type: "website",
    },
  };
}

export default async function PropertyDetailsPage(
  props: AppPageProps<{ id: string }>
) {
  const { id } = await props.params;
  const property = await fetchPublicProperty(id);
  if (!property) notFound();

  const user = await getAuthUser();
  const isLoggedIn = Boolean(user);
  const isOwner = user?.id === property.owner_id;
  const saved = user ? (await fetchFavoriteIds(user.id)).includes(property.id) : false;

  const owner = await fetchPublicOwner(property.owner_id);

  const related = await fetchPublicProperties({
    city: property.city,
    pageSize: 3,
  });

  const notSelf = related.properties.filter((p) => p.id !== property.id).slice(0, 3);

  return (
    <>
      <TrackViews id={property.id} />
      <JsonLd data={realEstateListingJsonLd(property, getPublicEnv().siteUrl.replace(/\/$/, ""))} />
      <Container className="py-6 sm:py-8">
        <PropertyDetails
          property={property}
          owner={owner}
          isLoggedIn={isLoggedIn}
          saved={saved}
          userIsOwner={isOwner}
        />

        {notSelf.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Similar properties in {property.city}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {notSelf.map((p) => (
                <PropertyCard key={p.id} property={p} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}