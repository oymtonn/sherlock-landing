import { ApiClientError } from "./api";
import { MOCK_PREVIEW_FIXTURES } from "./mock-investigations";
import type {
  BotActionTimelineStep,
  Investigation,
  InvestigationStatus,
  PhaseEvidence,
  ReplayPhase,
  ScreenshotEvidence,
} from "./types";

export type InvestigationPreviewState =
  | "loading"
  | "active"
  | "completed"
  | "failed"
  | "not-found";

export type InvestigationEvidenceVariant =
  | "available"
  | "pending"
  | "unavailable"
  | "error";

export type InvestigationPreview = {
  state: InvestigationPreviewState;
  evidence?: InvestigationEvidenceVariant;
};

export type InvestigationFetchResult =
  | {
      status: "modified";
      investigation: Investigation;
      etag: string | null;
    }
  | { status: "not-modified"; etag: string | null };

const MOCK_LATENCY_MS = 600;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getInvestigation(
  investigationId: string,
  preview?: InvestigationPreview,
  options: { etag?: string | null; signal?: AbortSignal } = {},
): Promise<InvestigationFetchResult> {
  if (preview) {
    if (process.env.NODE_ENV === "production") {
      throw new ApiClientError("Investigation not found.", 404);
    }
    return {
      status: "modified",
      investigation: await getPreviewInvestigation(preview),
      etag: null,
    };
  }

  let response: Response;
  try {
    response = await fetch(
      `/api/investigations/${encodeURIComponent(investigationId)}/`,
      {
        headers: {
          Accept: "application/json",
          ...(options.etag ? { "If-None-Match": options.etag } : {}),
        },
        cache: "no-store",
        signal: options.signal,
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new ApiClientError("Sherlock is temporarily unavailable.");
  }

  const responseEtag = response.headers.get("etag") ?? options.etag ?? null;
  if (response.status === 304) {
    return { status: "not-modified", etag: responseEtag };
  }
  if (!response.ok) {
    throw new ApiClientError(
      response.status === 401
        ? "Your session has expired. Sign in again."
        : response.status === 404
          ? "Investigation not found."
          : "Unable to load the investigation. Please try again.",
      response.status,
    );
  }

  const investigation = mapInvestigation(
    (await response.json()) as BackendInvestigation,
  );
  return {
    status: "modified",
    investigation: await hydrateExactDiff(investigation, options.signal),
    etag: responseEtag,
  };
}

async function getPreviewInvestigation(
  preview: InvestigationPreview,
): Promise<Investigation> {
  if (preview.state === "loading") {
    // Hold the skeleton on screen forever.
    return new Promise<Investigation>(() => {});
  }

  await delay(MOCK_LATENCY_MS);

  if (preview.state === "not-found") {
    throw new ApiClientError("No investigation found for this preview.", 404);
  }

  const fixture = MOCK_PREVIEW_FIXTURES[preview.state];

  return preview.evidence && preview.evidence !== "available"
    ? withEvidenceVariant(fixture, preview.evidence)
    : fixture;
}

function withEvidenceVariant(
  investigation: Investigation,
  variant: Exclude<InvestigationEvidenceVariant, "available">,
): Investigation {
  const replayStatus = variant;
  const screenshotStatus: ScreenshotEvidence["status"] =
    variant === "error" ? "error" : variant;
  const errorMessage =
    variant === "error" ? "The evidence store returned an error." : null;

  const phases: ReplayPhase[] = ["before", "after"];
  const evidence = Object.fromEntries(
    phases.map((phase) => {
      const phaseEvidence = investigation.evidence[phase];

      return [
        phase,
        {
          replay: {
            status: replayStatus,
            videoUrl: null,
            posterUrl: null,
            error: errorMessage,
          },
          screenshots: phaseEvidence.screenshots.map((item) => ({
            ...item,
            status: screenshotStatus,
            url: null,
            error: errorMessage,
          })),
        } satisfies PhaseEvidence,
      ];
    }),
  ) as Record<ReplayPhase, PhaseEvidence>;

  return { ...investigation, evidence };
}

type BackendInvestigation = {
  id: string;
  issueTitle?: string | null;
  status: InvestigationStatus;
  error?: string | null;
  updatedAt: string;
  version: number;
  timeline?: Array<{
    id: BotActionTimelineStep["id"];
    label: string;
    status: BotActionTimelineStep["status"];
    message?: string | null;
    startedAt?: string | null;
    finishedAt?: string | null;
  }>;
  evidence?: {
    before?: BackendPhaseEvidence;
    after?: BackendPhaseEvidence;
  };
  fix?: Investigation["fix"];
  pullRequest?: Investigation["pullRequest"];
};

type BackendPhaseEvidence = {
  replay?: {
    status: PhaseEvidence["replay"]["status"];
    videoUrl?: string;
    posterUrl?: string;
    error?: string;
  };
  screenshots?: Array<{
    id: string;
    title: string;
    status: ScreenshotEvidence["status"];
    url?: string;
    error?: string;
  }>;
};

function mapPhaseEvidence(
  phase: BackendPhaseEvidence | undefined,
): PhaseEvidence {
  return {
    replay: {
      status: phase?.replay?.status ?? "unavailable",
      videoUrl: phase?.replay?.videoUrl ?? null,
      posterUrl: phase?.replay?.posterUrl ?? null,
      error: phase?.replay?.error ?? null,
    },
    screenshots: (phase?.screenshots ?? []).map((screenshot) => ({
      id: screenshot.id,
      title: screenshot.title,
      status: screenshot.status,
      url: screenshot.url ?? null,
      error: screenshot.error ?? null,
    })),
  };
}

function mapInvestigation(payload: BackendInvestigation): Investigation {
  if (
    typeof payload.id !== "string" ||
    !["active", "completed", "failed"].includes(payload.status) ||
    typeof payload.updatedAt !== "string" ||
    !Number.isSafeInteger(payload.version)
  ) {
    throw new ApiClientError("Sherlock returned invalid investigation data.");
  }
  return {
    investigationId: payload.id,
    issueTitle: payload.issueTitle ?? null,
    status: payload.status,
    error: payload.error ?? null,
    updatedAt: payload.updatedAt,
    version: payload.version,
    timeline: (payload.timeline ?? []).map((step) => ({
      id: step.id,
      label: step.label,
      status: step.status,
      message: step.message ?? null,
      startedAt: step.startedAt ?? null,
      finishedAt: step.finishedAt ?? null,
    })),
    evidence: {
      before: mapPhaseEvidence(payload.evidence?.before),
      after: mapPhaseEvidence(payload.evidence?.after),
    },
    fix: payload.fix ?? null,
    pullRequest: payload.pullRequest ?? null,
  };
}

async function hydrateExactDiff(
  investigation: Investigation,
  signal?: AbortSignal,
): Promise<Investigation> {
  if (!investigation.fix?.diffTruncated) return investigation;

  let response: Response;
  try {
    response = await fetch(
      `/api/investigations/${encodeURIComponent(investigation.investigationId)}/diff/`,
      { headers: { Accept: "application/json" }, cache: "no-store", signal },
    );
  } catch {
    return investigation;
  }
  if (!response.ok) {
    // The preview diff remains useful and explicitly reports truncation if
    // the optional exact-diff request is unavailable.
    return investigation;
  }
  const payload = (await response.json()) as {
    diff?: unknown;
    diffTruncated?: unknown;
  };
  if (
    typeof payload.diff !== "string" ||
    typeof payload.diffTruncated !== "boolean"
  ) {
    return investigation;
  }
  return {
    ...investigation,
    fix: {
      ...investigation.fix,
      diff: payload.diff,
      diffTruncated: payload.diffTruncated,
    },
  };
}

export function shouldPollInvestigation(status: InvestigationStatus) {
  return status === "active";
}

export function nextInvestigationPollDelay(
  consecutiveFailures: number,
  documentHidden: boolean,
) {
  if (documentHidden) return 10_000;
  return Math.min(2_500 * 2 ** Math.max(0, consecutiveFailures), 20_000);
}
