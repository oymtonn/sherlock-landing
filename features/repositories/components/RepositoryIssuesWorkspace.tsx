"use client";

import { ExternalLink, FolderGit, Lock, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiClientError } from "../api";
import {
  getConnectedRepositories,
  getIssueInvestigation,
  getRepositoryIssues,
} from "../github-service";
import type {
  ConnectedGitHubIssue,
  ConnectedRepository,
  GitHubIssueState,
} from "../types";

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      repository: ConnectedRepository;
      issues: ConnectedGitHubIssue[];
      hasNextPage: boolean;
    };

const ISSUE_STATES: Array<{ value: GitHubIssueState; label: string }> = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

export default function RepositoryIssuesWorkspace({
  repositoryId,
}: {
  repositoryId: number;
}) {
  const router = useRouter();
  const [issueState, setIssueState] = useState<GitHubIssueState>("open");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [resolvingIssueNumber, setResolvingIssueNumber] = useState<
    number | null
  >(null);
  const [issueActionError, setIssueActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [connected, issueResponse] = await Promise.all([
          getConnectedRepositories(),
          getRepositoryIssues(repositoryId, {
            state: issueState,
            page,
            perPage: 30,
          }),
        ]);
        if (cancelled) return;

        const repository = connected.repositories.find(
          (item) => item.id === repositoryId,
        );
        if (!repository) {
          setState({
            status: "error",
            message: "This repository is not available to your GitHub App.",
          });
          return;
        }

        setState({
          status: "ready",
          repository,
          issues: issueResponse.issues,
          hasNextPage: issueResponse.pagination.hasNextPage,
        });
      } catch (error) {
        if (cancelled) return;
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load repository issues.",
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [issueState, page, reloadKey, repositoryId]);

  function changeIssueState(nextState: GitHubIssueState) {
    if (nextState === issueState) return;
    setState({ status: "loading" });
    setIssueState(nextState);
    setPage(1);
  }

  function changePage(nextPage: number) {
    setState({ status: "loading" });
    setPage(nextPage);
  }

  async function openIssueInvestigation(issueNumber: number) {
    setIssueActionError(null);
    setResolvingIssueNumber(issueNumber);

    try {
      const investigation = await getIssueInvestigation(
        repositoryId,
        issueNumber,
      );
      router.push(
        `/investigations/${encodeURIComponent(investigation.investigationId)}`,
      );
    } catch (error) {
      setIssueActionError(
        error instanceof ApiClientError && error.status === 404
          ? "No investigation exists for this issue yet. Comment “investigate” on the GitHub issue first."
          : error instanceof Error
            ? error.message
            : "Unable to open this issue investigation.",
      );
      setResolvingIssueNumber(null);
    }
  }

  if (state.status === "loading") {
    return <RepositoryIssuesLoading />;
  }

  if (state.status === "error") {
    return (
      <section>
        <div className="flex min-h-8 items-center">
          <h1 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Repository issues
          </h1>
        </div>
        <div className="mt-6 max-w-3xl rounded-sm border border-red-900/70 bg-red-950/30 p-5">
          <p role="alert" className="text-sm text-red-200">
            {state.message}
          </p>
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              setReloadKey((current) => current + 1);
            }}
            className="mt-4 h-9 rounded-sm border border-border px-3 text-sm font-medium hover:bg-surface"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-8">
      <div className="flex min-h-8 items-center">
        <h1 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Repository issues
        </h1>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {state.repository.ownerAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.repository.ownerAvatarUrl}
              alt=""
              className="size-10 rounded-full bg-surface"
            />
          ) : (
            <div
              className="size-10 rounded-full bg-surface"
              aria-hidden="true"
            />
          )}
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold">
              {state.repository.fullName}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              {state.repository.private ? (
                <Lock className="size-3" aria-hidden="true" />
              ) : (
                <Unlock className="size-3" aria-hidden="true" />
              )}
              {state.repository.private ? "Private" : "Public"}
            </p>
          </div>
        </div>
        <a
          href={state.repository.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-sm font-medium hover:bg-surface"
        >
          <FolderGit className="size-4" aria-hidden="true" />
          View repository
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-8 flex gap-1 border-b border-border">
        {ISSUE_STATES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => changeIssueState(option.value)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              issueState === option.value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {issueActionError ? (
        <div
          role="alert"
          className="mt-4 rounded-sm border border-amber-800/70 bg-amber-950/30 px-3 py-2 text-sm text-amber-100"
        >
          {issueActionError}
        </div>
      ) : null}

      {state.issues.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-border py-14 text-center">
          <p className="text-sm font-medium">
            {issueState === "all"
              ? "No issues found"
              : `No ${issueState} issues`}
          </p>
          <p className="mt-1 text-sm text-muted">
            Issues created in GitHub will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-sm border border-border">
          {state.issues.map((issue) => (
            <button
              key={issue.id}
              type="button"
              disabled={resolvingIssueNumber !== null}
              onClick={() => void openIssueInvestigation(issue.number)}
              className="flex w-full gap-3 border-b border-border px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-surface disabled:cursor-wait disabled:opacity-60"
            >
              <span
                className={`mt-1 size-2.5 shrink-0 rounded-full ${
                  issue.state === "open" ? "bg-emerald-500" : "bg-violet-500"
                }`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-medium">{issue.title}</h3>
                  <span className="shrink-0 text-xs text-muted">
                    {resolvingIssueNumber === issue.number
                      ? "Opening investigation..."
                      : `#${issue.number}`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Opened {formatIssueDate(issue.createdAt)}
                  {issue.author ? ` by ${issue.author.login}` : ""}
                </p>
                {issue.labels.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {issue.labels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-muted"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => changePage(page - 1)}
          className="h-9 rounded-sm border border-border px-3 text-sm font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-xs text-muted">Page {page}</span>
        <button
          type="button"
          disabled={!state.hasNextPage}
          onClick={() => changePage(page + 1)}
          className="h-9 rounded-sm border border-border px-3 text-sm font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  );
}

function RepositoryIssuesLoading() {
  return (
    <section aria-label="Loading repository issues" role="status">
      <div className="h-8 w-32 animate-pulse rounded-sm bg-surface" />
      <div className="mt-6 h-12 w-72 animate-pulse rounded-sm bg-surface" />
      <div className="mt-8 h-10 animate-pulse rounded-sm bg-surface" />
      <div className="mt-5 grid gap-px overflow-hidden rounded-sm border border-border bg-border">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-20 animate-pulse bg-surface" />
        ))}
      </div>
    </section>
  );
}

function formatIssueDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "recently"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}
