import { NextResponse } from "next/server";
import { getAction } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const action = getAction(id);

  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  return NextResponse.json(action);
}
