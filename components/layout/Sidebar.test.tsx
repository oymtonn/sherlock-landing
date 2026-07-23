import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Sidebar from "./Sidebar";
import { getConnectedRepositories } from "@/features/repositories/github-service";
import type {
  ConnectedRepositoriesResponse,
  ConnectedRepository,
} from "@/features/repositories/types";

const navigation = vi.hoisted(() => ({
  pathname: "/dashboard",
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({
    push: navigation.push,
    replace: navigation.replace,
  }),
}));

vi.mock("@/features/auth/UserMenu", () => ({
  default: () => <div>Signed-in user</div>,
}));

vi.mock("@/features/repositories/github-service", () => ({
  getConnectedRepositories: vi.fn(),
  getGitHubInstallUrl: vi.fn(),
}));

function makeRepository(index: number): ConnectedRepository {
  return {
    id: String(9007199254740000 + index),
    fullName: `sherlock/repository-${index}`,
    htmlUrl: `https://github.com/sherlock/repository-${index}`,
    private: index % 2 === 0,
    ownerAvatarUrl: null,
    installationId: "9007199254740995",
  };
}

const repositories = Array.from({ length: 8 }, (_, index) =>
  makeRepository(index + 1),
);

const installation = {
  id: "9007199254740995",
  accountLogin: "sherlock",
  accountType: "Organization",
  manageUrl:
    "https://github.com/organizations/sherlock/settings/installations/9007199254740995",
};

function response(
  authorizedRepositories = repositories,
): ConnectedRepositoriesResponse {
  return {
    repositories: authorizedRepositories,
    installations: [installation],
  };
}

const getConnectedRepositoriesMock = vi.mocked(getConnectedRepositories);

beforeEach(() => {
  navigation.pathname = "/dashboard";
  navigation.push.mockReset();
  navigation.replace.mockReset();
  window.history.replaceState({}, "", "/dashboard");
  window.localStorage.clear();
  getConnectedRepositoriesMock.mockReset();
});

afterEach(cleanup);

describe("Sidebar authorized repository browsing", () => {
  test("reloads authorized repositories after refresh and session restoration", async () => {
    let resolveRepositories:
      | ((value: ConnectedRepositoriesResponse) => void)
      | undefined;
    getConnectedRepositoriesMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRepositories = resolve;
      }),
    );

    const firstMount = render(<Sidebar />);
    expect(screen.queryByTitle(repositories[0].fullName)).not.toBeInTheDocument();
    resolveRepositories?.(response([repositories[0]]));
    expect(
      await screen.findByTitle(repositories[0].fullName),
    ).toBeInTheDocument();
    firstMount.unmount();

    getConnectedRepositoriesMock.mockResolvedValue(response([repositories[0]]));
    render(<Sidebar />);
    expect(
      await screen.findByTitle(repositories[0].fullName),
    ).toBeInTheDocument();
    expect(getConnectedRepositoriesMock).toHaveBeenCalledTimes(2);
  });

  test("limits the sidebar and keeps the current repository first", async () => {
    navigation.pathname = `/dashboard/${repositories[7].id}`;
    getConnectedRepositoriesMock.mockResolvedValue(response());

    render(<Sidebar />);

    expect(
      await screen.findByTitle(repositories[7].fullName),
    ).toBeInTheDocument();
    const sidebarRepositoryLinks = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.startsWith("/dashboard/"),
    );
    expect(sidebarRepositoryLinks).toHaveLength(6);
    expect(sidebarRepositoryLinks[0]).toHaveAttribute(
      "title",
      repositories[7].fullName,
    );
    expect(
      screen.getByRole("button", { name: "Browse repositories" }),
    ).toBeInTheDocument();
  });

  test("picker lists every backend-authorized repository and searches by owner/name", async () => {
    getConnectedRepositoriesMock.mockResolvedValue(response());
    render(<Sidebar />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Browse repositories" }),
    );

    const picker = within(screen.getByRole("dialog"));
    for (const repository of repositories) {
      expect(picker.getByText(repository.fullName)).toBeInTheDocument();
    }

    fireEvent.change(picker.getByRole("searchbox"), {
      target: { value: "repository-8" },
    });
    expect(picker.getByText(repositories[7].fullName)).toBeInTheDocument();
    expect(picker.queryByText(repositories[0].fullName)).not.toBeInTheDocument();

    fireEvent.change(picker.getByRole("searchbox"), {
      target: { value: "does-not-exist" },
    });
    expect(
      picker.getByText("No authorized repositories match your search"),
    ).toBeInTheDocument();
  });

  test("selecting a repository navigates and promotes it into the compact subset", async () => {
    getConnectedRepositoriesMock.mockResolvedValue(response());
    render(<Sidebar />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Browse repositories" }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(repositories[7].fullName),
      }),
    );

    expect(navigation.push).toHaveBeenCalledWith(
      `/dashboard/${repositories[7].id}`,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTitle(repositories[7].fullName)).toBeInTheDocument();
    expect(window.localStorage.getItem("sherlock:last-selected-repository-id"))
      .toBe(repositories[7].id);
  });

  test("stale localStorage cannot create or reveal repositories", async () => {
    window.localStorage.setItem(
      "sherlock:last-selected-repository-id",
      "111",
    );
    window.localStorage.setItem(
      "sherlock:selected-repository-ids",
      JSON.stringify(["111"]),
    );
    getConnectedRepositoriesMock.mockResolvedValue(response([repositories[0]]));

    render(<Sidebar />);

    expect(
      await screen.findByTitle(repositories[0].fullName),
    ).toBeInTheDocument();
    expect(screen.queryByTitle("stale/repository")).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem("sherlock:last-selected-repository-id"),
    ).toBeNull();
  });

  test("removed repositories disappear after a backend refetch/remount", async () => {
    getConnectedRepositoriesMock
      .mockResolvedValueOnce(response([repositories[0], repositories[1]]))
      .mockResolvedValueOnce(response([repositories[0]]));

    const firstMount = render(<Sidebar />);
    expect(
      await screen.findByTitle(repositories[1].fullName),
    ).toBeInTheDocument();
    firstMount.unmount();

    render(<Sidebar />);
    await waitFor(() =>
      expect(getConnectedRepositoriesMock).toHaveBeenCalledTimes(2),
    );
    await screen.findByTitle(repositories[0].fullName);
    expect(screen.queryByTitle(repositories[1].fullName)).not.toBeInTheDocument();
  });

  test("refetches and shows newly authorized repositories after GitHub returns", async () => {
    window.history.replaceState(
      {},
      "",
      "/dashboard?installation=success",
    );
    getConnectedRepositoriesMock.mockResolvedValue(
      response([...repositories, makeRepository(9)]),
    );

    render(<Sidebar />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Browse repositories" }),
    );

    expect(screen.getByText("sherlock/repository-9")).toBeInTheDocument();
    expect(navigation.replace).toHaveBeenCalledWith("/dashboard", {
      scroll: false,
    });
  });

  test("shows no-access and non-overflow states without an unnecessary picker", async () => {
    getConnectedRepositoriesMock.mockResolvedValue(response([]));
    const empty = render(<Sidebar />);
    expect(
      await screen.findByText("Sherlock currently has no repository access."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Manage GitHub access" }),
    ).toHaveAttribute("href", installation.manageUrl);
    expect(
      screen.queryByRole("button", { name: "Browse repositories" }),
    ).not.toBeInTheDocument();
    empty.unmount();

    getConnectedRepositoriesMock.mockResolvedValue(
      response(repositories.slice(0, 6)),
    );
    render(<Sidebar />);
    await screen.findByTitle(repositories[0].fullName);
    expect(
      screen.queryByRole("button", { name: "Browse repositories" }),
    ).not.toBeInTheDocument();
  });
});
