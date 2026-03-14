import { NextResponse } from "next/server";
import { createAction } from "@/lib/store";

export async function POST(request: Request) {
  const data = await request.json();
  const id = createAction(data);
  return NextResponse.json({ id }, { status: 201 });
}
