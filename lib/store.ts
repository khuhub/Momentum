import { randomUUID } from "crypto";

export type ActionStatus = "suggested" | "approved" | "rejected" | "posted";

export interface ThreadAction {
  id: string;
  channelId: string;
  threadTs: string;
  requestedBy: string;
  // Analysis
  summary: string;
  decision: string;
  openQuestions: string[];
  needResponse: boolean;
  nextStep: string;
  // Drafts
  draftReply: string;
  draftSummary: string;
  draftMeeting: string;
  draftMeetingInvite: string;
  // State
  status: ActionStatus;
  createdAt: Date;
}

const store = new Map<string, ThreadAction>();

export function createAction(data: Omit<ThreadAction, "id" | "createdAt">): string {
  const id = randomUUID();
  store.set(id, { ...data, id, createdAt: new Date() });
  return id;
}

export function getAction(id: string): ThreadAction | undefined {
  return store.get(id);
}

export function getAllActions(): ThreadAction[] {
  return [...store.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function updateAction(id: string, patch: Partial<ThreadAction>) {
  const existing = store.get(id);
  if (existing) store.set(id, { ...existing, ...patch });
}
