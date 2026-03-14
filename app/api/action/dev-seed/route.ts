import { NextResponse } from "next/server";
import { analyzeThread } from "@/lib/agent";
import { createAction } from "@/lib/store";

const SEED_MESSAGES = [
  { user: "alice", text: "Hey team — should we push the launch to next Monday instead of Friday?" },
  { user: "bob", text: "I think we need one more round of QA. Found a bug in the checkout flow." },
  { user: "alice", text: "Fair point. Carol can you get QA done by Friday EOD?" },
  { user: "carol", text: "Yes I can get it done by Friday EOD." },
  { user: "bob", text: "Great, then Monday launch works for me." },
  { user: "alice", text: "Confirmed — Monday launch. Bob can you own the release checklist?" },
  { user: "bob", text: "On it." },
];

export async function POST() {
  const analysis = await analyzeThread(SEED_MESSAGES);
  const actionId = createAction({
    channelId: "C_DEV",
    threadTs: String(Date.now()),
    requestedBy: "dev-seed",
    status: "suggested",
    ...analysis,
  });
  return NextResponse.json({ actionId }, { status: 201 });
}
