"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Action } from "@/lib/store";

export default function ActionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [action, setAction] = useState<Action | null>(null);

  useEffect(() => {
    fetch(`/api/action/${id}`)
      .then((res) => res.json())
      .then(setAction);
  }, [id]);

  async function handleStatus(status: string) {
    await fetch("/api/action/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setAction((prev) => (prev ? { ...prev, status: status as Action["status"] } : prev));
  }

  async function handlePost() {
    await fetch("/api/action/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAction((prev) => (prev ? { ...prev, status: "posted" } : prev));
  }

  if (!action) {
    return <p className="text-center py-10">Loading...</p>;
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-blue-600 text-sm mb-4 inline-block hover:underline"
      >
        &larr; Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-2 capitalize">
        {action.actionType.replace("_", " ")}
      </h1>

      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 mb-4 inline-block">
        {action.status}
      </span>

      <div className="bg-white border rounded-lg p-6 mt-4 space-y-4">
        {action.actionType === "draft_email" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-500">To</label>
              <p>{action.recipient}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Subject</label>
              <p>{action.subject}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Body</label>
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                {action.body}
              </pre>
            </div>
          </>
        )}

        {action.actionType === "create_task" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p>{action.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Due Date</label>
              <p>{action.dueDate || "Not set"}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => handleStatus("approved")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Approve
        </button>
        <button
          onClick={() => handleStatus("rejected")}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Reject
        </button>
        <button
          onClick={handlePost}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Publish to Slack
        </button>
      </div>
    </main>
  );
}
