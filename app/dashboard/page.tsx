"use client";

import { useState } from "react";
import ActionList from "@/components/ActionList";
import MomentumLogo from "@/components/MomentumLogo";
import ThreadReviewModal from "@/components/ThreadReviewModal";
import type { ReviewAction } from "@/lib/review";

export default function DashboardPage() {
  const [selectedAction, setSelectedAction] = useState<ReviewAction | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  async function handleSeed() {
    setSeeding(true);
    setSeedError(null);
    try {
      await fetch("/api/action/dev-seed", { method: "POST" });
    } catch {
      setSeedError("Failed to create test thread.");
    } finally {
      setSeeding(false);
    }
  }

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
            <h1 className="mt-2 text-xl font-semibold text-slate-100">Catch-Up Queue</h1>
            <p className="mt-2 text-sm text-slate-300/80">
              Review AI analysis, approve drafts, and post directly into Slack threads.
            </p>
          </aside>

          <section className="rounded-2xl border border-slate-700 bg-[#0d141d] p-4 shadow-lg md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Recent Threads</h2>
                <p className="text-sm text-slate-300/75">Click a thread to open the analysis console popup.</p>
              </div>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="rounded-lg border border-emerald-700 bg-emerald-700/20 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-700/35 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {seeding ? "Creating..." : "Create Test Thread"}
              </button>
            </div>
            {seedError ? <p className="mb-3 text-xs text-rose-300">{seedError}</p> : null}
            <ActionList onOpenThread={setSelectedAction} />
          </section>
        </div>
      </main>

      {selectedAction ? (
        <ThreadReviewModal action={selectedAction} onClose={() => setSelectedAction(null)} />
      ) : null}
    </>
  );
}
