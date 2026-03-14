# Momentum — Engineering Task Guide

> Hackathon build guide. Each section is owned by one engineer. Work in parallel — coordinate on shared API contracts listed at the bottom.

---

## Person 1 — Slack Integration

### 1. Slack App Setup

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps) and click **Create New App** → From scratch.
2. Name it (e.g. `Momentum`) and select your workspace.
3. Under **OAuth & Permissions**, add these bot token scopes:
   - `chat:write`
   - `channels:history`
   - `groups:history`
   - `im:history`
   - `mpim:history`
4. Click **Install App to Workspace** and authorize it.
5. Under **Interactivity & Shortcuts**:
   - Enable Interactivity.
   - Set the Request URL to `https://<your-host>/api/slack/interactivity`.
   - Add a **Message Shortcut**:
     - Name: `Catch up with AI`
     - Callback ID: `catch_up_with_ai`
6. Copy and store these values in your `.env`:
   ```
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_SIGNING_SECRET=...
   ```

---

### 2. Slack Interaction Endpoint

**File:** `app/api/slack/interactivity/route.ts`

- Accept `POST` requests from Slack.
- Verify the request signature using `SLACK_SIGNING_SECRET` before processing anything.
- Parse the `payload` field (URL-encoded JSON body).
- For shortcut type `message_action`, extract:
  - `channel.id` → `channelId`
  - `message.ts` → `threadTs`
  - `user.id` → `userId`
- Call the backend analysis endpoint `POST /api/analyze-thread` with these values + fetched messages.
- Respond with HTTP 200 immediately (Slack requires a response within 3 seconds).

```ts
// Signature verification sketch
import { createHmac, timingSafeEqual } from "crypto";

function verifySlackSignature(req: Request, rawBody: string): boolean {
  const timestamp = req.headers.get("x-slack-request-timestamp")!;
  const slackSig = req.headers.get("x-slack-signature")!;
  const baseString = `v0:${timestamp}:${rawBody}`;
  const hmac = createHmac("sha256", process.env.SLACK_SIGNING_SECRET!);
  hmac.update(baseString);
  const computed = `v0=${hmac.digest("hex")}`;
  return timingSafeEqual(Buffer.from(computed), Buffer.from(slackSig));
}
```

---

### 3. Fetch Slack Thread

**Function:** `fetchThread(channelId: string, threadTs: string)`

- Call `conversations.replies` from the Slack Web API.
- Filter out bot messages if needed.
- Return messages as:
  ```ts
  { user: string; text: string }[]
  ```

```ts
import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

async function fetchThread(channelId: string, threadTs: string) {
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

### 4. Post Slack Summary Card

**Function:** `postSummaryCard(channelId, threadTs, analysis)`

- Use `chat.postMessage` to post in the original thread (`thread_ts`).
- Include a Block Kit message with:
  - Summary text
  - Decision
  - Status
  - Button: **Open Catch-Up Page** linking to `/thread/{analysisId}`

```ts
await slack.chat.postMessage({
  channel: channelId,
  thread_ts: threadTs,
  blocks: [
    {
      type: "section",
      text: { type: "mrkdwn", text: `*Summary:* ${analysis.summary}` },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*Decision:* ${analysis.decision}` },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Open Catch-Up Page" },
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/thread/${analysis.id}`,
        },
      ],
    },
  ],
});
```

---

### 5. Post Approved Action

**Function:** `postMessage(channelId: string, threadTs: string, text: string)`

- Use `chat.postMessage` to reply inside the thread.
- Pass `thread_ts` to keep it in-thread.

```ts
await slack.chat.postMessage({
  channel: channelId,
  thread_ts: threadTs,
  text,
});
```

---

## Person 2 — AI + Backend

### 1. In-Memory Store

No database needed. Create a shared module that holds all analyses in memory for the duration of the server process.

**File:** `lib/store.ts`

```ts
import { randomUUID } from "crypto";

export interface ThreadAnalysis {
  id: string;
  channelId: string;
  threadTs: string;
  requestedBy: string;
  summary: string;
  decision: string;
  openQuestions: string[];
  needResponse: boolean;
  nextStep: string;
  draftReply: string;
  draftSummary: string;
  draftMeeting: string;
  draftMeetingInvite: string;
  status: string;
  createdAt: Date;
}

const store = new Map<string, ThreadAnalysis>();

export function saveAnalysis(data: Omit<ThreadAnalysis, "id" | "createdAt">): string {
  const id = randomUUID();
  store.set(id, { ...data, id, createdAt: new Date() });
  return id;
}

export function getAnalysis(id: string): ThreadAnalysis | undefined {
  return store.get(id);
}

export function getAllAnalyses(): ThreadAnalysis[] {
  return [...store.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function updateAnalysis(id: string, patch: Partial<ThreadAnalysis>) {
  const existing = store.get(id);
  if (existing) store.set(id, { ...existing, ...patch });
}
```

> Note: data resets on server restart — fine for a hackathon demo.

---

### 2. AI Analysis

**Function:** `analyzeThread(messages: { user: string; text: string }[])`

- Send messages to OpenAI with a structured prompt.
- Request a JSON response with the following shape:

```ts
{
  summary: string;
  decision: string;
  openQuestions: string[];
  needResponse: boolean;
  nextStep: string;
  draftReply: string;
  draftSummary: string;
  draftMeeting: string;
  draftMeetingInvite: string;
}
```

```ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeThread(messages: { user: string; text: string }[]) {
  const formatted = messages.map((m) => `${m.user}: ${m.text}`).join("\n");
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an assistant that analyzes Slack threads. Return a JSON object with:
- summary (string)
- decision (string)
- openQuestions (array of strings)
- needResponse (boolean)
- nextStep (string)
- draftReply (string)
- draftSummary (string)
- draftMeeting (string — meeting agenda draft)
- draftMeetingInvite (string — a ready-to-send Google Meet or Zoom meeting invite with suggested title, agenda, and a placeholder link)`,
      },
      { role: "user", content: `Thread:\n${formatted}` },
    ],
  });
  return JSON.parse(response.choices[0].message.content!);
}
```

---

### 3. Thread Analysis Endpoint

**File:** `app/api/analyze-thread/route.ts`

- Accept `POST` with body: `{ channelId, threadTs, userId, messages }`.
- Call `analyzeThread(messages)`.
- Save result to the in-memory store.
- Return `{ analysisId }`.

```ts
import { saveAnalysis } from "@/lib/store";

export async function POST(req: Request) {
  const { channelId, threadTs, userId, messages } = await req.json();
  const analysis = await analyzeThread(messages);
  const analysisId = saveAnalysis({
    channelId,
    threadTs,
    requestedBy: userId,
    status: "pending",
    ...analysis,
  });
  return Response.json({ analysisId });
}
```

---

### 4. Fetch Analysis Endpoint

**File:** `app/api/thread/[id]/route.ts`

- Accept `GET`.
- Call `getAnalysis(id)` from `lib/store.ts`.
- Return the record, or 404 if not found.

---

### 5. Action Approval Endpoint

**File:** `app/api/action/approve/route.ts`

- Accept `POST` with body: `{ analysisId, actionType, editedText }`.
- `actionType` is one of: `draftReply`, `draftSummary`, `draftMeeting`, `draftMeetingInvite`.
- Call `updateAnalysis(analysisId, { [actionType]: editedText, status: "approved" })` from `lib/store.ts`.
- Return `{ success: true }`.

---

### 6. Post Action Endpoint

**File:** `app/api/action/post/route.ts`

- Accept `POST` with body: `{ analysisId, actionType }`.
- Call `getAnalysis(analysisId)` from `lib/store.ts`.
- Read the relevant `actionType` text field.
- Call `postMessage(channelId, threadTs, text)` (from Person 1).
- Call `updateAnalysis(analysisId, { status: "posted" })`.
- Return `{ success: true }`.

---

## Person 3 — Frontend (Web Review UI)

### 1. Project Setup

```bash
npx create-next-app@latest momentum-ui --typescript --tailwind --app
cd momentum-ui
```

Routes to create:
- `/threads` — catch-up queue
- `/thread/[id]` — thread analysis detail

---

### 2. Catch-Up Queue Page

**File:** `app/threads/page.tsx`

- Fetch all records from `GET /api/threads` (calls `getAllAnalyses()` from `lib/store.ts`).
- Render each thread as a card showing:
  - Summary (truncated)
  - Status badge
  - Open question count
  - Last updated time
- Buttons per card:
  - **View** → navigates to `/thread/{id}`
  - **Open in Slack** → deep link using `slack://channel?id={channelId}&message={threadTs}` or the Slack web URL

```tsx
// Status badge example
const statusColors = {
  pending:  "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  posted:   "bg-blue-100 text-blue-800",
  resolved: "bg-gray-100 text-gray-700",
  rejected: "bg-red-100 text-red-800",
};
```

---

### 3. Thread Analysis Page

**File:** `app/thread/[id]/page.tsx`

- Fetch analysis from `GET /api/thread/{id}`.
- Render sections:
  - **Summary**
  - **Decision**
  - **Open Questions** (list)
  - **Response Needed** (yes/no indicator)
  - **Suggested Next Step**
- Below sections, render `<ActionCard>` for each draft action.

---

### 4. ActionCard Component

**File:** `components/ActionCard.tsx`

Props:
```ts
{
  analysisId: string;
  actionType: "draftReply" | "draftSummary" | "draftMeeting" | "draftMeetingInvite";
  label: string;
  initialText: string;
  status: string;
}
```

Each card renders:
- Label header (e.g. "Draft Reply")
- Editable `<textarea>` pre-filled with the draft text
- **Approve** button
- **Reject** button
- **Post to Slack** button (only enabled after approved)

```tsx
async function handleApprove() {
  await fetch("/api/action/approve", {
    method: "POST",
    body: JSON.stringify({ analysisId, actionType, editedText: text }),
    headers: { "Content-Type": "application/json" },
  });
  setStatus("approved");
}

async function handlePost() {
  await fetch("/api/action/post", {
    method: "POST",
    body: JSON.stringify({ analysisId, actionType }),
    headers: { "Content-Type": "application/json" },
  });
  setStatus("posted");
}
```

---

### 5. Status Indicators

Use consistent badge colors across all pages:

| Status    | Style                            |
|-----------|----------------------------------|
| suggested | yellow background, yellow text   |
| approved  | green background, green text     |
| rejected  | red background, red text         |
| posted    | blue background, blue text       |
| resolved  | gray background, gray text       |

---

## Shared API Contract

All engineers should align on these endpoints:

| Method | Path                    | Owner    | Description                        |
|--------|-------------------------|----------|------------------------------------|
| POST   | /api/slack/interactivity | Person 1 | Receives Slack shortcut events     |
| POST   | /api/analyze-thread      | Person 2 | Runs AI analysis, stores result    |
| GET    | /api/thread/[id]         | Person 2 | Returns analysis + drafts          |
| GET    | /api/threads             | Person 2 | Returns list of all analyses       |
| POST   | /api/action/approve      | Person 2 | Approves + updates draft text      |
| POST   | /api/action/post         | Person 2 | Posts action to Slack              |

---

## Environment Variables

```env
# Slack (Person 1)
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...

# OpenAI (Person 2)
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
