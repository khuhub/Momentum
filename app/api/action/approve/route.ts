import { NextResponse } from "next/server";
import { getAction, updateAction } from "@/lib/store";

export async function POST(request: Request) {
  const { id, status } = await request.json();

  const action = getAction(id);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  updateAction(id, { status });
  return NextResponse.json({ success: true });
}
