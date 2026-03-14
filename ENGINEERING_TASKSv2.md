# Momentum — Engineering Guide v3
**Slack Command Center + MCP Tools**

Hackathon build guide. Each section is owned by one engineer.  
Work in parallel — coordinate using the **Shared API Contract**.

---

# Product Idea

**Momentum turns Slack into a command center.**

Users interact with an AI assistant directly inside Slack to complete tasks like:

- drafting emails
- creating tasks
- scheduling actions (future)

Slack becomes the **conversation interface**, while a **web dashboard** is used to:

- review AI actions
- approve or edit outputs
- view task history
- manage integrations

The backend connects to **MCP tools**, allowing the assistant to safely execute actions across external systems.

---

# MVP Scope

For the hackathon we implement **two actions**:

## Action 1 — Draft Email

Example Slack messages:

```
Draft an email to Professor Lee asking for an extension
Write a follow-up email thanking the recruiting team
Email Alex asking for the meeting notes
```

System behavior:

1. Slack message received
2. AI extracts intent
3. MCP email tool generates a draft
4. Draft appears in the dashboard
5. User edits or approves
6. Slack confirms action

---

## Action 2 — Create Task

Example Slack messages:

```
Create a task to send the deck tomorrow
Remind me to follow up with Maya next week
Turn this into a task
```

System behavior:

1. Slack message received
2. AI extracts task intent
3. MCP task tool creates a task
4. Task appears in dashboard
5. User edits or completes task
6. Slack confirms creation

---

# System Architecture

## Slack Layer
- Slack Bolt (TypeScript)
- Socket Mode
- Handles Slack messages

## Backend Layer
- AI intent parser
- MCP tool execution
- action storage

## Frontend Layer
- Next.js dashboard
- approvals
- action history

## Tool Layer (MCP)

Tools exposed to the agent:

- email drafting
- task creation

---

# System Flow

```
User message in Slack
      ↓
Bolt receives event
      ↓
AI agent parses intent
      ↓
Agent selects MCP tool
      ↓
Tool generates result
      ↓
Action stored
      ↓
Dashboard shows action
      ↓
User approves or edits
      ↓
Slack confirms result
```

---

# Project Structure

```
momentum/

bolt/
  app.ts
  slack.ts

lib/
  agent.ts
  tools.ts
  store.ts

app/
  api/
    action/create/route.ts
    action/approve/route.ts
    action/post/route.ts
    actions/route.ts

  dashboard/page.tsx
  action/[id]/page.tsx

components/
  ActionCard.tsx
  ActionList.tsx

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

# Person 1 — Slack Integration

Responsible for:

- Slack app setup
- Bolt server
- Slack message listener
- sending messages back to Slack

---

# Slack App Setup

Create a new Slack app:

https://api.slack.com/apps

Add **Bot Token Scopes**

```
chat:write
channels:history
groups:history
im:history
mpim:history
```

Enable **Socket Mode**

Create an **App-Level Token**

Scope:

```
connections:write
```

Install the app to the workspace.

---

# Bolt Server

`bolt/app.ts`

```ts
import { App } from "@slack/bolt";

export const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  socketMode: true
});

(async () => {
  await app.start();
  console.log("⚡ Momentum Slack assistant running");
})();
```

---

# Slack Message Handler

Example handler:

```ts
app.message(async ({ message, say }) => {

  const text = message.text;

  const action = await runAgent(text);

  await say("Got it — check the dashboard to review.");
});
```

---

# Person 2 — AI + MCP Backend

Responsible for:

- AI reasoning
- MCP tool calls
- action storage
- API endpoints

---

# In-Memory Store

`lib/store.ts`

```ts
import { randomUUID } from "crypto";

const actions = new Map();

export function createAction(data) {

  const id = randomUUID();

  actions.set(id, {
    ...data,
    id,
    status: "suggested",
    createdAt: new Date()
  });

  return id;
}

export function getAction(id) {
  return actions.get(id);
}

export function getAllActions() {
  return [...actions.values()];
}

export function updateAction(id, patch) {

  const existing = actions.get(id);

  if (existing) {
    actions.set(id, { ...existing, ...patch });
  }

}
```

---

# AI Agent

`lib/agent.ts`

Responsible for:

- intent detection
- tool selection
- tool execution

Example output:

```json
{
  "actionType": "draft_email",
  "recipient": "Professor Lee",
  "purpose": "request deadline extension",
  "tone": "respectful"
}
```

or

```json
{
  "actionType": "create_task",
  "title": "Send presentation deck",
  "dueDate": "tomorrow"
}
```

---

# MCP Tools

`lib/tools.ts`

## Tool 1 — Draft Email

Input:

```
recipient
purpose
tone
```

Output:

```
subject
body
```

---

## Tool 2 — Create Task

Input:

```
title
dueDate
```

Output:

```
task object
```

---

# Person 3 — Frontend

Responsible for:

- dashboard
- action review
- approvals

---

# Setup

```
npx create-next-app momentum-ui --typescript --tailwind --app
```

---

# Dashboard Page

`app/dashboard/page.tsx`

Displays:

- all actions
- status
- preview text

Buttons:

```
View
Approve
Reject
```

---

# Action Detail Page

`app/action/[id]/page.tsx`

Shows:

- action details
- editable text
- approval controls

Buttons:

```
Approve
Reject
Publish to Slack
```

---

# Action Card Component

`components/ActionCard.tsx`

Displays:

- action title
- status badge
- preview text

Controls:

```
Approve
Reject
Publish
```

---

# Shared API Contract

| Method | Path | Purpose |
|------|------|------|
| POST | /api/action/create | create action |
| GET | /api/actions | list actions |
| GET | /api/action/[id] | fetch action |
| POST | /api/action/approve | approve action |
| POST | /api/action/post | publish to Slack |

---

# Status System

| Status | Meaning |
|------|------|
| suggested | AI generated |
| approved | user approved |
| rejected | user rejected |
| posted | sent to Slack |

---

# Demo Flow

User types in Slack:

```
Draft an email to Professor Lee asking for an extension
```

Flow:

1. Slack bot receives message
2. AI determines `draft_email`
3. Email draft generated
4. Action saved
5. Dashboard shows pending action
6. User edits draft
7. User approves
8. Slack posts final message

---

# Hackathon Notes

### In-memory store resets on restart

Expected for demo.

### Slack links require public URL

Use:

```
ngrok
```

or deploy frontend to:

```
vercel
```

### Focus only on these actions

```
draft_email
create_task
```

Everything else is stretch.