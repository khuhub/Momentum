import { App } from "@slack/bolt";

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
    const [userResult, channelResult] = await Promise.allSettled([
      client.users.info({ user: userId }),
      client.conversations.info({ channel: channelId }),
    ]);

    const userInfo = userResult.status === "fulfilled" ? userResult.value : null;
    const channelInfo = channelResult.status === "fulfilled" ? channelResult.value : null;

    const requestedBy =
      userInfo?.user?.profile?.display_name_normalized ||
      userInfo?.user?.profile?.display_name ||
      userInfo?.user?.real_name ||
      userId;

    const channelName = (channelInfo?.channel as { name?: string } | null)?.name ?? channelId;

    // Fetch recent channel messages (last 50)
    const result = await client.conversations.history({
      channel: channelId,
      limit: 50,
    });

    const rawMessages = (result.messages ?? [])
      .filter((m) => !m.subtype) // ignore system messages
      .reverse(); // oldest first

    // Resolve all unique user IDs to display names
    const uniqueUserIds = [...new Set(rawMessages.map((m) => m.user).filter(Boolean))] as string[];
    const userNameMap: Record<string, string> = {};
    await Promise.allSettled(
      uniqueUserIds.map(async (uid) => {
        const res = await client.users.info({ user: uid });
        const profile = res.user?.profile;
        userNameMap[uid] =
          profile?.display_name_normalized ||
          profile?.display_name ||
          res.user?.real_name ||
          uid;
      })
    );

    const messages = rawMessages.map((m) => ({
      user: (m.user && userNameMap[m.user]) || m.user || "unknown",
      // Also replace <@USERID> mentions in message text
      text: (m.text ?? "").replace(/<@([A-Z0-9]+)>/g, (_, uid) => userNameMap[uid] ?? uid),
    }));

    // Run AI analysis via the Next.js API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/action/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, channelName, threadTs, userId: requestedBy, messages }),
    });

    await res.json();

    // Post summary card into the channel (not as a thread reply)
    await client.chat.postMessage({
      channel: channelId,
      text: "Catch-Up — open the review page to see the summary.",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Catch-Up*\nThe last 50 messages in this channel have been analyzed. Open the review page to see the summary and approve actions.",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Open Review Page" },
              url: `${baseUrl}/`,
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
