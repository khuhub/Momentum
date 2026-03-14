"use client";

import { useEffect, useMemo, useState } from "react";
import ActionCard from "@/components/ActionCard";
import MomentumLogo from "@/components/MomentumLogo";
import StatusBadge from "@/components/StatusBadge";
import type { ReviewAction } from "@/lib/review";

interface ThreadReviewModalProps {
  action: ReviewAction;
  onClose: () => void;
}

type TabKey = "summary" | "items" | "drafts";
type ItemStatus = "pending" | "approved" | "rejected" | "suggested";

function Avatar({ label }: { label: string }) {
  const initials = label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/70 text-[10px] font-semibold text-emerald-100">
      {initials}
    </div>
  );
}

function ItemStatusPill({ status }: { status: ItemStatus }) {
  const classes: Record<ItemStatus, string> = {
    pending: "bg-amber-500/15 text-amber-200",
    approved: "bg-emerald-500/15 text-emerald-200",
    rejected: "bg-rose-500/15 text-rose-200",
    suggested: "bg-sky-500/15 text-sky-200",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes[status]}`}>
      {status}
    </span>
  );
}

export default function ThreadReviewModal({ action, onClose }: ThreadReviewModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [itemOne, setItemOne] = useState<ItemStatus>("pending");
  const [itemTwo, setItemTwo] = useState<ItemStatus>("suggested");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const openQuestionCount = action.openQuestions.length;
  const decisionCount = action.decision.trim() ? 1 : 0;
  const suggestedStepCount = action.suggestedNextStep.trim() ? 1 : 0;

  const displayQuestions = useMemo(
    () => (action.openQuestions.length > 0 ? action.openQuestions : ["No open questions in this thread."]),
    [action.openQuestions]
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm">
      <div className="mx-auto h-[96vh] w-full max-w-[1320px] overflow-hidden rounded-3xl border border-emerald-900/70 bg-[#03110b] shadow-[0_0_80px_rgba(16,185,129,0.14)]">
        <div className="grid h-full grid-cols-1 md:grid-cols-[250px_340px_1fr]">
          <aside className="flex flex-col border-r border-emerald-900/60 bg-[#051710] p-4">
            <MomentumLogo
              className="px-2 py-1"
              iconClassName="h-9 w-11"
              textClassName="text-3xl font-semibold text-emerald-50"
            />
            <nav className="mt-6 space-y-2">
              <button className="w-full rounded-xl bg-emerald-500/20 px-3 py-2 text-left text-sm font-semibold text-emerald-100">
                Review Queue
              </button>
              <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-emerald-200/75">
                Resolved Threads
              </button>
            </nav>
            <button className="mt-auto rounded-xl px-3 py-2 text-left text-sm text-emerald-200/75">Settings</button>
          </aside>

          <section className="border-r border-emerald-900/60 bg-[#04140e] overflow-y-auto">
            <div className="border-b border-emerald-900/60 p-4">
              <p className="text-4xl leading-none text-emerald-100">#</p>
            </div>

            <div className="border-b border-emerald-900/60 p-5">
              <p className="text-3xl font-semibold text-emerald-50">#engineering-ops</p>
              <div className="mt-4 flex items-center gap-2">
                <Avatar label="W" />
                <Avatar label="D" />
                <Avatar label="Y" />
                <span className="rounded-full bg-emerald-900/70 px-2 py-1 text-xs font-medium text-emerald-100">+12</span>
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-200">
                  PENDING REVIEW
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-emerald-50">{action.threadTitle}</h2>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex gap-3">
                <Avatar label="Wonpil" />
                <div>
                  <p className="text-sm font-semibold text-emerald-100">Wonpil</p>
                  <p className="text-sm text-emerald-200/80">{action.summary}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Avatar label="Dowooon" />
                <div>
                  <p className="text-sm font-semibold text-emerald-100">Dowooon</p>
                  <p className="text-sm text-emerald-200/80">{action.decision}</p>
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-emerald-800 p-4 text-center text-sm text-emerald-300/70">
                AI analysis run here
              </div>
            </div>
          </section>

          <section className="flex h-full flex-col bg-[#03130c]">
            <header className="flex items-center gap-3 border-b border-emerald-900/60 p-3">
              <input
                placeholder="Search or type a command..."
                className="h-11 flex-1 rounded-xl border border-emerald-800 bg-[#051a12] px-4 text-sm text-emerald-200/80"
                aria-label="Search"
              />
              <Avatar label="U" />
              <button
                onClick={onClose}
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-semibold text-emerald-100"
              >
                Close
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="mb-3 flex items-center gap-2 text-sm text-emerald-200/70">
                <span>Active Projects</span>
                <span>&gt;</span>
                <span>{action.threadTitle}</span>
              </div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-4xl font-semibold tracking-tight text-emerald-50">
                  Thread Analysis: {action.threadTitle}
                </h3>
                <div className="flex items-center gap-2">
                  <StatusBadge status={action.status} />
                  <button className="rounded-xl border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-100">
                    Mark Thread Resolved
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
                      <li>{action.decision}</li>
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
                      <li>{action.suggestedNextStep}</li>
                    </ul>
                  </article>
                </div>
              ) : null}

              {activeTab === "items" ? (
                <div className="overflow-hidden rounded-2xl border border-emerald-900/60">
                  <table className="w-full table-auto border-collapse text-left">
                    <thead className="bg-emerald-950/40 text-sm text-emerald-100">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Review Item</th>
                        <th className="px-4 py-3 font-semibold">Assigned To</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-emerald-900/60">
                        <td className="px-4 py-3 text-sm text-emerald-100">{action.suggestedNextStep}</td>
                        <td className="px-4 py-3">
                          <Avatar label="Team" />
                        </td>
                        <td className="px-4 py-3">
                          <ItemStatusPill status={itemOne} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setItemOne("approved")}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setItemOne("rejected")}
                              className="rounded-lg border border-emerald-700 px-3 py-1.5 text-xs font-semibold text-emerald-100"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t border-emerald-900/60">
                        <td className="px-4 py-3 text-sm text-emerald-100">Post status to channel (Draft)</td>
                        <td className="px-4 py-3">
                          <Avatar label="Team" />
                        </td>
                        <td className="px-4 py-3">
                          <ItemStatusPill status={itemTwo} />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setItemTwo("approved")}
                            className="rounded-lg border border-emerald-700 px-3 py-1.5 text-xs font-semibold text-emerald-100"
                          >
                            Review Draft Reply
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}

              {activeTab === "drafts" ? (
                <div className="space-y-4">
                  <ActionCard
                    actionId={action.id}
                    draftType="draftReply"
                    label="Draft Reply"
                    initialText={action.draftReply}
                    status={action.status}
                  />
                  <ActionCard
                    actionId={action.id}
                    draftType="draftSummary"
                    label="Post Summary"
                    initialText={action.draftSummary}
                    status={action.status}
                  />
                  <ActionCard
                    actionId={action.id}
                    draftType="draftMeeting"
                    label="Suggest Meeting"
                    initialText={action.draftMeeting}
                    status={action.status}
                  />
                  <ActionCard
                    actionId={action.id}
                    draftType="draftMeetingInvite"
                    label="Meeting Invite"
                    initialText={action.draftMeetingInvite}
                    status={action.status}
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
