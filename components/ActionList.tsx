"use client";

import { useEffect, useState } from "react";
import ActionCard from "./ActionCard";
import type { ThreadAction } from "@/lib/store";
import { normalizeAction, type ReviewAction } from "@/lib/review";

interface ActionListProps {
  onOpenThread?: (action: ReviewAction) => void;
  filter: "queue" | "resolved";
}

const QUEUE_STATUSES = ["suggested", "approved"];
const RESOLVED_STATUSES = ["posted", "rejected", "resolved"];

export default function ActionList({ onOpenThread, filter }: ActionListProps) {
  const [actions, setActions] = useState<ThreadAction[]>([]);

  useEffect(() => {
    async function fetchActions() {
      const res = await fetch("/api/actions");
      const data = await res.json();
      setActions(data);
    }
    fetchActions();
    const interval = setInterval(fetchActions, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = actions.filter((a) =>
    filter === "queue" ? QUEUE_STATUSES.includes(a.status) : RESOLVED_STATUSES.includes(a.status)
  );

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-slate-400">
        {filter === "queue"
          ? <>No threads in the queue. Use <strong>/momentum</strong> in Slack to get started.</>
          : "No resolved threads yet."}
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {filtered.map((action) => (
        <ActionCard
          key={action.id}
          action={action}
          onOpen={onOpenThread ? () => onOpenThread(normalizeAction(action)) : undefined}
        />
      ))}
    </div>
  );
}
