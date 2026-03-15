import { randomUUID } from "crypto";

export interface StoredActionItem {
  task: string;
  assignee: string;
  status: "pending" | "approved" | "rejected";
}

export type ActionStatus = "suggested" | "approved" | "rejected" | "posted" | "resolved";

export interface ThreadAction {
  id: string;
  channelId: string;
  channelName: string;
  threadTs: string;
  requestedBy: string;
  // Analysis
  threadTitle: string;
  summary: string;
  actionItems: StoredActionItem[];
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

// Use globalThis so the store survives Next.js hot-reload and module isolation
const g = globalThis as typeof globalThis & { __momentumStore?: Map<string, ThreadAction> };
if (!g.__momentumStore) g.__momentumStore = new Map<string, ThreadAction>();
const store = g.__momentumStore;

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
