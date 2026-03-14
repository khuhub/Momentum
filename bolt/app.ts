import { App, MessageShortcut } from "@slack/bolt";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  socketMode: true,
});

app.command("/momentum", async ({ command, ack, client }) => {
  await ack();

  const channelId = command.channel_id;
  const threadTs = command.ts ?? String(Date.now() / 1000);
  const userId = command.user_id;

  try {
    // Fetch recent channel messages (last 50)
    const result = await client.conversations.history({
      channel: channelId,
      limit: 50,
    });

    const messages = (result.messages ?? [])
      .filter((m) => !m.subtype) // ignore system messages
      .reverse() // oldest first
      .map((m) => ({
        user: m.user ?? "unknown",
        text: m.text ?? "",
      }));

    // Run AI analysis via the Next.js API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/action/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, threadTs, userId, messages }),
    });

    const { actionId } = await res.json();

    // Post summary card into the channel (not as a thread reply)
    await client.chat.postMessage({
      channel: channelId,
      text: "🧠 AI Catch-Up Ready — open the review page to see the summary.",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "🧠 *AI Catch-Up Ready*\nThe last 50 messages in this channel have been analyzed. Open the review page to see the summary and approve actions.",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Open Review Page" },
              url: `${baseUrl}/action/${actionId}`,
              style: "primary",
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.error("Catch-up error:", err);
  }
});

(async () => {
  await app.start();
  console.log("⚡ Momentum running");
})();
