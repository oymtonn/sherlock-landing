"use client";

import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  ExternalLink,
  FileText,
  GitPullRequestArrow,
  ListChecks,
  LoaderCircle,
  Monitor,
  MinusCircle,
  Pin,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ApiClientError } from "../api";
import {
  getInvestigation,
  type InvestigationPreview,
} from "../investigation-service";
import type {
  BotActionTimelineStep,
  BotActionTimelineStepStatus,
  Investigation,
  InvestigationStatus,
  ReplayPhase,
  ScreenshotEvidence,
} from "../types";
import CodeDiff from "./CodeDiff";
import ReplayPlayer from "./ReplayPlayer";

type PageState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ready"; investigation: Investigation };

export default function InvestigationDetail({
  investigationId,
  preview,
}: {
  investigationId: string;
  preview?: InvestigationPreview;
}) {
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [activeReplayPhase, setActiveReplayPhase] =
    useState<ReplayPhase>("before");
  const previewKey = preview
    ? `${preview.state}:${preview.evidence ?? ""}`
    : "";

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    setActiveReplayPhase("before");

    async function load() {
      try {
        const investigation = await getInvestigation(investigationId, preview);
        if (cancelled) return;
        setState({ status: "ready", investigation });
      } catch (loadError) {
        if (cancelled) return;

        if (loadError instanceof ApiClientError && loadError.status === 404) {
          setState({ status: "not-found" });
        } else {
          setState({
            status: "error",
            message:
              loadError instanceof Error
                ? loadError.message
                : "Unable to load investigation",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // `previewKey` stands in for the preview object's identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investigationId, previewKey]);

  if (state.status === "loading") {
    return <InvestigationSkeleton />;
  }

  if (state.status === "not-found") {
    return (
      <StatusShell
        title="Investigation not found"
        message="No investigation exists for this ID."
      />
    );
  }

  if (state.status === "error") {
    return <StatusShell title="Something went wrong" message={state.message} />;
  }

  const { investigation } = state;
  const pullRequest = investigation.pullRequest;
  const pullRequestUrl =
    pullRequest && "url" in pullRequest ? pullRequest.url : null;
  const pullRequestError =
    pullRequest && "error" in pullRequest ? pullRequest.error : null;
  const errors = [investigation.error, pullRequestError].filter(
    isNonEmptyString,
  );
  const evidenceItems = getEvidenceItems(investigation);
  const summary = investigation.fix?.summary;
  const pullRequestSummary = getPullRequestSummary(
    pullRequestUrl,
    pullRequest && "title" in pullRequest ? pullRequest.title : undefined,
    investigation.issueTitle ?? undefined,
  );

  return (
    <section className="min-w-0 pb-5">
      <div className="flex min-h-8 items-center justify-between gap-4">
        <h1 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Investigation
        </h1>
        <InvestigationStatusBadge status={investigation.status} />
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="break-all text-xl font-semibold">
              {investigation.investigationId}
            </h2>
            {investigation.issueTitle ? (
              <p className="mt-1 text-sm text-muted">
                {investigation.issueTitle}
              </p>
            ) : null}
          </div>
        </div>

        {errors.length > 0 ? (
          <div className="mt-4 rounded-sm border border-red-900/70 bg-red-950/20 px-3 py-2 text-sm text-red-200">
            {errors[0]}
          </div>
        ) : null}

        <div className="mt-5 grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="flex h-full min-w-0 flex-col gap-4">
            <Panel
              title="Browser Replay"
              icon={<Monitor className="h-4 w-4" />}
              className="flex min-h-[420px] flex-1 flex-col"
            >
              <ReplayPanel
                activePhase={activeReplayPhase}
                investigation={investigation}
                onPhaseChange={setActiveReplayPhase}
              />
            </Panel>

            <Panel
              title="Code Changes"
              icon={<Pin className="h-4 w-4 text-emerald-300" />}
              className="flex h-[480px] max-h-[70vh] min-h-[320px] flex-col"
            >
              <CodeDiff
                diff={investigation.fix?.diff}
                diffTruncated={investigation.fix?.diffTruncated}
                className="min-h-0 flex-1"
              />
            </Panel>
          </div>

          <div className="flex h-full min-w-0 flex-col gap-4">
            <Panel
              title="Evidence"
              icon={<Camera className="h-4 w-4 text-blue-300" />}
              className="flex h-[480px] max-h-[70vh] min-h-[320px] flex-col"
            >
              <EvidenceGallery items={evidenceItems} />
            </Panel>

            <Panel
              title="Bot actions"
              icon={<ListChecks className="h-4 w-4" />}
              className="min-h-48"
            >
              <BotActionTimeline steps={investigation.timeline} />
            </Panel>

            <Panel
              title="Summary"
              icon={<FileText className="h-4 w-4" />}
              className="min-h-36"
            >
              {summary ? (
                <p className="px-4 py-4 text-sm leading-6 text-muted">
                  {summary}
                </p>
              ) : null}
            </Panel>

            <Panel
              title="Pull Request"
              icon={<GitPullRequestArrow className="h-4 w-4 text-purple-300" />}
            >
              <PullRequestCard
                error={pullRequestError}
                pullRequestUrl={pullRequestUrl}
                summary={pullRequestSummary}
              />
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

function InvestigationStatusBadge({
  status,
}: {
  status: InvestigationStatus;
}) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
        <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
        Active
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-red-900/70 bg-red-950/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-200">
        <XCircle className="h-3 w-3" aria-hidden="true" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-900/70 bg-emerald-950/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
      <Check className="h-3 w-3" aria-hidden="true" />
      Completed
    </span>
  );
}

function ReplayPanel({
  activePhase,
  investigation,
  onPhaseChange,
}: {
  activePhase: ReplayPhase;
  investigation: Investigation;
  onPhaseChange: (phase: ReplayPhase) => void;
}) {
  const [autoPlaySignal, setAutoPlaySignal] = useState(0);
  const activeReplay = investigation.evidence[activePhase].replay;
  const handlePhaseChange = (phase: ReplayPhase) => {
    setAutoPlaySignal((current) => current + 1);
    onPhaseChange(phase);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex overflow-hidden rounded-sm border border-border">
          <ReplayPhaseButton
            activePhase={activePhase}
            phase="before"
            onPhaseChange={handlePhaseChange}
          />
          <ReplayPhaseButton
            activePhase={activePhase}
            phase="after"
            onPhaseChange={handlePhaseChange}
          />
        </div>
      </div>

      <ReplayPlayer
        key={activePhase}
        label={activePhase === "before" ? "Before replay" : "After replay"}
        replay={activeReplay}
        autoPlaySignal={autoPlaySignal}
      />
    </div>
  );
}

function ReplayPhaseButton({
  activePhase,
  phase,
  onPhaseChange,
}: {
  activePhase: ReplayPhase;
  phase: ReplayPhase;
  onPhaseChange: (phase: ReplayPhase) => void;
}) {
  const isActive = activePhase === phase;

  return (
    <button
      type="button"
      onClick={() => onPhaseChange(phase)}
      className={`h-9 px-3 text-sm font-medium transition-colors ${
        isActive
          ? "bg-foreground text-background"
          : "bg-background text-muted hover:text-foreground"
      }`}
    >
      {phase === "before" ? "Before" : "After"}
    </button>
  );
}

type EvidenceItem = ScreenshotEvidence & {
  phase: ReplayPhase;
  label: string;
};

function getEvidenceItems(investigation: Investigation): EvidenceItem[] {
  const items: EvidenceItem[] = [];

  for (const phase of ["before", "after"] as const) {
    for (const screenshot of investigation.evidence[phase].screenshots) {
      items.push({ ...screenshot, phase, label: phase });
    }
  }

  return items;
}

function EvidenceGallery({ items }: { items: EvidenceItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) {
    return (
      <div className="flex min-h-40 flex-1 items-center justify-center px-4 py-4 text-center text-sm text-muted">
        No screenshots captured.
      </div>
    );
  }

  const activeItem = items[Math.min(activeIndex, items.length - 1)];

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? items.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % items.length);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goToPrevious}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border text-muted transition-colors hover:text-foreground"
          aria-label="Previous screenshot"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-medium text-foreground">
            {activeItem.title}
          </p>
        </div>

        <button
          type="button"
          onClick={goToNext}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border text-muted transition-colors hover:text-foreground"
          aria-label="Next screenshot"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="hidden min-h-0 flex-1 lg:block">
        <ScreenshotFrame item={activeItem} className="h-full min-h-56" />
      </div>

      <div className="grid grid-cols-3 gap-2 lg:hidden">
        {getVisibleEvidenceItems(items, activeIndex).map(({ item, index }) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`min-w-0 rounded-sm border text-left transition-colors ${
              index === activeIndex
                ? "border-muted"
                : "border-border hover:border-muted"
            }`}
          >
            <ScreenshotFrame item={item} className="aspect-[4/3]" compact />
            <p className="truncate px-2 py-1 text-xs font-medium text-muted">
              {item.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScreenshotFrame({
  item,
  className = "",
  compact = false,
}: {
  item: EvidenceItem;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-sm border border-border bg-surface ${className}`}
    >
      {item.status === "loading" ? (
        <div className="flex h-full min-h-24 items-center justify-center gap-2 px-3 text-center text-xs text-muted">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading screenshot...
        </div>
      ) : item.status === "ready" && item.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={`${item.title} screenshot`}
          className="h-full w-full object-cover"
        />
      ) : item.status === "unavailable" || item.status === "error" ? (
        <div className="flex h-full min-h-24 items-center justify-center px-3 text-center text-xs text-muted">
          {item.error || "Screenshot unavailable."}
        </div>
      ) : (
        <div className="flex h-full min-h-24 items-center justify-center px-3 text-center">
          <div>
            <div
              className={`mx-auto rounded-sm border border-border bg-background ${
                compact ? "h-10 w-14" : "h-24 w-36"
              }`}
            />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
              {item.label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getVisibleEvidenceItems(items: EvidenceItem[], activeIndex: number) {
  if (items.length <= 3) {
    return items.map((item, index) => ({ item, index }));
  }

  return [0, 1, 2].map((offset) => {
    const index = (activeIndex + offset) % items.length;
    return {
      item: items[index],
      index,
    };
  });
}

type PullRequestSummary = {
  repository: string | null;
  number: string | null;
  title: string;
  status: "created" | "unavailable";
};

function PullRequestCard({
  error,
  pullRequestUrl,
  summary,
}: {
  error: string | null;
  pullRequestUrl: string | null;
  summary: PullRequestSummary;
}) {
  if (error) {
    return (
      <div className="px-4 py-4 text-sm">
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  if (!pullRequestUrl) {
    return (
      <div className="px-4 py-4 text-sm text-muted">
        No pull request available.
      </div>
    );
  }

  return (
    <div className="px-4 py-4 text-sm">
      <div className="min-w-0">
        {summary.repository ? (
          <p className="truncate font-mono text-xs text-muted">
            {summary.repository}
            {summary.number ? ` #${summary.number}` : ""}
          </p>
        ) : null}
        <p className="mt-1 break-words text-base font-medium text-foreground">
          {summary.title}
        </p>
      </div>

      <a
        href={pullRequestUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-flex items-center gap-2 font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        View Pull Request on GitHub
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

function BotActionTimeline({ steps }: { steps: BotActionTimelineStep[] }) {
  return (
    <ol className="space-y-3 px-4 py-4">
      {steps.map((step) => (
        <BotActionTimelineItem key={step.id} step={step} />
      ))}
    </ol>
  );
}

function BotActionTimelineItem({ step }: { step: BotActionTimelineStep }) {
  const statusLabel = formatStatus(step.status);

  return (
    <li className="flex min-w-0 gap-3 text-sm">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center ${getTimelineIconColor(
          step.status,
        )}`}
      >
        <BotActionTimelineIcon status={step.status} label={statusLabel} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <p
            className={`min-w-0 break-words font-medium ${getTimelineTextColor(
              step.status,
            )}`}
          >
            {step.label}
          </p>
          {step.status !== "completed" ? (
            <span
              className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getTimelineBadgeClasses(
                step.status,
              )}`}
            >
              {statusLabel}
            </span>
          ) : null}
        </div>

        {step.message ? (
          <p className="mt-1 break-words text-sm leading-5 text-muted">
            {step.message}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function BotActionTimelineIcon({
  status,
  label,
}: {
  status: BotActionTimelineStepStatus;
  label: string;
}) {
  if (status === "completed") {
    return <Check className="h-4 w-4" aria-label={label} />;
  }

  if (status === "active") {
    return (
      <LoaderCircle
        className="h-4 w-4 animate-spin"
        role="status"
        aria-label={label}
      />
    );
  }

  if (status === "failed") {
    return <XCircle className="h-4 w-4" aria-label={label} />;
  }

  if (status === "skipped") {
    return <MinusCircle className="h-4 w-4" aria-label={label} />;
  }

  return <Circle className="h-3 w-3" aria-label={label} />;
}

function getTimelineIconColor(status: BotActionTimelineStepStatus) {
  if (status === "completed") {
    return "text-emerald-200";
  }

  if (status === "active") {
    return "text-foreground";
  }

  if (status === "failed") {
    return "text-red-200";
  }

  return "text-muted";
}

function getTimelineTextColor(status: BotActionTimelineStepStatus) {
  if (status === "completed" || status === "active") {
    return "text-foreground";
  }

  if (status === "failed") {
    return "text-red-200";
  }

  return "text-muted";
}

function getTimelineBadgeClasses(status: BotActionTimelineStepStatus) {
  if (status === "completed") {
    return "border-emerald-900/70 bg-emerald-950/30 text-emerald-200";
  }

  if (status === "active") {
    return "border-border bg-surface text-foreground";
  }

  if (status === "failed") {
    return "border-red-900/70 bg-red-950/30 text-red-200";
  }

  if (status === "skipped") {
    return "border-border bg-surface text-muted";
  }

  return "border-border bg-background text-muted";
}

function StatusShell({ title, message }: { title: string; message?: string }) {
  return (
    <section>
      <div className="flex min-h-8 items-center">
        <h1 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Investigation
        </h1>
      </div>
      <div className="mt-6 rounded-sm border border-border bg-background px-4 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {message ? <p className="mt-2 text-sm text-muted">{message}</p> : null}
      </div>
    </section>
  );
}

function InvestigationSkeleton() {
  return (
    <section
      aria-label="Loading investigation"
      role="status"
      className="min-w-0 animate-pulse pb-5"
    >
      <div className="flex min-h-8 items-center justify-between gap-4">
        <h1 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Investigation
        </h1>
        <div className="h-5 w-20 rounded-sm bg-surface" />
      </div>

      <div className="mt-6">
        <div className="h-7 w-64 max-w-full rounded-sm bg-surface" />
        <div className="mt-2 h-4 w-80 max-w-full rounded-sm bg-surface" />

        <div className="mt-5 grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="flex h-full min-w-0 flex-col gap-4">
            <SkeletonPanel className="min-h-[420px] flex-1">
              <div className="flex">
                <div className="h-9 w-20 rounded-l-sm bg-surface" />
                <div className="h-9 w-20 rounded-r-sm bg-surface" />
              </div>
              <div className="mt-4 min-h-[260px] flex-1 rounded-sm bg-surface" />
            </SkeletonPanel>

            <SkeletonPanel className="h-[480px] max-h-[70vh] min-h-[320px]">
              <div className="flex gap-2">
                <div className="h-8 w-32 rounded-sm bg-surface" />
                <div className="h-8 w-40 rounded-sm bg-surface" />
              </div>
              <div className="mt-4 flex-1 rounded-sm bg-surface" />
            </SkeletonPanel>
          </div>

          <div className="flex h-full min-w-0 flex-col gap-4">
            <SkeletonPanel className="h-[480px] max-h-[70vh] min-h-[320px]">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-sm bg-surface" />
                <div className="h-4 w-32 rounded-sm bg-surface" />
                <div className="h-8 w-8 rounded-sm bg-surface" />
              </div>
              <div className="mt-3 flex-1 rounded-sm bg-surface" />
            </SkeletonPanel>

            <SkeletonPanel className="min-h-48">
              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-surface" />
                    <div className="h-4 w-2/3 rounded-sm bg-surface" />
                  </div>
                ))}
              </div>
            </SkeletonPanel>

            <SkeletonPanel className="min-h-36">
              <div className="h-3.5 w-full rounded-sm bg-surface" />
              <div className="mt-2 h-3.5 w-5/6 rounded-sm bg-surface" />
              <div className="mt-2 h-3.5 w-2/3 rounded-sm bg-surface" />
            </SkeletonPanel>

            <SkeletonPanel>
              <div className="h-3 w-40 rounded-sm bg-surface" />
              <div className="mt-2 h-5 w-3/4 rounded-sm bg-surface" />
              <div className="mt-2 h-4 w-48 rounded-sm bg-surface" />
            </SkeletonPanel>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkeletonPanel({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col overflow-hidden rounded-sm border border-border bg-background ${className}`}
    >
      <div className="border-b border-border bg-surface px-4 py-3">
        <div className="h-4 w-28 rounded-sm bg-background" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4">{children}</div>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-sm border border-border bg-background ${className}`}
    >
      <div className="border-b border-border bg-surface px-4 py-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {icon ? <span className="shrink-0 text-muted">{icon}</span> : null}
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function getPullRequestSummary(
  pullRequestUrl: string | null,
  pullRequestTitle: string | undefined,
  issueTitle: string | undefined,
): PullRequestSummary {
  const parsed = parseGitHubPullRequestUrl(pullRequestUrl);

  return {
    repository: parsed?.repository ?? null,
    number: parsed?.number ?? null,
    title:
      pullRequestTitle || (issueTitle ? `Fix ${issueTitle}` : "Sherlock fix"),
    status: pullRequestUrl ? "created" : "unavailable",
  };
}

function parseGitHubPullRequestUrl(pullRequestUrl: string | null) {
  if (!pullRequestUrl) {
    return null;
  }

  try {
    const url = new URL(pullRequestUrl);
    const [, owner, repo, type, number] = url.pathname.split("/");

    if (!owner || !repo || type !== "pull") {
      return null;
    }

    return {
      repository: `${owner}/${repo}`,
      number: number || null,
    };
  } catch {
    return null;
  }
}

function formatStatus(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
