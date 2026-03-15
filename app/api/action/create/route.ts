import { NextResponse } from "next/server";
import { analyzeThread } from "@/lib/agent";
import { createAction } from "@/lib/store";

export async function POST(request: Request) {
  const { channelId, channelName, threadTs, userId, messages } = await request.json();

  const analysis = await analyzeThread(messages);

  const actionId = createAction({
    channelId,
    channelName: channelName ?? channelId,
    threadTs,
    requestedBy: userId,
    status: "suggested",
    ...analysis,
    actionItems: (analysis.actionItems ?? []).map((item) => ({
      ...item,
      status: "pending" as const,
    })),
  });

  return NextResponse.json({ actionId }, { status: 201 });
}
