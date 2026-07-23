import { ApiClientError } from "./api";
import {
  MOCK_INVESTIGATIONS,
  MOCK_PREVIEW_FIXTURES,
} from "./mock-investigations";
import type {
  Investigation,
  PhaseEvidence,
  ReplayPhase,
  ScreenshotEvidence,
} from "./types";

/* ------------------------------------------------------------------
   MOCK SERVICE LAYER — UI-only phase.
   `getInvestigation` keeps this signature when it starts calling the
   real Sherlock backend; only the body changes. The preview options
   exist purely for the /investigations/mock?state=… development
   preview and disappear with the mock layer.
------------------------------------------------------------------- */

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

const MOCK_LATENCY_MS = 600;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getInvestigation(
  investigationId: string,
  preview?: InvestigationPreview,
): Promise<Investigation> {
  if (preview) {
    return getPreviewInvestigation(preview);
  }

  await delay(MOCK_LATENCY_MS);

  const investigation = MOCK_INVESTIGATIONS[investigationId];
  if (!investigation) {
    throw new ApiClientError(
      `No investigation found for "${investigationId}".`,
      404,
    );
  }

  return investigation;
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
