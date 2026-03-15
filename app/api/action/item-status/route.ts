import { NextResponse } from "next/server";
import { getAction, updateAction } from "@/lib/store";

export async function POST(req: Request) {
  const { actionId, itemIndex, status } = await req.json();

  const action = getAction(actionId);
  if (!action) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updatedItems = action.actionItems.map((item, i) =>
    i === itemIndex ? { ...item, status } : item
  );

  updateAction(actionId, { actionItems: updatedItems });
  return NextResponse.json({ success: true });
}
