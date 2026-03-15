"use client";

import { useState } from "react";
import ActionList from "@/components/ActionList";
import MomentumLogo from "@/components/MomentumLogo";
import ThreadReviewModal from "@/components/ThreadReviewModal";
import type { ReviewAction } from "@/lib/review";

type NavTab = "queue" | "resolved";

export default function DashboardPage() {
  const [navTab, setNavTab] = useState<NavTab>("queue");
  const [selectedAction, setSelectedAction] = useState<ReviewAction | null>(null);

  return (
    <>
      <main className="min-h-screen w-full bg-[#020805]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-700 bg-[#0b1118] p-4 shadow-lg">
            <MomentumLogo
              className="items-center gap-2"
              iconClassName="h-8 w-10"
              textClassName="text-xl font-semibold text-slate-100"
            />
            <p className="mt-3 text-xs text-slate-400">
              Review AI analysis, approve drafts, and post directly into Slack threads.
            </p>
            <nav className="mt-4 space-y-1">
              <button
                onClick={() => setNavTab("queue")}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  navTab === "queue"
                    ? "bg-emerald-500/20 text-emerald-100"
                    : "text-slate-300/75 hover:bg-slate-700/40"
                }`}
              >
                Review Queue
              </button>
              <button
                onClick={() => setNavTab("resolved")}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  navTab === "resolved"
                    ? "bg-emerald-500/20 font-semibold text-emerald-100"
                    : "text-slate-300/75 hover:bg-slate-700/40"
                }`}
              >
                Resolved Threads
              </button>
            </nav>
          </aside>

          <section className="rounded-2xl border border-slate-700 bg-[#0d141d] p-4 shadow-lg md:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-100">
                {navTab === "queue" ? "Review Queue" : "Resolved Threads"}
              </h2>
              <p className="text-sm text-slate-300/75">Click a thread to open the analysis console.</p>
            </div>
            <ActionList filter={navTab} onOpenThread={setSelectedAction} />
          </section>
        </div>
      </main>

      {selectedAction ? (
        <ThreadReviewModal action={selectedAction} onClose={() => setSelectedAction(null)} />
      ) : null}
    </>
  );
}
