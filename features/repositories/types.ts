export type ConnectedRepository = {
  id: string;
  fullName: string;
  htmlUrl: string;
  private: boolean;
  ownerAvatarUrl: string | null;
  installationId: string;
};

export type GitHubInstallation = {
  id: string;
  accountLogin: string;
  accountType: string;
  manageUrl: string;
};

export type ConnectedRepositoriesResponse = {
  repositories: ConnectedRepository[];
  installations: GitHubInstallation[];
};

export type GitHubIssueState = "open" | "closed" | "all";

export type ConnectedGitHubIssue = {
  id: string;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  htmlUrl: string;
  author: { login: string; avatarUrl: string | null } | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
};

export type RepositoryIssuesResponse = {
  issues: ConnectedGitHubIssue[];
  pagination: {
    page: number;
    perPage: number;
    hasNextPage: boolean;
  };
};

export type IssueInvestigationResponse = {
  investigationId: string;
  status: string;
  statusUrl: string;
};

/* ------------------------------------------------------------------
   Investigation view types — mock-phase shapes.
   These describe what the investigation UI renders, not the backend
   wire format. Data integration maps real responses onto them (or
   reconciles them with the backend contract) inside
   `investigation-service.ts`; the components only know these shapes.
------------------------------------------------------------------- */

export type ReplayPhase = "before" | "after";

export type BotActionTimelineStepStatus =
  | "pending"
  | "active"
  | "completed"
  | "failed"
  | "skipped";

export type BotActionTimelineStepId =
  | "open_preview"
  | "reproduce"
  | "diagnose"
  | "apply_fix"
  | "verify"
  | "open_pr";

export type BotActionTimelineStep = {
  id: BotActionTimelineStepId;
  label: string;
  status: BotActionTimelineStepStatus;
  message: string | null;
  startedAt: string | null;
  finishedAt: string | null;
};

export type ReplayAvailability =
  | "pending"
  | "loading"
  | "available"
  | "unavailable"
  | "error";

export type ReplayEvidence = {
  status: ReplayAvailability;
  videoUrl: string | null;
  posterUrl: string | null;
  error: string | null;
};

export type ScreenshotAvailability =
  | "pending"
  | "loading"
  | "ready"
  | "unavailable"
  | "error";

export type ScreenshotEvidence = {
  id: string;
  title: string;
  status: ScreenshotAvailability;
  url: string | null;
  error: string | null;
};

export type PhaseEvidence = {
  replay: ReplayEvidence;
  screenshots: ScreenshotEvidence[];
};

export type InvestigationStatus = "active" | "completed" | "failed";

export type InvestigationFix = {
  summary: string;
  diff: string;
  diffTruncated: boolean;
};

export type InvestigationPullRequest =
  | { url: string; title: string }
  | { error: string };

export type Investigation = {
  investigationId: string;
  issueTitle: string | null;
  status: InvestigationStatus;
  error: string | null;
  updatedAt: string;
  version: number;
  timeline: BotActionTimelineStep[];
  evidence: Record<ReplayPhase, PhaseEvidence>;
  fix: InvestigationFix | null;
  pullRequest: InvestigationPullRequest | null;
};
