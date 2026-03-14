"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ThreadAction } from "@/lib/store";

const statusColors: Record<string, string> = {
  suggested: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  posted: "bg-blue-100 text-blue-800",
};

const DRAFT_TYPES: { key: keyof ThreadAction; label: string }[] = [
  { key: "draftReply", label: "Draft Reply" },
  { key: "draftSummary", label: "Post Summary" },
  { key: "draftMeeting", label: "Suggest Meeting" },
  { key: "draftMeetingInvite", label: "Meeting Invite" },
];

function DraftCard({
  actionId,
  draftType,
  label,
  initialText,
}: {
  actionId: string;
  draftType: string;
  label: string;
  initialText: string;
}) {
  const [text, setText] = useState(initialText);
  const [status, setStatus] = useState<string>("suggested");

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

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{label}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <textarea
        className="w-full text-sm border rounded p-2 mb-3 min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={status === "posted"}
      />
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={status === "approved" || status === "posted"}
          className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Approve
        </button>
        <button
          onClick={() => setStatus("rejected")}
          disabled={status === "posted"}
          className="bg-red-100 text-red-700 text-sm px-3 py-1.5 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Reject
        </button>
        <button
          onClick={handlePost}
          disabled={status !== "approved"}
          className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Post to Slack
        </button>
      </div>
    </div>
  );
}

export default function ActionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [action, setAction] = useState<ThreadAction | null>(null);

  useEffect(() => {
    fetch(`/api/action/${id}`)
      .then((res) => res.json())
      .then(setAction);
  }, [id]);

  if (!action) {
    return <p className="text-center py-10 text-gray-500">Loading...</p>;
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-blue-600 text-sm mb-6 inline-block hover:underline"
      >
        ← Back to Dashboard
      </button>

      {/* Analysis Panel */}
      <div className="bg-white border rounded-lg p-6 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Thread Analysis</h1>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[action.status]}`}>
            {action.status}
          </span>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Summary</p>
          <p className="text-gray-800 text-sm">{action.summary}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Decision</p>
          <p className="text-gray-800 text-sm">{action.decision}</p>
        </div>

        {action.openQuestions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Open Questions</p>
            <ul className="list-disc list-inside space-y-1">
              {action.openQuestions.map((q, i) => (
                <li key={i} className="text-gray-800 text-sm">{q}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Response Needed</p>
          <p className={`text-sm font-medium ${action.needResponse ? "text-red-600" : "text-green-600"}`}>
            {action.needResponse ? "Yes" : "No"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Suggested Next Step</p>
          <p className="text-gray-800 text-sm">{action.nextStep}</p>
        </div>
      </div>

      {/* Draft Action Cards */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions</h2>
      <div className="space-y-4">
        {DRAFT_TYPES.map(({ key, label }) => (
          <DraftCard
            key={key}
            actionId={action.id}
            draftType={key}
            label={label}
            initialText={action[key] as string}
          />
        ))}
      </div>
    </main>
  );
}
