"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { adminUpdateReportStatus } from "@/lib/actions/admin";
import type { AdminReportRow } from "@/lib/admin-queries";

export function AdminReportsTable({ rows }: { rows: AdminReportRow[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function update(id: string, status: string) {
    startTransition(async () => {
      const res = await adminUpdateReportStatus(id, status);
      if (res.ok) { toast(`Report ${status}`, "success"); router.refresh(); }
      else toast(res.error ?? "Action failed", "error");
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm text-slate-600">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Report</th>
            <th className="px-4 py-3">Property</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No reports.</td></tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800 capitalize">{r.reason.replace("_", " ")}</p>
                <p className="mt-0.5 text-xs text-slate-400">By {r.reporter_name} · {timeAgo(r.created_at)}</p>
              </td>
              <td className="px-4 py-3">
                <p className="line-clamp-1 text-sm font-medium text-slate-700">{r.property_title}</p>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.status === "open" ? "bg-red-50 text-red-700" : r.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {r.status === "open" && (
                  <div className="flex justify-end gap-1.5">
                    <button disabled={pending} onClick={() => update(r.id, "resolved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </button>
                    <button disabled={pending} onClick={() => update(r.id, "dismissed")} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50">
                      <XCircle className="h-3.5 w-3.5" /> Dismiss
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}