import { NextResponse } from "next/server";
import { getAction, updateAction } from "@/lib/store";

export async function POST(request: Request) {
  const { id } = await request.json();

  const action = getAction(id);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  // TODO: Post result back to Slack channel
  updateAction(id, { status: "posted" });
  return NextResponse.json({ success: true });
}
