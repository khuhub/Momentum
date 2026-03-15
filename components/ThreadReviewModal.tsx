"use client";

import { useEffect, useMemo, useState } from "react";
import ActionCard from "@/components/ActionCard";
import StatusBadge from "@/components/StatusBadge";
import type { ReviewAction, ReviewActionItem } from "@/lib/review";

interface ThreadReviewModalProps {
  action: ReviewAction;
  onClose: () => void;
}

type TabKey = "summary" | "items" | "drafts";

function Avatar({ label }: { label: string }) {
  const initials = label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-900/70 text-[10px] font-semibold text-emerald-100">
      {initials}
    </div>
  );
}


export default function ThreadReviewModal({ action, onClose }: ThreadReviewModalProps) {
  const [current, setCurrent] = useState<ReviewAction>(action);
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [actionItems, setActionItems] = useState<ReviewActionItem[]>(action.actionItems ?? []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleItemStatus(index: number, status: "approved" | "rejected") {
    await fetch("/api/action/item-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId: current.id, itemIndex: index, status }),
    });
    setActionItems((prev) => prev.map((item, i) => (i === index ? { ...item, status } : item)));
  }

  async function handleResolve() {
    await fetch("/api/action/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId: current.id }),
    });
    setCurrent((prev) => ({ ...prev, status: "resolved" }));
  }

  const openQuestionCount = current.openQuestions.length;
  const decisionCount = current.decision.trim() ? 1 : 0;
  const suggestedStepCount = current.suggestedNextStep.trim() ? 1 : 0;

  const displayQuestions = useMemo(
    () => (current.openQuestions.length > 0 ? current.openQuestions : ["No open questions in this thread."]),
    [current.openQuestions]
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative mx-auto h-[96vh] w-full max-w-[1320px] overflow-hidden rounded-3xl border border-emerald-900/70 bg-[#03110b] shadow-[0_0_80px_rgba(16,185,129,0.14)]">
        {/* Close button — top right */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg border border-emerald-700 bg-[#03110b] px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-900/40"
        >
          Close ✕
        </button>

        <div className="grid h-full grid-cols-1 md:grid-cols-[340px_1fr]">
          {/* Thread detail column */}
          <section className="overflow-y-auto border-r border-emerald-900/60 bg-[#04140e]">
            <div className="border-b border-emerald-900/60 p-5">
              <p className="text-2xl font-semibold text-emerald-50">#{current.channelName}</p>
              <div className="mt-3 flex items-center gap-2">
                <Avatar label={current.requestedBy} />
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    current.status === "suggested"
                      ? "bg-amber-500/15 text-amber-200"
                      : current.status === "approved"
                        ? "bg-emerald-500/15 text-emerald-200"
                        : current.status === "posted"
                          ? "bg-cyan-500/15 text-cyan-200"
                          : current.status === "resolved"
                            ? "bg-slate-500/15 text-slate-300"
                            : "bg-rose-500/15 text-rose-200"
                  }`}
                >
                  {current.status.toUpperCase()}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-emerald-50">{current.threadTitle}</h2>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex gap-3">
                <Avatar label={current.requestedBy} />
                <div>
                  <p className="text-sm font-semibold text-emerald-100">{current.requestedBy}</p>
                  <p className="text-sm text-emerald-200/80">{current.summary}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Avatar label="Decision" />
                <div>
                  <p className="text-sm font-semibold text-emerald-100">Decision</p>
                  <p className="text-sm text-emerald-200/80">{current.decision}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Analysis panel */}
          <section className="bg-[#03130c]">
            <div className="h-[96vh] overflow-y-auto p-5 pb-10">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pr-24">
                <h3 className="text-3xl font-semibold tracking-tight text-emerald-50">
                  {current.threadTitle}
                </h3>
                <div className="flex items-center gap-2">
                  <StatusBadge status={current.status} />
                  <button
                    onClick={handleResolve}
                    disabled={current.status === "resolved"}
                    className="rounded-xl border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-900/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {current.status === "resolved" ? "Resolved" : "Mark Thread Resolved"}
                  </button>
                </div>
              </div>

              <div className="mb-5 flex items-center gap-6 border-b border-emerald-900/60 text-base font-medium text-emerald-200/70">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`pb-2 ${activeTab === "summary" ? "border-b-4 border-emerald-400 text-emerald-200" : ""}`}
                >
                  AI Summary
                </button>
                <button
                  onClick={() => setActiveTab("items")}
                  className={`pb-2 ${activeTab === "items" ? "border-b-4 border-emerald-400 text-emerald-200" : ""}`}
                >
                  Action Items
                </button>
                <button
                  onClick={() => setActiveTab("drafts")}
                  className={`pb-2 ${activeTab === "drafts" ? "border-b-4 border-emerald-400 text-emerald-200" : ""}`}
                >
                  Draft Replies
                </button>
              </div>

              {activeTab === "summary" ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                  <article className="rounded-2xl border border-emerald-900/60 bg-[#06170f] p-4">
                    <p className="text-sm font-semibold text-emerald-100">Decisions Made</p>
                    <p className="mt-1 text-5xl font-semibold text-emerald-300">{decisionCount}</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-emerald-100/85">
                      <li>{current.decision}</li>
                    </ul>
                  </article>
                  <article className="rounded-2xl border border-emerald-900/60 bg-[#06170f] p-4">
                    <p className="text-sm font-semibold text-emerald-100">Open Questions</p>
                    <p className="mt-1 text-5xl font-semibold text-emerald-300">{openQuestionCount}</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-emerald-100/85">
                      {displayQuestions.map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ul>
                  </article>
                  <article className="rounded-2xl border border-emerald-900/60 bg-[#06170f] p-4">
                    <p className="text-sm font-semibold text-emerald-100">Suggested Next Step</p>
                    <p className="mt-1 text-5xl font-semibold text-emerald-300">{suggestedStepCount}</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-emerald-100/85">
                      <li>{current.suggestedNextStep}</li>
                    </ul>
                  </article>
                </div>
              ) : null}

              {activeTab === "items" ? (
                actionItems.length === 0 ? (
                  <p className="py-8 text-center text-sm text-emerald-200/50">No action items identified in this thread.</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-emerald-900/60">
                    <table className="w-full table-auto border-collapse text-left">
                      <thead className="bg-emerald-950/40 text-sm text-emerald-100">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Task</th>
                          <th className="px-4 py-3 font-semibold">Assignee</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actionItems.map((item, i) => (
                          <tr key={i} className="border-t border-emerald-900/60">
                            <td className="px-4 py-3 text-sm text-emerald-100">{item.task}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar label={item.assignee} />
                                <span className="text-xs text-emerald-200/70">{item.assignee}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                item.status === "approved" ? "bg-emerald-500/15 text-emerald-200" :
                                item.status === "rejected" ? "bg-rose-500/15 text-rose-200" :
                                "bg-amber-500/15 text-amber-200"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleItemStatus(i, "approved")}
                                  disabled={item.status === "approved"}
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleItemStatus(i, "rejected")}
                                  disabled={item.status === "rejected"}
                                  className="rounded-lg border border-emerald-700 px-3 py-1.5 text-xs font-semibold text-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : null}

              {activeTab === "drafts" ? (
                <div className="space-y-4">
                  <ActionCard
                    actionId={current.id}
                    draftType="draftReply"
                    label="Draft Reply"
                    initialText={current.draftReply}
                    status={current.status}
                  />
                  <ActionCard
                    actionId={current.id}
                    draftType="draftSummary"
                    label="Post Summary"
                    initialText={current.draftSummary}
                    status={current.status}
                  />
                  <ActionCard
                    actionId={current.id}
                    draftType="draftMeeting"
                    label="Suggest Meeting"
                    initialText={current.draftMeeting}
                    status={current.status}
                  />
                  <ActionCard
                    actionId={current.id}
                    draftType="draftMeetingInvite"
                    label="Meeting Invite"
                    initialText={current.draftMeetingInvite}
                    status={current.status}
                  />
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
