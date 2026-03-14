import { NextResponse } from "next/server";
import { getAction, updateAction, ThreadAction } from "@/lib/store";
import { postMessage } from "@/lib/slack/postMessage";

export async function POST(request: Request) {
  const { actionId, draftType } = await request.json();

  const action = getAction(actionId);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  const text = action[draftType as keyof ThreadAction] as string;
  if (!text) {
    return NextResponse.json({ error: "Draft not found" }, { status: 400 });
  }

  await postMessage(action.channelId, action.threadTs, text);
  updateAction(actionId, { status: "posted" });

  return NextResponse.json({ success: true });
}
