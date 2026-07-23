import { ApiClientError } from "./api";
import type {
  BotActionTimelineStep,
  Investigation,
  InvestigationStatus,
  PhaseEvidence,
  ScreenshotEvidence,
} from "./types";

export type InvestigationFetchResult =
  | {
      status: "modified";
      investigation: Investigation;
      etag: string | null;
    }
  | { status: "not-modified"; etag: string | null };

export async function getInvestigation(
  investigationId: string,
  options: { etag?: string | null; signal?: AbortSignal } = {},
): Promise<InvestigationFetchResult> {
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
    investigation,
    etag: responseEtag,
  };
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

export async function getExactInvestigationDiff(
  investigationId: string,
  options: { signal?: AbortSignal } = {},
): Promise<{ diff: string; diffTruncated: boolean }> {
  let response: Response;
  try {
    response = await fetch(
      `/api/investigations/${encodeURIComponent(investigationId)}/diff/`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: options.signal,
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new ApiClientError("Unable to load the exact diff.");
  }
  if (!response.ok) {
    throw new ApiClientError(
      response.status === 401
        ? "Your session has expired. Sign in again."
        : response.status === 404
          ? "Investigation diff not found."
          : "Unable to load the exact diff.",
      response.status,
    );
  }
  const payload = (await response.json()) as {
    diff?: unknown;
    diffTruncated?: unknown;
  };
  if (
    typeof payload.diff !== "string" ||
    typeof payload.diffTruncated !== "boolean"
  ) {
    throw new ApiClientError("Sherlock returned invalid diff data.");
  }
  return { diff: payload.diff, diffTruncated: payload.diffTruncated };
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
