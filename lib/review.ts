export type ReviewStatus = "suggested" | "approved" | "rejected" | "posted" | "resolved";

export interface ReviewActionItem {
  task: string;
  assignee: string;
  status: "pending" | "approved" | "rejected";
}

export type DraftType =
  | "draftReply"
  | "draftSummary"
  | "draftMeeting"
  | "draftMeetingInvite";

export interface ReviewAction {
  id: string;
  status: ReviewStatus;
  createdAt?: string;
  requestedBy: string;
  channelId: string;
  channelName: string;
  summary: string;
  decision: string;
  openQuestions: string[];
  responseNeeded: boolean;
  suggestedNextStep: string;
  threadTitle: string;
  slackUrl?: string;
  actionItems: ReviewActionItem[];
  draftReply: string;
  draftSummary: string;
  draftMeeting: string;
  draftMeetingInvite: string;
}


function buildFallbackSummary(raw: Record<string, unknown>): string {
  if (typeof raw.summary === "string" && raw.summary.trim().length > 0) {
    return raw.summary;
  }

  if (raw.actionType === "draft_email") {
    const recipient = typeof raw.recipient === "string" ? raw.recipient : "recipient";
    return `Email draft prepared for ${recipient}.`;
  }

  if (raw.actionType === "create_task") {
    const title = typeof raw.title === "string" ? raw.title : "a follow-up task";
    return `Task suggestion created: ${title}.`;
  }

  return "AI analysis is ready for review.";
}

function buildFallbackDecision(raw: Record<string, unknown>): string {
  if (typeof raw.decision === "string") {
    return raw.decision;
  }
  return "No final decision recorded yet.";
}

function buildFallbackDraftReply(raw: Record<string, unknown>): string {
  if (typeof raw.draftReply === "string") return raw.draftReply;
  if (typeof raw.body === "string") return raw.body;
  return "Thanks everyone. Here is a concise update and next step based on this thread.";
}

function buildFallbackDraftSummary(raw: Record<string, unknown>): string {
  if (typeof raw.draftSummary === "string") return raw.draftSummary;
  if (typeof raw.subject === "string") return `Summary: ${raw.subject}`;
  return "Summary: key updates captured, pending items tracked, and ownership clarified.";
}

function buildFallbackDraftMeeting(raw: Record<string, unknown>): string {
  if (typeof raw.draftMeeting === "string") return raw.draftMeeting;
  return "Would a 20-minute sync tomorrow help us close open questions faster?";
}

function buildFallbackDraftInvite(raw: Record<string, unknown>): string {
  if (typeof raw.draftMeetingInvite === "string") return raw.draftMeetingInvite;
  return "Invite draft: 20-minute working session. Agenda: decisions, risks, owners, next checkpoints.";
}

export function normalizeAction(input: unknown): ReviewAction {
  const raw = (input ?? {}) as Record<string, unknown>;

  const openQuestions =
    Array.isArray(raw.openQuestions) && raw.openQuestions.every((q) => typeof q === "string")
      ? (raw.openQuestions as string[])
      : [];

  const createdAt =
    typeof raw.createdAt === "string"
      ? raw.createdAt
      : raw.createdAt instanceof Date
        ? raw.createdAt.toISOString()
        : undefined;

  return {
    id: String(raw.id ?? ""),
    status: (raw.status as ReviewStatus) ?? "suggested",
    createdAt,
    requestedBy: typeof raw.requestedBy === "string" ? raw.requestedBy : "unknown",
    channelId: typeof raw.channelId === "string" ? raw.channelId : "",
    channelName: typeof raw.channelName === "string" && raw.channelName.trim() ? raw.channelName : typeof raw.channelId === "string" ? raw.channelId : "",
    summary: buildFallbackSummary(raw),
    decision: buildFallbackDecision(raw),
    openQuestions,
    responseNeeded:
      typeof raw.responseNeeded === "boolean"
        ? raw.responseNeeded
        : Boolean(raw.needResponse),
    suggestedNextStep:
      typeof raw.suggestedNextStep === "string"
        ? raw.suggestedNextStep
        : typeof raw.nextStep === "string"
          ? raw.nextStep
        : "Review draft actions and post approved messages to Slack.",
    threadTitle:
      typeof raw.threadTitle === "string" && raw.threadTitle.trim()
        ? raw.threadTitle
        : `Thread ${String(raw.id ?? "").slice(0, 8) || "analysis"}`,
    slackUrl: typeof raw.slackUrl === "string" ? raw.slackUrl : undefined,
    actionItems: Array.isArray(raw.actionItems)
      ? (raw.actionItems as ReviewActionItem[])
      : [],
    draftReply: buildFallbackDraftReply(raw),
    draftSummary: buildFallbackDraftSummary(raw),
    draftMeeting: buildFallbackDraftMeeting(raw),
    draftMeetingInvite: buildFallbackDraftInvite(raw),
  };
}

export function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}...`;
}
