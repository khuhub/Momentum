"use client";

import Link from "next/link";
import type { Action } from "@/lib/store";

const statusColors: Record<string, string> = {
  suggested: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  posted: "bg-blue-100 text-blue-800",
};

export default function ActionCard({ action }: { action: Action }) {
  const preview =
    action.actionType === "draft_email"
      ? `Email to ${action.recipient}: ${action.subject}`
      : `Task: ${action.title}`;

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold capitalize">
          {action.actionType.replace("_", " ")}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[action.status]}`}>
          {action.status}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-3">{preview}</p>
      <Link
        href={`/action/${action.id}`}
        className="text-blue-600 text-sm hover:underline"
      >
        View Details
      </Link>
    </div>
  );
}
