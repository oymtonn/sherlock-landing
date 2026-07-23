import InvestigationDetail from "@/features/repositories/components/InvestigationDetail";
import type {
  InvestigationEvidenceVariant,
  InvestigationPreview,
  InvestigationPreviewState,
} from "@/features/repositories/investigation-service";

const PREVIEW_STATES: InvestigationPreviewState[] = [
  "loading",
  "active",
  "completed",
  "failed",
  "not-found",
];

const EVIDENCE_VARIANTS: InvestigationEvidenceVariant[] = [
  "available",
  "pending",
  "unavailable",
  "error",
];

/* Mock-only preview: /investigations/mock?state=…&evidence=… renders any UI
   state without backend data. Goes away with the mock layer during data
   integration. */
function parsePreview(
  investigationId: string,
  searchParams: Record<string, string | string[] | undefined>,
): InvestigationPreview | undefined {
  if (process.env.NODE_ENV === "production" || investigationId !== "mock") {
    return undefined;
  }

  const rawState = searchParams.state;
  const rawEvidence = searchParams.evidence;
  const state = PREVIEW_STATES.find((value) => value === rawState);
  const evidence = EVIDENCE_VARIANTS.find((value) => value === rawEvidence);

  return { state: state ?? "completed", evidence };
}

export default async function InvestigationPage({
  params,
  searchParams,
}: {
  params: Promise<{ investigationId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { investigationId } = await params;
  const preview = parsePreview(investigationId, await searchParams);

  return (
    <InvestigationDetail investigationId={investigationId} preview={preview} />
  );
}
