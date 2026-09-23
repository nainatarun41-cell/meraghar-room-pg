import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState } from "@/components/ui";
import type { PropertyListItem } from "@/types";

export function RecentListings({
  listings,
  total,
  seeAllHref,
  favoriteIds = [],
  isLoggedIn = false,
}: {
  listings: PropertyListItem[];
  total: number;
  seeAllHref: string;
  favoriteIds?: string[];
  isLoggedIn?: boolean;
}) {
  return (
    <section aria-labelledby="recent-listings">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="recent-listings" className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Latest listings
        </h2>
        {total > 0 && (
          <Link
            href={seeAllHref}
            className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            View all {total}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={<Home className="h-7 w-7" />}
          title="No listings added yet."
          description="Owners add new rooms, flats and houses every day. Check back soon or post your requirement and we will help you find owners."
          action={
            <Link href="/post-requirement" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              Post a requirement →
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((p) => (
            <PropertyCard key={p.id} property={p} saved={favoriteIds.includes(p.id)} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      )}
    </section>
  );
}