"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { useToast } from "@/components/Toast";
import {
  adminDeleteLocation,
  adminUpsertLocation,
  type LocationInput,
} from "@/lib/actions/admin";
import type { LocationRow } from "@/types";
import { cn } from "@/lib/utils";
import { LOCATION_CATEGORIES } from "@/lib/locations/catalog";

const TYPES: LocationRow["type"][] = ["city", "town", "area"];

function autoSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['".,!?;:()\[\]{}]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function AdminLocations({ rows }: { rows: LocationRow[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [state, setState] = useState("Haryana");
  const [country, setCountry] = useState("India");
  const [type, setType] = useState<LocationRow["type"]>("city");
  const [parentSlug, setParentSlug] = useState("");
  const [nearby, setNearby] = useState("");
  const [areas, setAreas] = useState("");
  const [isActive, setIsActive] = useState(true);

  const currentSlug = slugTouched ? slug : autoSlug(name);

  function startEdit(row: LocationRow) {
    setEditingId(row.id);
    setName(row.name);
    setSlug(row.slug);
    setSlugTouched(true);
    setState(row.state);
    setCountry(row.country);
    setType(row.type);
    setParentSlug(row.parent_slug ?? "");
    setNearby((row.nearby ?? []).join(", "));
    setAreas((row.areas ?? []).join(", "));
    setIsActive(row.is_active);
  }

  function reset() {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setState("Haryana");
    setCountry("India");
    setType("city");
    setParentSlug("");
    setNearby("");
    setAreas("");
    setIsActive(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input: LocationInput = {
      id: editingId ?? undefined,
      name,
      slug: slugTouched ? slug : undefined,
      state,
      country,
      type,
      parentSlug: parentSlug || undefined,
      nearby,
      areas,
      isActive,
    };
    startTransition(async () => {
      const res = await adminUpsertLocation(input);
      if (res.ok) {
        toast(editingId ? "Location updated" : "Location added", "success");
        reset();
        router.refresh();
      } else toast(res.error ?? "Save failed", "error");
    });
  }

  function remove(row: LocationRow) {
    startTransition(async () => {
      const res = await adminDeleteLocation(row.id);
      if (res.ok) {
        toast("Location deleted", "success");
        if (editingId === row.id) reset();
        router.refresh();
      } else toast(res.error ?? "Delete failed", "error");
    });
  }

  const grouped = useMemo(() => {
    const cities = rows.filter((r) => r.type === "city");
    const towns = rows.filter((r) => r.type === "town");
    const areas = rows.filter((r) => r.type === "area");
    return { cities, towns, areas };
  }, [rows]);

  const fieldCls =
    "rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-slate-900">{editingId ? `Edit location` : "Add new location"}</h3>
        <p className="-mt-2 text-xs text-slate-500">
          Add a city/town and its SEO pages (<span className="font-medium">/kaithal</span>, <span className="font-medium">/kaithal/pg</span>…) plus sitemap entries are generated automatically.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <Input value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(autoSlug(e.target.value)); }} placeholder="e.g. Kaithal" required />
          </Field>
          <Field label="Slug">
            <Input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} placeholder="kaithal" required />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="State">
            <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Haryana" required />
          </Field>
          <Field label="Country">
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" />
          </Field>
        </div>

        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as LocationRow["type"])} className={cn(fieldCls, "h-10 w-full")}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </Field>

        <Field label="Parent slug (for areas, e.g. its city slug)" hint="Leave empty for cities/towns.">
          <Input value={parentSlug} onChange={(e) => setParentSlug(e.target.value)} placeholder="kaithal" />
        </Field>

        <Field label="Nearby location slugs" hint="Comma separated, e.g. pundri, kurukshetra">
          <Input value={nearby} onChange={(e) => setNearby(e.target.value)} placeholder="pundri, kurukshetra, karnal" />
        </Field>

        <Field label="Popular areas" hint="Comma separated display names, e.g. City Centre, Pehowa Road">
          <Input value={areas} onChange={(e) => setAreas(e.target.value)} placeholder="City Centre, Pehowa Road" />
        </Field>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
          Active (visible on the website)
        </label>

        {name && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Public URLs: <code className="font-semibold text-teal-700">/{currentSlug}</code> and{" "}
            <code className="font-semibold text-teal-700">/{currentSlug}/pg</code> etc.
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" loading={pending} className="flex-1">
            {editingId ? <Save className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
            {editingId ? "Save changes" : "Add location"}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={reset} disabled={pending}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-6">
        {(["cities", "towns", "areas"] as const).map((group) => {
          const list = grouped[group];
          if (list.length === 0) return null;
          return (
            <div key={group} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 font-bold capitalize text-slate-900">{group}</h3>
              <div className="space-y-2">
                {list.map((row) => {
                  const active = editingId === row.id;
                  return (
                    <div
                      key={row.id}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
                        active ? "border-teal-400 bg-teal-50/60" : "border-slate-200 bg-white"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                          {row.name}
                          <span className="text-xs font-normal text-slate-400">({row.state})</span>
                          {!row.is_active && (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">Inactive</span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          <span className="font-mono text-teal-700">/{row.slug}</span>
                          {(row.areas?.length || 0) > 0 && (
                            <span> · {row.areas.length} areas</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`/${row.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-600"
                          title="Open public page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          disabled={pending && active}
                          onClick={() => (active ? reset() : startEdit(row))}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-600 disabled:opacity-40"
                          aria-label={`Edit ${row.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => remove(row)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-40"
                          aria-label={`Delete ${row.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 font-bold text-slate-900">Auto-generated category pages</h3>
          <p className="mb-3 text-xs text-slate-500">
            These SEO pages appear under every location automatically (only with real listings in the sitemap).
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LOCATION_CATEGORIES.map((c) => (
              <span key={c.slug} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                /&#8203;{c.slug}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}