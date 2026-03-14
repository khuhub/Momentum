import { App } from "@slack/bolt";
import { runAgent } from "../lib/agent";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  socketMode: true,
});

app.message(async ({ message, say }) => {
  if (message.subtype) return; // ignore bot messages, edits, etc.

  const text = (message as { text?: string }).text;
  if (!text) return;

  try {
    const action = await runAgent(text);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    await say(
      `Got it — I created a *${action.actionType.replace("_", " ")}* action. ` +
      `Review it on the dashboard: ${baseUrl}/action/${action.id}`
    );
  } catch (err) {
    console.error("Agent error:", err);
    await say("Sorry, I couldn't process that. Try again?");
  }
});

(async () => {
  await app.start();
  console.log("⚡ Momentum Slack assistant running");
})();
