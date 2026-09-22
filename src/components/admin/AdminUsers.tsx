"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { adminToggleUserRole } from "@/lib/actions/admin";
import type { AdminUserRow } from "@/lib/admin-queries";

export function AdminUsersTable({ rows }: { rows: AdminUserRow[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle(id: string, role: string) {
    const next = role === "admin" ? "user" : "admin";
    startTransition(async () => {
      const res = await adminToggleUserRole(id, next as "user" | "admin");
      if (res.ok) { toast(`Role set to ${next}`, "success"); router.refresh(); }
      else toast(res.error ?? "Action failed", "error");
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm text-slate-600">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No users found.</td></tr>
          )}
          {rows.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{u.name || "—"}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </td>
              <td className="px-4 py-3">{u.phone || "—"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDate(u.created_at)}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === "admin" ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"}`}>
                  {u.role === "admin" && <ShieldCheck className="h-3.5 w-3.5" />}
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  disabled={pending}
                  onClick={() => toggle(u.id, u.role)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  {u.role === "admin" ? "Make user" : "Make admin"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}