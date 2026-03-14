import { NextResponse } from "next/server";
import { getAllActions } from "@/lib/store";

export async function GET() {
  const actions = getAllActions();
  return NextResponse.json(actions);
}
