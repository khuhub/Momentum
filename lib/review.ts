export type ReviewStatus = "suggested" | "approved" | "rejected" | "posted";

export type DraftType =
  | "draftReply"
  | "draftSummary"
  | "draftMeeting"
  | "draftMeetingInvite";

export interface ReviewAction {
  id: string;
  status: ReviewStatus;
  createdAt?: string;
  summary: string;
  decision: string;
  openQuestions: string[];
  responseNeeded: boolean;
  suggestedNextStep: string;
  threadTitle: string;
  slackUrl?: string;
  draftReply: string;
  draftSummary: string;
  draftMeeting: string;
  draftMeetingInvite: string;
}

export const mockReviewActions: ReviewAction[] = [
  {
    id: "mock-build-failure-sync",
    status: "suggested",
    createdAt: "2026-03-14T10:00:00.000Z",
    threadTitle: "Build Failure Sync",
    summary:
      "Thread converged on a suspected regression in lib-core after deploy. Team isolated rollback options and asked for owner confirmation.",
    decision: "Temporarily pin lib-core to 2.3.1 and validate staging before re-enabling the rollout.",
    openQuestions: [
      "Do we need a migration guard for services still on 2.2.x?",
      "Who signs off production re-enable after validation?",
      "Should we post a status update in #eng-announcements?",
    ],
    responseNeeded: true,
    suggestedNextStep: "Assign rollback owner, run staging verification checklist, then publish status update in Slack.",
    slackUrl: "https://slack.com/app_redirect?channel=C00000000&thread_ts=1710400000.000001",
    draftReply:
      "Quick update: we are pinning lib-core to 2.3.1 as a safe rollback while we validate in staging. I will share results in 30 minutes and confirm go/no-go for production.",
    draftSummary:
      "Summary: root cause likely tied to lib-core upgrade. Decision is rollback pin + staged verification. Remaining actions are owner assignment and channel update.",
    draftMeeting: "Can we do a 20-minute sync at 2:30 PM ET to finalize ownership and re-enable criteria?",
    draftMeetingInvite:
      "Invite: Build Failure Sync (20 min). Agenda: rollback status, verification results, ownership, re-enable checkpoint.",
  },
  {
    id: "mock-mobile-redesign",
    status: "approved",
    createdAt: "2026-03-14T09:30:00.000Z",
    threadTitle: "Mobile App Redesign",
    summary:
      "Design and frontend aligned on a minimal nav approach. Team agreed to ship phase one with reduced visual complexity and fewer interactive states.",
    decision: "Proceed with minimal navigation shell for v1 and defer advanced personalization controls.",
    openQuestions: ["Which KPI will be primary for success in the first release?"],
    responseNeeded: false,
    suggestedNextStep: "Finalize handoff checklist and start component implementation under feature flag.",
    slackUrl: "https://slack.com/app_redirect?channel=C00000000&thread_ts=1710400200.000001",
    draftReply:
      "Aligned on a cleaner v1 scope. We will ship the minimal navigation shell first and track KPI impact before layering personalization.",
    draftSummary:
      "Summary: decision made to simplify v1 and focus on baseline usability. Personalization deferred to follow-up iteration.",
    draftMeeting: "Optional: 15-minute handoff review tomorrow to confirm edge cases before implementation.",
    draftMeetingInvite:
      "Invite: Mobile Redesign Handoff (15 min). Agenda: finalized scope, edge cases, QA readiness, release flag plan.",
  },
  {
    id: "mock-competitor-analysis",
    status: "posted",
    createdAt: "2026-03-14T09:00:00.000Z",
    threadTitle: "Competitor Analysis Snapshot",
    summary:
      "Research thread produced a concise comparison of onboarding flows. Team prioritized faster setup and better default templates.",
    decision: "Adopt two onboarding improvements immediately and track completion rate for two weeks.",
    openQuestions: [],
    responseNeeded: false,
    suggestedNextStep: "Create tickets for onboarding updates and publish benchmark summary to product channel.",
    slackUrl: "https://slack.com/app_redirect?channel=C00000000&thread_ts=1710400400.000001",
    draftReply:
      "Posted analysis highlights and action plan in channel. Next step is implementing the two onboarding improvements with measurement tracking.",
    draftSummary:
      "Summary: competitor scan complete, two clear improvements selected, implementation and tracking now underway.",
    draftMeeting: "No meeting needed unless implementation blockers appear.",
    draftMeetingInvite: "Invite draft not needed for this thread.",
  },
];

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
      typeof raw.threadTitle === "string"
        ? raw.threadTitle
        : typeof raw.requestedBy === "string"
          ? `Thread requested by ${raw.requestedBy}`
        : `Thread ${String(raw.id ?? "").slice(0, 8) || "analysis"}`,
    slackUrl: typeof raw.slackUrl === "string" ? raw.slackUrl : undefined,
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
