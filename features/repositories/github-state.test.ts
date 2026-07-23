import { describe, expect, test } from "vitest";
import {
  authorizedRepositoryId,
  getSidebarRepositories,
  getGitHubCallbackNotice,
  repositoryIdFromDashboardPath,
  removeGitHubCallbackParams,
} from "./github-state";

describe("repository state", () => {
  const repositories = Array.from({ length: 8 }, (_, index) => ({
    id: String(index + 1),
    fullName: `owner/repository-${index + 1}`,
    htmlUrl: `https://github.com/owner/repository-${index + 1}`,
    private: false,
    ownerAvatarUrl: null,
    installationId: "99",
  }));

  test("builds a bounded subset with the authorized selection first", () => {
    expect(getSidebarRepositories(repositories, "8").map(({ id }) => id))
      .toEqual(["8", "1", "2", "3", "4", "5"]);
    expect(getSidebarRepositories(repositories, "not-authorized").map(({ id }) => id))
      .toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(authorizedRepositoryId(repositories, "8")).toBe("8");
    expect(authorizedRepositoryId(repositories, "999")).toBeNull();
  });

  test("reads only decimal repository ids from dashboard routes", () => {
    expect(repositoryIdFromDashboardPath("/dashboard/9007199254740993/"))
      .toBe("9007199254740993");
    expect(repositoryIdFromDashboardPath("/dashboard/not-an-id")).toBeNull();
    expect(repositoryIdFromDashboardPath("/investigations/inv_123")).toBeNull();
  });

  test("recognizes and removes the real installation callback result", () => {
    expect(getGitHubCallbackNotice("success")).toEqual({
      type: "success",
      message: "GitHub access was updated successfully.",
    });
    expect(
      removeGitHubCallbackParams(
        "https://app.example/dashboard?installation=success&code=secret&keep=1",
      ),
    ).toBe("/dashboard?keep=1");
  });
});
