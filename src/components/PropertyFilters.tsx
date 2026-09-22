"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { ChevronDown, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BHK_OPTIONS,
  FURNISHING_OPTIONS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  SORT_OPTIONS,
} from "@/lib/constants";

interface FilterProps {
  cities: string[];
  localities: { id: string; city: string; locality: string }[];
}

export function PropertyFilters({ cities, localities }: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [listView, setListView] = useState(() => (searchParams.get("view") === "list" ? true : false));

  const city = searchParams.get("city") ?? "";
  const locality = searchParams.get("locality") ?? "";
  const purpose = searchParams.get("purpose") ?? "";
  const type = searchParams.get("type") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const bhk = searchParams.get("bhk") ?? "";
  const furnishing = searchParams.get("furnishing") ?? "";
  const available = searchParams.get("available") === "1";
  const verified = searchParams.get("verified") === "1";
  const sort = searchParams.get("sort") ?? "newest";

  const cityLocalities = useMemo(
    () => localities.filter((l) => !city || l.city === city),
    [localities, city]
  );

  const updateParams = useCallback(
    (changes: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (!value || value === "") params.delete(key);
        else params.set(key, value);
      }
      if (resetPage) params.set("page", "1");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  function toggleList() {
    const next = !listView;
    setListView(next);
    updateParams({ view: next ? "list" : null });
  }

  const hasActiveFilters =
    city || locality || purpose || type || minPrice || maxPrice || bhk || furnishing || available || verified;

  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  const selectCls =
    "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

  const filtersBody = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">City</span>
          <select value={city} onChange={(e) => updateParams({ city: e.target.value })} className={selectCls}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Locality</span>
          <select value={locality} onChange={(e) => updateParams({ locality: e.target.value })} className={selectCls}>
            <option value="">All areas</option>
            {cityLocalities.map((l) => (
              <option key={l.id} value={l.locality}>{l.locality}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Purpose</span>
          <select value={purpose} onChange={(e) => updateParams({ purpose: e.target.value })} className={selectCls}>
            <option value="">Rent / Sale</option>
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Property type</span>
          <select value={type} onChange={(e) => updateParams({ type: e.target.value })} className={selectCls}>
            <option value="">All types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Min price (₹)</span>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => updateParams({ minPrice: e.target.value || null })}
            placeholder="0"
            className={selectCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Max price (₹)</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => updateParams({ maxPrice: e.target.value || null })}
            placeholder="Any"
            className={selectCls}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setShowAllFilters((v) => !v)}
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", showAllFilters && "rotate-180")} />
        More filters
      </button>

      {showAllFilters && (
        <div className="space-y-4 pt-1">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">BHK</span>
            <div className="flex flex-wrap gap-2">
              {BHK_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => updateParams({ bhk: bhk === o.value ? null : o.value })}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    bhk === o.value
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:border-teal-400"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Furnishing</span>
            <div className="flex flex-wrap gap-2">
              {FURNISHING_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => updateParams({ furnishing: furnishing === o.value ? null : o.value })}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    furnishing === o.value
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:border-teal-400"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </label>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => updateParams({ available: e.target.checked ? "1" : null })}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              Available immediately
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => updateParams({ verified: e.target.checked ? "1" : null })}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              Verified owner only
            </label>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-teal-400 hover:text-teal-700 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && <span className="rounded-full bg-teal-600 px-1.5 text-xs text-white">{countActive()}</span>}
        </button>
        <div className="hidden items-center gap-1 rounded-lg border border-slate-300 bg-white p-1 lg:inline-flex">
          {(["grid", "list"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => {
                if (view === "list" && !listView) toggleList();
                if (view === "grid" && listView) toggleList();
              }}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium",
                (view === "list" ? listView : !listView)
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {view === "grid" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              {view}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Sort</span>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
    </div>
  );

  return (
    <>
      <div>{toolbar}</div>

      {/* Desktop full-width filter panel (visible, applies instantly) */}
      <div className="mt-4 hidden rounded-2xl border border-slate-200 bg-white p-4 lg:block">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">Filters</h3>
        {filtersBody}
      </div>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[55] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Filters</h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filtersBody}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="mt-5 h-11 w-full rounded-lg bg-teal-600 text-sm font-semibold text-white"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );

  function countActive() {
    return [city, locality, purpose, type, minPrice, maxPrice, bhk, furnishing, available, verified].filter(Boolean).length;
  }
}