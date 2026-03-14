"use client";

import { useState } from "react";
import type { ThreadAction } from "@/lib/store";

const statusColors: Record<string, string> = {
  suggested: "bg-amber-500/15 text-amber-200 border-amber-500/40",
  approved: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
  rejected: "bg-rose-500/15 text-rose-200 border-rose-500/40",
  posted: "bg-cyan-500/15 text-cyan-200 border-cyan-500/40",
};

interface ActionCardProps {
  action?: ThreadAction;
  onOpen?: () => void;
  // Draft card props (used inside ThreadReviewModal)
  actionId?: string;
  draftType?: string;
  label?: string;
  initialText?: string;
  status?: string;
}

export default function ActionCard({ action, onOpen, actionId, draftType, label, initialText, status }: ActionCardProps) {
  // Draft card mode (used inside ThreadReviewModal)
  if (actionId && draftType && label !== undefined && initialText !== undefined) {
    return (
      <DraftCard
        actionId={actionId}
        draftType={draftType}
        label={label}
        initialText={initialText}
        status={status ?? "suggested"}
      />
    );
  }

  if (!action) return null;

  // Dashboard list card mode
  return (
    <div
      className="rounded-2xl border border-slate-700 bg-[#111a24] p-4 shadow-md cursor-pointer hover:border-emerald-700 transition"
      onClick={onOpen}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Requested by <span className="font-medium text-slate-200">{action.requestedBy}</span>
        </p>
        <span className={`rounded-full border px-2 py-1 text-xs ${statusColors[action.status]}`}>
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
      <p className="text-sm text-emerald-300">{onOpen ? "Click to review →" : ""}</p>
    </div>
  );
}

const draftStatusColors: Record<string, string> = {
  suggested: "bg-amber-500/15 text-amber-200",
  approved: "bg-emerald-500/15 text-emerald-200",
  rejected: "bg-rose-500/15 text-rose-200",
  posted: "bg-cyan-500/15 text-cyan-200",
};

function DraftCard({
  actionId,
  draftType,
  label,
  initialText,
  status: initialStatus,
}: {
  actionId: string;
  draftType: string;
  label: string;
  initialText: string;
  status: string;
}) {
  const [text, setText] = useState(initialText);
  const [status, setStatus] = useState(initialStatus);

  async function handleApprove() {
    await fetch("/api/action/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId, draftType, editedText: text }),
    });
    setStatus("approved");
  }

  async function handlePost() {
    await fetch("/api/action/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId, draftType }),
    });
    setStatus("posted");
  }

  async function handleNotion() {
    const res = await fetch("/api/action/notion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId }),
    });
    const { notionUrl } = await res.json();
    setStatus("approved");
    if (notionUrl) window.open(notionUrl, "_blank");
  }

  return (
    <div className="rounded-2xl border border-emerald-900/60 bg-[#06170f] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-emerald-100">{label}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${draftStatusColors[status] ?? ""}`}>
          {status}
        </span>
      </div>
      <textarea
        className="w-full resize-y rounded-xl border border-emerald-800 bg-[#051a12] p-3 text-sm text-emerald-200/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={status === "posted"}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={handleApprove}
          disabled={status === "approved" || status === "posted"}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition"
        >
          Approve
        </button>
        <button
          onClick={() => setStatus("rejected")}
          disabled={status === "posted"}
          className="rounded-lg border border-emerald-700 px-3 py-1.5 text-xs font-semibold text-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-900/40 transition"
        >
          Reject
        </button>
        <button
          onClick={handlePost}
          disabled={status !== "approved"}
          className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-800 transition"
        >
          Post to Slack
        </button>
        <button
          onClick={handleNotion}
          disabled={status === "posted"}
          className="rounded-lg bg-neutral-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition"
        >
          Create in Notion
        </button>
      </div>
    </div>
  );
}
