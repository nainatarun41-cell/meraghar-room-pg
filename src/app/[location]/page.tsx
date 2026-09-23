import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { getChildLocations, getLocationBySlug, getNearbyLocations, getLocalitiesForCity, locationPath } from "@/lib/locations";
import { buildLocationMetadata, locationPageTitle, siteUrl } from "@/lib/locations/seo";
import { fetchCityStats, fetchPublicProperties } from "@/lib/queries";
import { getAuthUser } from "@/lib/auth";
import { fetchFavoriteIds } from "@/lib/queries";
import { LocationBreadcrumbs } from "@/components/locations/LocationBreadcrumbs";
import { LocationLandingContent } from "@/components/locations/LocationLandingContent";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/locations/structured-data";
import type { AppPageProps } from "@/types";

export const dynamic = "force-dynamic";

const LISTING_LIMIT = 9;

export async function generateMetadata(props: AppPageProps): Promise<Metadata> {
  const { location: slug } = await props.params;
  const location = await getLocationBySlug(slug);
  if (!location) return {};
  const stats = await fetchCityStats(location.name);
  return buildLocationMetadata(location, stats);
}

export default async function LocationLandingPage(props: AppPageProps) {
  const { location: slug } = await props.params;
  const location = await getLocationBySlug(slug);
  if (!location) notFound();

  const [stats, nearby, childLocations, localities, user] = await Promise.all([
    fetchCityStats(location.name),
    getNearbyLocations(location),
    getChildLocations(location.slug),
    getLocalitiesForCity(location.name),
    getAuthUser(),
  ]);
  const favoriteIds = user ? await fetchFavoriteIds(user.id) : [];

  const result = await fetchPublicProperties({
    cityVariants: [location.name, location.name.toLowerCase()],
    page: 1,
    pageSize: LISTING_LIMIT,
    sort: "newest",
  });

  const areas = Array.from(
    new Set([...(location.areas ?? []), ...localities.map((l) => l.locality)])
  );

  return (
    <Container className="py-6 sm:py-8">
      <LocationBreadcrumbs items={[{ label: location.name }]} />
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {locationPageTitle(location)}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Search rooms, PGs, flats, houses and shops for rent and sale in {location.name}.
        {stats.total > 0
          ? ` ${stats.total} verified listing${stats.total === 1 ? "" : "s"} available right now.`
          : " New listings are added by owners every day."}
      </p>

      <div className="mt-8">
        <LocationLandingContent
          location={location}
          stats={stats}
          listings={result.properties}
          total={result.count}
          favoriteIds={favoriteIds}
          isLoggedIn={Boolean(user)}
          nearby={nearby}
          childLocations={childLocations}
          areas={areas}
        />
      </div>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteUrl() },
          { name: `${location.name} properties`, url: `${siteUrl()}${locationPath(location.slug)}` },
        ])}
      />
    </Container>
  );
}