import { createAction } from "./store";

export async function draftEmail(params: {
  recipient: string;
  purpose: string;
  tone?: string;
}) {
  const { recipient, purpose, tone = "professional" } = params;

  // Generate a draft email (placeholder — will be replaced with AI generation)
  const subject = `Regarding: ${purpose}`;
  const body = `Dear ${recipient},\n\nI am writing to you regarding ${purpose}.\n\nBest regards`;

  const id = createAction({
    actionType: "draft_email",
    recipient,
    purpose,
    tone,
    subject,
    body,
  });

  return { id, subject, body };
}

export async function createTask(params: {
  title: string;
  dueDate?: string;
}) {
  const { title, dueDate } = params;

  const id = createAction({
    actionType: "create_task",
    title,
    dueDate,
  });

  return { id, title, dueDate };
}
