import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Sidebar from "./Sidebar";
import { getConnectedRepositories } from "@/features/repositories/github-service";
import type {
  ConnectedRepositoriesResponse,
  ConnectedRepository,
} from "@/features/repositories/types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/features/auth/UserMenu", () => ({
  default: () => <div>Signed-in user</div>,
}));

vi.mock("@/features/repositories/github-service", () => ({
  getConnectedRepositories: vi.fn(),
  getGitHubInstallUrl: vi.fn(),
}));

const repository: ConnectedRepository = {
  id: "9007199254740993",
  fullName: "sherlock/private",
  htmlUrl: "https://github.com/sherlock/private",
  private: true,
  ownerAvatarUrl: null,
  installationId: "9007199254740995",
};

const installation = {
  id: "9007199254740995",
  accountLogin: "sherlock",
  accountType: "Organization",
  manageUrl:
    "https://github.com/organizations/sherlock/settings/installations/9007199254740995",
};

const authorizedResponse: ConnectedRepositoriesResponse = {
  repositories: [repository],
  installations: [installation],
};

const emptyResponse: ConnectedRepositoriesResponse = {
  repositories: [],
  installations: [installation],
};

const getConnectedRepositoriesMock = vi.mocked(getConnectedRepositories);

beforeEach(() => {
  window.history.replaceState({}, "", "/dashboard");
  window.localStorage.clear();
  getConnectedRepositoriesMock.mockReset();
});

afterEach(cleanup);

describe("Sidebar repository hydration", () => {
  test("reloads authorized repositories after a refresh/remount", async () => {
    getConnectedRepositoriesMock.mockResolvedValue(authorizedResponse);

    const firstMount = render(<Sidebar />);
    expect(
      await screen.findByTitle("sherlock/private"),
    ).toBeInTheDocument();
    firstMount.unmount();

    render(<Sidebar />);
    expect(
      await screen.findByTitle("sherlock/private"),
    ).toBeInTheDocument();
    expect(getConnectedRepositoriesMock).toHaveBeenCalledTimes(2);
  });

  test("hydrates repositories when a restored session request completes", async () => {
    let resolveRepositories:
      | ((response: ConnectedRepositoriesResponse) => void)
      | undefined;
    getConnectedRepositoriesMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRepositories = resolve;
      }),
    );

    render(<Sidebar />);
    expect(screen.queryByTitle("sherlock/private")).not.toBeInTheDocument();

    resolveRepositories?.(authorizedResponse);

    expect(
      await screen.findByTitle("sherlock/private"),
    ).toBeInTheDocument();
  });

  test("empty initial client state cannot overwrite fetched repositories", async () => {
    getConnectedRepositoriesMock.mockResolvedValue(authorizedResponse);

    render(<Sidebar />);

    expect(
      await screen.findByTitle("sherlock/private"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByTitle("sherlock/private")).toHaveLength(1),
    );
  });

  test("ignores stale client storage and treats the backend list as authoritative", async () => {
    window.localStorage.setItem(
      "sherlock:selected-repository-ids",
      JSON.stringify(["111"]),
    );
    getConnectedRepositoriesMock.mockResolvedValue(authorizedResponse);

    render(<Sidebar />);

    expect(
      await screen.findByTitle("sherlock/private"),
    ).toBeInTheDocument();
    expect(screen.queryByTitle("stale/repository")).not.toBeInTheDocument();
  });

  test("removes repositories when the backend no longer authorizes them", async () => {
    getConnectedRepositoriesMock
      .mockResolvedValueOnce(authorizedResponse)
      .mockResolvedValueOnce(emptyResponse);

    const firstMount = render(<Sidebar />);
    expect(
      await screen.findByTitle("sherlock/private"),
    ).toBeInTheDocument();
    firstMount.unmount();

    render(<Sidebar />);
    await waitFor(() =>
      expect(getConnectedRepositoriesMock).toHaveBeenCalledTimes(2),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Add repository" }),
      ).toBeEnabled(),
    );
    expect(screen.queryByTitle("sherlock/private")).not.toBeInTheDocument();
  });
});
