"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { adminAddLocality, adminDeleteLocality } from "@/lib/actions/admin";

type LocalityRowLite = { id: string; city: string; locality: string };

export function AdminLocalities({ rows }: { rows: LocalityRowLite[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [pending, startTransition] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await adminAddLocality(city, locality);
      if (res.ok) {
        toast("Locality added", "success");
        setCity("");
        setLocality("");
        router.refresh();
      } else toast(res.error ?? "Add failed", "error");
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await adminDeleteLocality(id);
      if (res.ok) { toast("Locality removed", "success"); router.refresh(); }
      else toast(res.error ?? "Remove failed", "error");
    });
  }

  const grouped = rows.reduce<Record<string, string[]>>((acc, r) => {
    (acc[r.city] ??= []).push(r.locality);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <form onSubmit={add} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-bold text-slate-900">Add locality</h3>
        <Field label="City">
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Kaithal" required />
        </Field>
        <Field label="Locality / area">
          <Input value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="e.g. Bus Stand" required />
        </Field>
        <Button type="submit" loading={pending} className="w-full">
          <Plus className="mr-1 h-4 w-4" /> Add locality
        </Button>
      </form>

      <div className="space-y-4">
        {Object.entries(grouped).map(([c, list]) => (
          <div key={c} className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-bold capitalize text-slate-900">{c}</h3>
            <div className="flex flex-wrap gap-2">
              {list.map((l) => {
                const row = rows.find((r) => r.city === c && r.locality === l)!;
                return (
                  <span key={row.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {l}
                    <button disabled={pending} onClick={() => remove(row.id)} className="text-slate-400 hover:text-red-600" aria-label={`Remove ${l}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No localities yet. Add your first one.
          </p>
        )}
      </div>
    </div>
  );
}