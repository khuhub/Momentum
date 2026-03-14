import { NextResponse } from "next/server";
import { getAction, updateAction } from "@/lib/store";

export async function POST(request: Request) {
  const { actionId, draftType, editedText } = await request.json();

  const action = getAction(actionId);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  updateAction(actionId, { [draftType]: editedText, status: "approved" });
  return NextResponse.json({ success: true });
}
