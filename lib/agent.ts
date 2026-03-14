import OpenAI from "openai";
import { draftEmail, createTask } from "./tools";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AgentResult {
  actionType: string;
  id: string;
  [key: string]: unknown;
}

export async function runAgent(text: string): Promise<AgentResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an intent parser. Given a user message, determine the action type and extract parameters.

Return JSON in one of these formats:

For emails:
{"actionType": "draft_email", "recipient": "...", "purpose": "...", "tone": "..."}

For tasks:
{"actionType": "create_task", "title": "...", "dueDate": "..."}

Only return valid JSON. No extra text.`,
      },
      { role: "user", content: text },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(response.choices[0].message.content || "{}");

  if (parsed.actionType === "draft_email") {
    const result = await draftEmail({
      recipient: parsed.recipient,
      purpose: parsed.purpose,
      tone: parsed.tone,
    });
    return { actionType: "draft_email", ...result };
  }

  if (parsed.actionType === "create_task") {
    const result = await createTask({
      title: parsed.title,
      dueDate: parsed.dueDate,
    });
    return { actionType: "create_task", ...result };
  }

  throw new Error(`Unknown action type: ${parsed.actionType}`);
}
