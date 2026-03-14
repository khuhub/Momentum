import { NextResponse } from "next/server";
import { analyzeThread } from "@/lib/agent";
import { createAction } from "@/lib/store";

export async function POST(request: Request) {
  const { channelId, threadTs, userId, messages } = await request.json();

  const analysis = await analyzeThread(messages);

  const actionId = createAction({
    channelId,
    threadTs,
    requestedBy: userId,
    status: "suggested",
    ...analysis,
  });

  return NextResponse.json({ actionId }, { status: 201 });
}
