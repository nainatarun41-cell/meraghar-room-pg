import { MapPin, User as UserIcon } from "lucide-react";
import { timeAgo, formatINR } from "@/lib/utils";
import { AdminContactCard } from "@/components/AdminContactCard";
import type { DashboardRequirement } from "@/lib/queries";

export function RequirementsBoard({
  requirements,
}: {
  requirements: DashboardRequirement[];
}) {
  if (requirements.length === 0) return <p className="text-sm text-slate-500">No requirements posted yet.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {requirements.map((r) => (
        <div key={r.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{r.title || "Property requirement"}</h3>
            <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800 capitalize">
              {r.status}
            </span>
          </div>

          <p className="mt-1.5 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {[r.city, r.locality].filter(Boolean).join(", ")}
          </p>
          {r.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.description}</p>}

          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500">
            <UserIcon className="h-3.5 w-3.5 text-slate-400" />
            Posted by a MeraGhar user
          </p>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Posted {timeAgo(r.created_at)}</span>
            {r.budget_min || r.budget_max ? (
              <span>
                {r.budget_min ? formatINR(r.budget_min) : "Any"} –{" "}
                {r.budget_max ? `${formatINR(r.budget_max)} max` : "No limit"}
              </span>
            ) : null}
          </div>

          <div className="mt-3">
            <AdminContactCard
              requirementId={r.id}
              subject={r.title || `${r.city} requirement`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}