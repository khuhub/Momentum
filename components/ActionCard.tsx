"use client";

import Link from "next/link";
import type { ThreadAction } from "@/lib/store";

const statusColors: Record<string, string> = {
  suggested: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  posted: "bg-blue-100 text-blue-800",
};

export default function ActionCard({ action }: { action: ThreadAction }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">
          Requested by <span className="font-medium">{action.requestedBy}</span>
        </p>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[action.status]}`}>
          {action.status}
        </span>
      </div>
      <p className="text-gray-800 text-sm mb-1 line-clamp-2">{action.summary}</p>
      {action.needResponse && (
        <p className="text-xs text-red-500 mb-2">⚠ Response needed</p>
      )}
      {action.openQuestions.length > 0 && (
        <p className="text-xs text-gray-400 mb-3">
          {action.openQuestions.length} open question{action.openQuestions.length !== 1 ? "s" : ""}
        </p>
      )}
      <Link
        href={`/action/${action.id}`}
        className="text-blue-600 text-sm hover:underline"
      >
        View Details →
      </Link>
    </div>
  );
}
