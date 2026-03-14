"use client";

import Link from "next/link";
import type { ThreadAction } from "@/lib/store";

const statusColors: Record<string, string> = {
  suggested: "bg-amber-500/15 text-amber-200 border-amber-500/40",
  approved: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
  rejected: "bg-rose-500/15 text-rose-200 border-rose-500/40",
  posted: "bg-cyan-500/15 text-cyan-200 border-cyan-500/40",
};

export default function ActionCard({ action }: { action: ThreadAction }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#111a24] p-4 shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Requested by <span className="font-medium text-slate-200">{action.requestedBy}</span>
        </p>
        <span
          className={`rounded-full border px-2 py-1 text-xs ${statusColors[action.status]}`}
        >
          {action.status}
        </span>
      </div>
      <p className="mb-1 line-clamp-2 text-sm text-slate-200">{action.summary}</p>
      {action.needResponse && <p className="mb-2 text-xs text-rose-300">Response needed</p>}
      {action.openQuestions.length > 0 && (
        <p className="mb-3 text-xs text-slate-400">
          {action.openQuestions.length} open question{action.openQuestions.length !== 1 ? "s" : ""}
        </p>
      )}
      <Link href={`/action/${action.id}`} className="text-sm text-emerald-300 hover:underline">
        View Details →
      </Link>
    </div>
  );
}
