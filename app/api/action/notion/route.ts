import { NextResponse } from "next/server";
import { getAction, updateAction } from "@/lib/store";
import { createMeetingPage } from "@/lib/notion";

export async function POST(request: Request) {
  const { actionId } = await request.json();

  const action = getAction(actionId);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  const notionUrl = await createMeetingPage({
    title: "Meeting — " + action.summary.slice(0, 60),
    notes: action.draftMeetingInvite,
    requestedBy: action.requestedBy,
  });

  // Update the draft with the Notion link appended
  updateAction(actionId, {
    draftMeetingInvite: action.draftMeetingInvite + `\n\nNotion page: ${notionUrl}`,
    status: "approved",
  });

  return NextResponse.json({ success: true, notionUrl });
}
