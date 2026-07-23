import { ApiClientError } from "./api";
import {
  MOCK_INSTALLATIONS,
  MOCK_ISSUES,
  MOCK_REPOSITORIES,
} from "./mock-data";
import { MOCK_ISSUE_INVESTIGATION_IDS } from "./mock-investigations";
import type {
  ConnectedRepositoriesResponse,
  GitHubIssueState,
  IssueInvestigationResponse,
  RepositoryIssuesResponse,
} from "./types";

/* ------------------------------------------------------------------
   MOCK SERVICE LAYER — UI-only phase.
   Function names, signatures and response shapes match the real service
   (backed by GET /github/repositories, GET /github/repositories/:id/issues,
   POST /github/install, GET …/issues/:n/investigation on the Sherlock
   backend). Data integration replaces only the bodies below; the artificial
   latency exists so loading skeletons render.
------------------------------------------------------------------- */

const MOCK_LATENCY_MS = 450;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getConnectedRepositories(): Promise<ConnectedRepositoriesResponse> {
  await delay(MOCK_LATENCY_MS);
  return {
    repositories: MOCK_REPOSITORIES,
    installations: MOCK_INSTALLATIONS,
  };
}

/* Real flow: POST /github/install returns a per-user installation URL.
   Until then, the existing onboarding page owns GitHub App installation. */
export async function getGitHubInstallUrl(): Promise<string> {
  await delay(150);
  return "/onboarding";
}

export async function getRepositoryIssues(
  repositoryId: number,
  options: {
    state?: GitHubIssueState;
    page?: number;
    perPage?: number;
  } = {},
): Promise<RepositoryIssuesResponse> {
  await delay(MOCK_LATENCY_MS);

  const state = options.state || "open";
  const page = options.page || 1;
  const perPage = options.perPage || 30;

  const allIssues = MOCK_ISSUES[repositoryId] ?? [];
  const filtered =
    state === "all"
      ? allIssues
      : allIssues.filter((issue) => issue.state === state);
  const start = (page - 1) * perPage;

  return {
    issues: filtered.slice(start, start + perPage),
    pagination: {
      page,
      perPage,
      hasNextPage: start + perPage < filtered.length,
    },
  };
}

/* Issues listed in MOCK_ISSUE_INVESTIGATION_IDS open their mock
   investigation; the rest 404 and exercise the workspace's
   "comment “investigate” on the issue first" notice. */
export async function getIssueInvestigation(
  repositoryId: number,
  issueNumber: number,
): Promise<IssueInvestigationResponse> {
  await delay(MOCK_LATENCY_MS);

  const investigationId =
    MOCK_ISSUE_INVESTIGATION_IDS[repositoryId]?.[issueNumber];
  if (!investigationId) {
    throw new ApiClientError(
      `No investigation found for issue #${issueNumber} in repository ${repositoryId}.`,
      404,
    );
  }

  return {
    investigationId,
    status: "found",
    statusUrl: `/investigations/${investigationId}`,
  };
}
