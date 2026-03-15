import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ActionItem {
  task: string;
  assignee: string;
}

export interface ThreadAnalysis {
  threadTitle: string;
  summary: string;
  decision: string;
  openQuestions: string[];
  needResponse: boolean;
  nextStep: string;
  actionItems: ActionItem[];
  draftReply: string;
  draftSummary: string;
  draftMeeting: string;
  draftMeetingInvite: string;
}

export async function analyzeThread(
  messages: { user: string; text: string }[]
): Promise<ThreadAnalysis> {
  const formatted = messages.map((m) => `${m.user}: ${m.text}`).join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an assistant that analyzes Slack threads and drafts follow-up content.
Return a JSON object with exactly these fields:
- threadTitle (string) — a short 3-6 word title describing what this thread is about
- summary (string) — 2-3 sentence summary of the thread
- decision (string) — the main decision or conclusion reached, or "No decision yet"
- openQuestions (array of strings) — unresolved questions from the thread
- needResponse (boolean) — true if someone is waiting on a reply
- nextStep (string) — the single most important next action
- actionItems (array of objects) — each with "task" (string, the specific thing to do) and "assignee" (string, the person mentioned as responsible, or "Team" if unclear)
- draftReply (string) — a complete, ready-to-send reply to the thread
- draftSummary (string) — a short recap message suitable for posting in the thread
- draftMeeting (string) — a message suggesting a sync meeting with context on why
- draftMeetingInvite (string) — a meeting invite message with suggested title, attendees, agenda, and a placeholder for the meeting link`,
      },
      {
        role: "user",
        content: `Analyze this Slack thread:\n\n${formatted}`,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content!) as ThreadAnalysis;
}
