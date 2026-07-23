import { ApiClientError } from "./api";
import type {
  ConnectedRepositoriesResponse,
  GitHubIssueState,
  IssueInvestigationResponse,
  RepositoryIssuesResponse,
} from "./types";

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiClientError("Sherlock is temporarily unavailable.");
  }
  if (!response.ok) {
    throw new ApiClientError(
      response.status === 401
        ? "Your session has expired. Sign in again."
        : response.status === 404
          ? "The requested GitHub resource is not available."
          : "Unable to load GitHub data. Please try again.",
      response.status,
    );
  }
  return (await response.json()) as T;
}

export async function getConnectedRepositories(): Promise<ConnectedRepositoriesResponse> {
  const [repositoriesResponse, installationsResponse] = await Promise.all([
    apiJson<{ repositories: ConnectedRepositoriesResponse["repositories"] }>(
      "/api/repositories/",
    ),
    apiJson<{
      installations: Array<{
        installationId: string;
        account: { login: string; type: string };
        status: string;
        manageUrl: string;
      }>;
    }>("/api/installations/"),
  ]);
  return {
    repositories: repositoriesResponse.repositories,
    installations: installationsResponse.installations
      .filter((installation) => installation.status === "active")
      .map((installation) => ({
        id: installation.installationId,
        accountLogin: installation.account.login,
        accountType: installation.account.type,
        manageUrl: installation.manageUrl,
      })),
  };
}

export async function getGitHubInstallUrl(): Promise<string> {
  const result = await apiJson<{ url: string }>("/api/installations/start/", {
    method: "POST",
  });
  const url = new URL(result.url);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    !url.pathname.startsWith("/apps/") ||
    !url.pathname.endsWith("/installations/new")
  ) {
    throw new ApiClientError("GitHub returned an invalid installation URL.");
  }
  return url.toString();
}

export async function getRepositoryIssues(
  repositoryId: string,
  options: {
    state?: GitHubIssueState;
    page?: number;
    perPage?: number;
  } = {},
): Promise<RepositoryIssuesResponse> {
  const state = options.state || "open";
  const page = options.page || 1;
  const perPage = options.perPage || 30;
  const query = new URLSearchParams({
    state,
    page: String(page),
    perPage: String(perPage),
  });
  return apiJson<RepositoryIssuesResponse>(
    `/api/repositories/${encodeURIComponent(repositoryId)}/issues/?${query}`,
  );
}

export async function getIssueInvestigation(
  repositoryId: string,
  issueNumber: number,
): Promise<IssueInvestigationResponse> {
  return apiJson<IssueInvestigationResponse>(
    `/api/repositories/${encodeURIComponent(repositoryId)}/issues/${issueNumber}/investigation/`,
  );
}
