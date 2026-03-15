# Momentum: Your Slack Sidekick.
Employees and students alike waste hours reading past Slack conversations and switching back and forth between Slack and Chrome to complete simple tasks like drafting emails or writing Notion documents. 

**Momentum** is a Slack-based AI assistant that turns Slack into a command center for getting work done. The system uses an AI agent to understand conversations between users and complete action items such as drafting emails, creating Notion documents and tasks, and generating conversation summaries. A web dashboard allows users to review, edit, and approve generated actions before they are finalized. By combining Slack, AI reasoning, and MCP-powered tools, Momentum helps users reduce context switching and complete everyday tasks more efficiently.

## Features
- Slash command: `/momentum`
- AI analysis of recent channel messages
- Draft actions:
	- reply
	- summary
	- meeting suggestion
	- meeting invite
	- Web dashboard for review, edit, approve, and post
	- Notion page creation for meeting notes

## Tech Stack
- Next.js (App Router)
- React + TypeScript
- Slack Bolt (Socket Mode)
- OpenAI API
- Notion MCP

## Requirements
- Node.js
- npm
- Slack app credentials
- OpenAI API key

## Environment Variables
Create a `.env` file:
```env

SLACK_BOT_TOKEN=xoxb-...

SLACK_APP_TOKEN=xapp-...

OPENAI_API_KEY=sk-...
```
## Install

```bash

npm  install

```
## Run Locally
Start both services in separate terminals:

  

```bash

npm  run  dev

```

```bash

npm  run  bolt

```
- App UI: `http://localhost:3000`

- Dashboard: `http://localhost:3000/dashboard`

  
## Slack Setup
1. Create a Slack app at `https://api.slack.com/apps`.

2. Enable Socket Mode and create an app token with `connections:write`.

3. Add bot token scopes:

-  `commands`

-  `chat:write`

-  `channels:history`

4. Add a slash command named `/momentum`.

5. Install the app to your workspace.


## Usage

1. In Slack, run `/momentum` in a channel.

2. The bot analyzes recent messages and posts a card.

3. Open the web app and go to the dashboard.

4. Review drafts, edit if needed and approve!