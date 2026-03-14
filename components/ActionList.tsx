"use client";

import { useEffect, useState } from "react";
import ActionCard from "./ActionCard";
import type { ThreadAction } from "@/lib/store";
import { normalizeAction, type ReviewAction } from "@/lib/review";

interface ActionListProps {
  onOpenThread?: (action: ReviewAction) => void;
}

export default function ActionList({ onOpenThread }: ActionListProps) {
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

  if (actions.length === 0) {
    return (
      <p className="py-8 text-center text-slate-400">
        No threads analyzed yet. Use <strong>/momentum</strong> in Slack to get started.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {actions.map((action) => (
        <ActionCard
          key={action.id}
          action={action}
          onOpen={onOpenThread ? () => onOpenThread(normalizeAction(action)) : undefined}
        />
      ))}
    </div>
  );
}
