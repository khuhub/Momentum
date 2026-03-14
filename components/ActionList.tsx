"use client";

import { useEffect, useState } from "react";
import ActionCard from "./ActionCard";
import type { Action } from "@/lib/store";

export default function ActionList() {
  const [actions, setActions] = useState<Action[]>([]);

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
      <p className="text-gray-500 text-center py-8">
        No actions yet. Send a message in Slack to get started.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {actions.map((action) => (
        <ActionCard key={action.id} action={action} />
      ))}
    </div>
  );
}
