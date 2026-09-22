"use client";

import { useState, useTransition } from "react";
import { Flag, X } from "lucide-react";
import { createReport } from "@/lib/actions/report";
import { REPORT_REASONS } from "@/lib/constants";
import { useToast } from "@/components/Toast";

export function ReportModal({ propertyId }: { propertyId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!reason) {
      toast("Please select a reason.", "warning");
      return;
    }
    startTransition(async () => {
      const result = await createReport(propertyId, reason, details);
      if (result.ok) {
        toast("Thanks! This listing has been reported to our team.", "success");
        setOpen(false);
        setReason("");
        setDetails("");
      } else {
        toast(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-red-600"
      >
        <Flag className="h-4 w-4" />
        Report listing
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Report this listing</h3>
          <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium text-slate-700">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value="">Select a reason</option>
          {REPORT_REASONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label className="mb-1 mt-4 block text-sm font-medium text-slate-700">
          Additional details
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          placeholder="Optional - share more details"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
        />

        <div className="mt-5 flex gap-3">
          <button
            onClick={submit}
            disabled={pending}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            Submit report
          </button>
          <button
            onClick={() => setOpen(false)}
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}