import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export async function createMeetingPage(params: {
  title: string;
  notes: string;
  requestedBy: string;
}): Promise<string> {
  const response = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Name: {
        title: [{ text: { content: params.title } }],
      },
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ text: { content: `Requested by: ${params.requestedBy}` } }],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ text: { content: params.notes } }],
        },
      },
    ],
  });

  return `https://notion.so/${response.id.replace(/-/g, "")}`;
}
