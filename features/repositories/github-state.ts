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

export function toggleSelectedRepositoryId(
  selectedRepositoryIds: string[],
  repositoryId: string,
) {
  return selectedRepositoryIds.includes(repositoryId)
    ? selectedRepositoryIds.filter((id) => id !== repositoryId)
    : [...selectedRepositoryIds, repositoryId];
}

export function getSelectedRepositories(
  repositories: ConnectedRepository[],
  selectedRepositoryIds: string[],
) {
  const selectedIds = new Set(selectedRepositoryIds);
  return repositories.filter((repository) => selectedIds.has(repository.id));
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
