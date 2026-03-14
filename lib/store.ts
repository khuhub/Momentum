import { randomUUID } from "crypto";

export type ActionStatus = "suggested" | "approved" | "rejected" | "posted";

export interface Action {
  id: string;
  actionType: "draft_email" | "create_task";
  status: ActionStatus;
  createdAt: Date;
  // Email fields
  recipient?: string;
  purpose?: string;
  tone?: string;
  subject?: string;
  body?: string;
  // Task fields
  title?: string;
  dueDate?: string;
}

const actions = new Map<string, Action>();

export function createAction(data: Omit<Action, "id" | "status" | "createdAt">): string {
  const id = randomUUID();

  actions.set(id, {
    ...data,
    id,
    status: "suggested",
    createdAt: new Date(),
  });

  return id;
}

export function getAction(id: string): Action | undefined {
  return actions.get(id);
}

export function getAllActions(): Action[] {
  return [...actions.values()];
}

export function updateAction(id: string, patch: Partial<Action>) {
  const existing = actions.get(id);

  if (existing) {
    actions.set(id, { ...existing, ...patch });
  }
}
