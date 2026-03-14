import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function postMessage(
  channelId: string,
  threadTs: string,
  text: string
): Promise<void> {
  await slack.chat.postMessage({
    channel: channelId,
    thread_ts: threadTs,
    text,
  });
}
