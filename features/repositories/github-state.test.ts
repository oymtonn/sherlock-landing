import { describe, expect, test } from "vitest";
import {
  getGitHubCallbackNotice,
  getSelectedRepositories,
  removeGitHubCallbackParams,
  toggleSelectedRepositoryId,
} from "./github-state";

const repositories = [
  {
    id: "9007199254740993",
    fullName: "sherlock/private",
    htmlUrl: "https://github.com/sherlock/private",
    private: true,
    ownerAvatarUrl: null,
    installationId: "9007199254740995",
  },
];

describe("repository state", () => {
  test("keeps GitHub ids lossless as strings", () => {
    const selected = toggleSelectedRepositoryId([], repositories[0].id);
    expect(selected).toEqual(["9007199254740993"]);
    expect(getSelectedRepositories(repositories, selected)).toEqual(
      repositories,
    );
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
