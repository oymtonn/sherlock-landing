import { describe, expect, test } from "vitest";
import {
  getGitHubCallbackNotice,
  removeGitHubCallbackParams,
} from "./github-state";

describe("repository state", () => {
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
