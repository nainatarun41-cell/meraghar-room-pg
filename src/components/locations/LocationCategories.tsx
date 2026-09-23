import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LOCATION_CATEGORIES, type LocationCategory } from "@/lib/locations/catalog";
import { categoryPath } from "@/lib/locations";
import { categoryPageTitle } from "@/lib/locations/seo";
import type { LocationStats } from "@/lib/locations/seo";
import type { LocationRow } from "@/types";

/** Number of approved listings a category maps to, computed from real stats. */
function categoryCount(category: LocationCategory, stats: LocationStats): number {
  if (category.slug === "properties-for-rent") return stats.rent;
  if (category.slug === "properties-for-sale") return stats.sale;
  if (!category.type) return 0;
  return Object.entries(stats.byType)
    .filter(([key]) => key === category.type)
    .reduce((sum, [, value]) => sum + value, 0);
}

export function LocationCategories({ location, stats }: { location: LocationRow; stats: LocationStats }) {
  return (
    <section aria-labelledby="location-categories">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="location-categories" className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Popular searches in {location.name}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {LOCATION_CATEGORIES.map((category) => {
          const count = categoryCount(category, stats);
          return (
            <Link
              key={category.slug}
              href={categoryPath(location.slug, category.slug)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:border-teal-300 hover:shadow-md"
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{categoryPageTitle(category, location)}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {count > 0 ? `${count} listing${count === 1 ? "" : "s"}` : "Explore"}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}