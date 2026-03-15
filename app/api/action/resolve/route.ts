import { NextResponse } from "next/server";
import { getAction, updateAction } from "@/lib/store";

export async function POST(req: Request) {
  const { actionId } = await req.json();
  const action = getAction(actionId);
  if (!action) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  updateAction(actionId, { status: "resolved" });
  return NextResponse.json({ success: true });
}
