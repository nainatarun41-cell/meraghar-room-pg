import Link from "next/link";
import { Building2, ChevronRight, Home as HomeIcon, Sofa } from "lucide-react";
import { LocationCategories } from "@/components/locations/LocationCategories";
import { RecentListings } from "@/components/locations/RecentListings";
import { LocationFaq } from "@/components/locations/LocationFaq";
import { areaPath, locationPath } from "@/lib/locations";
import type { LocationStats } from "@/lib/locations/seo";
import type { LocationRow, PropertyListItem } from "@/types";

export function LocationLandingContent({
  location,
  stats,
  listings,
  total,
  favoriteIds,
  isLoggedIn,
  nearby,
  childLocations,
  areas,
}: {
  location: LocationRow;
  stats: LocationStats;
  listings: PropertyListItem[];
  total: number;
  favoriteIds: string[];
  isLoggedIn: boolean;
  nearby: LocationRow[];
  childLocations: LocationRow[];
  areas: string[];
}) {
  const statChips = [
    { label: "Properties", value: stats.total, icon: Building2 },
    { label: "For rent", value: stats.rent, icon: HomeIcon },
    { label: "For sale", value: stats.sale, icon: Sofa },
  ];

  return (
    <div className="space-y-10">
      {/* Title + quick stats */}
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {statChips.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              <s.icon className="h-3.5 w-3.5" />
              {stats.total > 0 ? `${s.value} ${s.label}` : `0 ${s.label}`}
            </span>
          ))}
        </div>
      </div>

      {/* Category grid */}
      <LocationCategories location={location} stats={stats} />

      {/* Latest listings */}
      <RecentListings
        listings={listings}
        total={total}
        seeAllHref={`/properties?city=${encodeURIComponent(location.name)}`}
        favoriteIds={favoriteIds}
        isLoggedIn={isLoggedIn}
      />

      {/* Areas */}
      {areas.length > 0 && (
        <section aria-labelledby="areas-heading">
          <h2 id="areas-heading" className="mb-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Popular areas in {location.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {areas.slice(0, 18).map((area) => (
              <Link
                key={area}
                href={areaPath(location.slug, area)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-teal-300 hover:text-teal-700"
              >
                {area}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Child areas/cities */}
      {childLocations.length > 0 && (
        <section aria-labelledby="child-heading">
          <h2 id="child-heading" className="mb-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Nearby from {location.name}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {childLocations.map((child) => (
              <Link
                key={child.id}
                href={locationPath(child.slug)}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:border-teal-300 hover:shadow-md"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{child.name}</h3>
                  <p className="text-xs text-slate-500">{child.state}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nearby cities */}
      {nearby.length > 0 && (
        <section aria-labelledby="nearby-heading">
          <h2 id="nearby-heading" className="mb-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Nearby cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {nearby.map((n) => (
              <Link
                key={n.id}
                href={locationPath(n.slug)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-teal-300 hover:text-teal-700"
              >
                {n.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <LocationFaq location={location} areas={areas} />
    </div>
  );
}