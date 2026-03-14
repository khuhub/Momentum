# Momentum — Engineering Guide
**Slack AI Catch-Up Agent + Web Review Console**

Hackathon build guide. Each section is owned by one engineer.
Work in parallel — coordinate using the **Shared API Contract**.

---

# Product Idea

**Momentum lets you catch up on noisy Slack threads instantly.**

User right-clicks any Slack thread → clicks **"Catch up with AI"** → AI analyzes the thread and posts a summary card in Slack with a link to a web review page.

On the web page, the user can:
- Read the full AI analysis (summary, decision, open questions, next step)
- Review AI-generated draft actions
- Approve or edit each action
- Push approved actions back into Slack

The experience:
1. User triggers shortcut in Slack
2. Bot posts a summary card in the thread
3. User clicks **Open Review Page**
4. Web UI shows the full analysis + action drafts
5. User approves actions → app posts them back to Slack

---

# MVP Scope

## Action 1 — Draft Reply
AI writes a reply to the thread based on context.
User edits if needed → approves → reply posts into the Slack thread.

## Action 2 — Post Summary
AI writes a short recap of the thread.
User approves → summary posts into the Slack thread.

## Action 3 — Suggest Meeting
AI drafts a short message suggesting a sync.
User approves → message posts into the Slack thread.

## Action 4 — Meeting Invite
AI drafts a pre-written meeting invite message with suggested time and agenda.
User approves → message posts into the Slack thread.
*(Real calendar integration is a stretch goal — implement later if time allows.)*

---

# System Architecture

## Slack Layer
- Slack Bolt (TypeScript)
- Socket Mode (no public URL needed for Slack events)
- Handles message shortcuts

## Backend Layer
- AI thread analysis (OpenAI)
- Action generation
- In-memory action storage
- API endpoints for web UI

## Frontend Layer
- Next.js web review page
- Thread analysis display
- Action approval controls

---

# System Flow

```
User right-clicks Slack thread → "Catch up with AI"
      ↓
Bolt receives shortcut payload
      ↓
Fetch thread via Slack conversations.replies
      ↓
AI analyzes thread → returns structured JSON
      ↓
Analysis + action drafts stored in memory
      ↓
Bot posts summary card in Slack thread
Card includes: summary, decision, status, [Open Review Page] button
      ↓
User opens web review page
      ↓
Web UI loads analysis + draft actions
      ↓
User approves / edits action
      ↓
Server posts approved action back into Slack thread
      ↓
Status updated to posted
```

---

# Project Structure

```
momentum/

bolt/
  app.ts          ← Bolt server entry point
  handlers.ts     ← shortcut handler

lib/
  agent.ts        ← AI analysis + draft generation
  store.ts        ← in-memory store
  slack/
    fetchThread.ts
    postMessage.ts

app/
  api/
    action/create/route.ts
    action/approve/route.ts
    action/post/route.ts
    action/[id]/route.ts
    actions/route.ts

  dashboard/page.tsx
  action/[id]/page.tsx

components/
  ActionCard.tsx
  ActionList.tsx
  StatusBadge.tsx

.env
```

---

# Environment Variables

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
SLACK_SIGNING_SECRET=...

OPENAI_API_KEY=sk-...

NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

# 👤 Person 1 — Slack Integration

Responsible for:
- Slack app setup
- Bolt server
- Message shortcut handler
- Fetching Slack threads
- Posting summary cards and messages back to Slack

---

## Slack App Setup

Go to https://api.slack.com/apps and create a new app.

### Bot Token Scopes
```
chat:write
channels:history
groups:history
im:history
mpim:history
```

### Enable Socket Mode
- Go to **Socket Mode** → enable it
- Create an **App-Level Token** with scope: `connections:write`
- Save as `SLACK_APP_TOKEN`

### Message Shortcut
- Go to **Interactivity & Shortcuts** → enable it
- Add a **Message Shortcut**:
  - Name: `Catch up with AI`
  - Callback ID: `catch_up_with_ai`

Install the app to the workspace and save:
```
SLACK_BOT_TOKEN
SLACK_APP_TOKEN
SLACK_SIGNING_SECRET
```

---

## Bolt Server

`bolt/app.ts`

```ts
import { App } from "@slack/bolt";

export const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  socketMode: true,
});

(async () => {
  await app.start();
  console.log("⚡ Momentum running");
})();
```

---

## Shortcut Handler

`bolt/handlers.ts`

```ts
app.shortcut("catch_up_with_ai", async ({ shortcut, ack, client }) => {
  await ack();

  const channelId = shortcut.channel.id;
  const threadTs = shortcut.message.ts;
  const userId = shortcut.user.id;

  // Fetch thread messages
  const messages = await fetchThread(channelId, threadTs);

  // Call backend to analyze
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/action/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channelId, threadTs, userId, messages }),
  });

  const { actionId } = await res.json();

  // Post summary card to thread
  await postSummaryCard(client, channelId, threadTs, actionId);
});
```

---

## Fetch Thread

`lib/slack/fetchThread.ts`

```ts
import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function fetchThread(channelId: string, threadTs: string) {
  const result = await slack.conversations.replies({
    channel: channelId,
    ts: threadTs,
  });
  return (result.messages ?? []).map((m) => ({
    user: m.user ?? "unknown",
    text: m.text ?? "",
  }));
}
```

---

## Post Summary Card

```ts
export async function postSummaryCard(client, channelId, threadTs, actionId) {
  await client.chat.postMessage({
    channel: channelId,
    thread_ts: threadTs,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: "*🧠 AI Catch-Up Ready*" },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Open Review Page" },
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/action/${actionId}`,
          },
        ],
      },
    ],
  });
}
```

---

## Post Message

`lib/slack/postMessage.ts`

```ts
import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function postMessage(channelId: string, threadTs: string, text: string) {
  await slack.chat.postMessage({
    channel: channelId,
    thread_ts: threadTs,
    text,
  });
}
```

---

# 👤 Person 2 — AI + Backend

Responsible for:
- AI thread analysis
- Action draft generation
- In-memory store
- All API endpoints

---

## In-Memory Store

`lib/store.ts`

```ts
import { randomUUID } from "crypto";

export interface ThreadAction {
  id: string;
  channelId: string;
  threadTs: string;
  requestedBy: string;
  // Analysis
  summary: string;
  decision: string;
  openQuestions: string[];
  needResponse: boolean;
  nextStep: string;
  // Drafts
  draftReply: string;
  draftSummary: string;
  draftMeeting: string;
  draftMeetingInvite: string;
  // State
  status: "suggested" | "approved" | "rejected" | "posted";
  createdAt: Date;
}

const store = new Map<string, ThreadAction>();

export function createAction(data: Omit<ThreadAction, "id" | "createdAt">): string {
  const id = randomUUID();
  store.set(id, { ...data, id, createdAt: new Date() });
  return id;
}

export function getAction(id: string): ThreadAction | undefined {
  return store.get(id);
}

export function getAllActions(): ThreadAction[] {
  return [...store.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function updateAction(id: string, patch: Partial<ThreadAction>) {
  const existing = store.get(id);
  if (existing) store.set(id, { ...existing, ...patch });
}
```

---

## AI Agent

`lib/agent.ts`

Analyzes a Slack thread and returns structured JSON with the full analysis + all four action drafts.

```ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeThread(messages: { user: string; text: string }[]) {
  const formatted = messages.map((m) => `${m.user}: ${m.text}`).join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an assistant that analyzes Slack threads and drafts responses.
Return a JSON object with exactly these fields:
- summary (string) — 2-3 sentence summary of the thread
- decision (string) — the main decision or conclusion reached, or "No decision yet"
- openQuestions (array of strings) — unresolved questions from the thread
- needResponse (boolean) — whether someone is waiting for a reply
- nextStep (string) — the most important next action
- draftReply (string) — a ready-to-send reply to the thread
- draftSummary (string) — a short recap message to post in the thread
- draftMeeting (string) — a message suggesting a sync meeting
- draftMeetingInvite (string) — a meeting invite message with suggested title, attendees, and agenda`,
      },
      {
        role: "user",
        content: `Analyze this Slack thread:\n\n${formatted}`,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

---

## API Routes

### POST /api/action/create

`app/api/action/create/route.ts`

Accepts: `{ channelId, threadTs, userId, messages }`
Runs AI analysis, stores result, returns `{ actionId }`.

```ts
import { analyzeThread } from "@/lib/agent";
import { createAction } from "@/lib/store";

export async function POST(req: Request) {
  const { channelId, threadTs, userId, messages } = await req.json();
  const analysis = await analyzeThread(messages);
  const actionId = createAction({
    channelId,
    threadTs,
    requestedBy: userId,
    status: "suggested",
    ...analysis,
  });
  return Response.json({ actionId });
}
```

---

### GET /api/actions

`app/api/actions/route.ts`

Returns all stored actions.

```ts
import { getAllActions } from "@/lib/store";

export async function GET() {
  return Response.json(getAllActions());
}
```

---

### GET /api/action/[id]

`app/api/action/[id]/route.ts`

Returns a single action by id.

```ts
import { getAction } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const action = getAction(params.id);
  if (!action) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(action);
}
```

---

### POST /api/action/approve

`app/api/action/approve/route.ts`

Accepts: `{ actionId, draftType, editedText }`
`draftType` is one of: `draftReply | draftSummary | draftMeeting | draftMeetingInvite`

```ts
import { updateAction } from "@/lib/store";

export async function POST(req: Request) {
  const { actionId, draftType, editedText } = await req.json();
  updateAction(actionId, { [draftType]: editedText, status: "approved" });
  return Response.json({ success: true });
}
```

---

### POST /api/action/post

`app/api/action/post/route.ts`

Accepts: `{ actionId, draftType }`
Posts the approved text into the original Slack thread.

```ts
import { getAction, updateAction } from "@/lib/store";
import { postMessage } from "@/lib/slack/postMessage";

export async function POST(req: Request) {
  const { actionId, draftType } = await req.json();
  const action = getAction(actionId);
  if (!action) return Response.json({ error: "Not found" }, { status: 404 });

  const text = action[draftType as keyof typeof action] as string;
  await postMessage(action.channelId, action.threadTs, text);
  updateAction(actionId, { status: "posted" });

  return Response.json({ success: true });
}
```

---

# 👤 Person 3 — Frontend (Web Review UI)

Responsible for:
- Dashboard listing all analyzed threads
- Action detail page with analysis + draft cards
- Approve / reject / post controls

---

## Setup

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-git --eslint
```

Routes:
- `/dashboard` — list of all analyzed threads
- `/action/[id]` — full analysis + action drafts

---

## Dashboard Page

`app/dashboard/page.tsx`

Fetches `GET /api/actions` and renders each as a card showing:
- Summary (truncated)
- Status badge
- Whether a response is needed
- Open question count
- Buttons: **View**, **Open in Slack**

---

## Action Detail Page

`app/action/[id]/page.tsx`

Fetches `GET /api/action/{id}` and renders:

**Analysis panel:**
- Summary
- Decision
- Open Questions (list)
- Response Needed (yes/no)
- Suggested Next Step

**Action drafts panel:**
One `<ActionCard>` for each draft type.

---

## ActionCard Component

`components/ActionCard.tsx`

Props:
```ts
{
  actionId: string;
  draftType: "draftReply" | "draftSummary" | "draftMeeting" | "draftMeetingInvite";
  label: string;
  initialText: string;
  status: string;
}
```

Each card:
- Editable textarea pre-filled with draft text
- **Approve** button → calls `POST /api/action/approve`
- **Reject** button → updates local state
- **Post to Slack** button (enabled after approved) → calls `POST /api/action/post`

---

## Status Badges

| Status | Color |
|--------|-------|
| suggested | yellow |
| approved | green |
| rejected | red |
| posted | blue |

---

# Shared API Contract

| Method | Path | Owner | Purpose |
|--------|------|-------|---------|
| POST | /api/action/create | Person 2 | Run AI, store result |
| GET | /api/actions | Person 2 | List all actions |
| GET | /api/action/[id] | Person 2 | Fetch one action |
| POST | /api/action/approve | Person 2 | Approve + update draft |
| POST | /api/action/post | Person 2 | Post to Slack |

---

# Status System

| Status | Meaning |
|--------|---------|
| suggested | AI generated, awaiting review |
| approved | User approved |
| rejected | User rejected |
| posted | Sent to Slack |

---

# Demo Flow

1. Open a noisy Slack thread
2. Right-click → **Catch up with AI**
3. Bot posts summary card in thread
4. Click **Open Review Page**
5. Web page shows full analysis
6. Click **Approve** on Draft Reply
7. Click **Post to Slack**
8. Reply appears in the Slack thread

---

# Hackathon Notes

### In-memory store resets on restart
Expected for demo — don't restart the server during the demo.

### Socket Mode = no ngrok needed for Slack
Bolt connects outbound via Socket Mode. Only the web UI needs to be accessible (run locally or deploy to Vercel).

### Stretch goal — real meeting creation
Add `POST /api/action/create-meeting` that calls Google Calendar or Zoom API to generate a real join link, then updates `draftMeetingInvite` before posting.
