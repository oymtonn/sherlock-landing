import type {
  ConnectedRepositoriesResponse,
  ConnectedRepository,
} from "./types";

export type RepositoryLoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "ready" } & ConnectedRepositoriesResponse);

export const INITIAL_REPOSITORY_LOAD_STATE: RepositoryLoadState = {
  status: "loading",
};

export const SIDEBAR_REPOSITORY_LIMIT = 6;

export function getRepositoryContentKind(state: RepositoryLoadState) {
  if (state.status !== "ready") return state.status;
  return state.repositories.length === 0 ? "empty" : "repositories";
}

export async function beginGitHubInstallation(
  getInstallUrl: () => Promise<string>,
  redirect: (url: string) => void,
) {
  const installUrl = await getInstallUrl();
  redirect(installUrl);
}

export function getAddRepositoryAction(
  state: RepositoryLoadState,
): "disabled" | "install" | "browse" {
  if (state.status !== "ready") return "disabled";
  return state.installations.length === 0 ? "install" : "browse";
}

export function filterRepositories(
  repositories: ConnectedRepository[],
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return repositories;

  return repositories.filter((repository) =>
    repository.fullName.toLocaleLowerCase().includes(normalizedQuery),
  );
}

export function repositoryIdFromDashboardPath(pathname: string) {
  const match = pathname.match(/^\/dashboard\/([0-9]+)\/?$/);
  return match?.[1] ?? null;
}

export function authorizedRepositoryId(
  repositories: ConnectedRepository[],
  repositoryId: string | null | undefined,
) {
  return repositoryId &&
    repositories.some((repository) => repository.id === repositoryId)
    ? repositoryId
    : null;
}

export function getSidebarRepositories(
  repositories: ConnectedRepository[],
  selectedRepositoryId: string | null,
  limit = SIDEBAR_REPOSITORY_LIMIT,
) {
  if (limit <= 0) return [];

  const selectedId = authorizedRepositoryId(
    repositories,
    selectedRepositoryId,
  );
  if (!selectedId) return repositories.slice(0, limit);

  const selected = repositories.find(
    (repository) => repository.id === selectedId,
  );
  if (!selected) return repositories.slice(0, limit);

  return [
    selected,
    ...repositories.filter((repository) => repository.id !== selectedId),
  ].slice(0, limit);
}

export function getGitHubCallbackNotice(
  github: string | undefined,
): { type: "success" | "error"; message: string } | null {
  if (github === "installed" || github === "success") {
    return {
      type: "success",
      message: "GitHub access was updated successfully.",
    };
  }

  if (github === "error") {
    return {
      type: "error",
      message: "GitHub access could not be updated. Please try again.",
    };
  }

  return null;
}

export function removeGitHubCallbackParams(urlValue: string) {
  const url = new URL(urlValue);
  url.searchParams.delete("github");
  url.searchParams.delete("installation");
  url.searchParams.delete("code");
  return `${url.pathname}${url.search}${url.hash}`;
}
