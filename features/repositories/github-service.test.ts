import { afterEach, describe, expect, test, vi } from "vitest";
import { ApiClientError } from "./api";
import {
  getConnectedRepositories,
  getGitHubInstallUrl,
  getRepositoryIssues,
} from "./github-service";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GitHub dashboard transport", () => {
  test("combines authorized repositories with active installations", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/repositories/") {
          return Response.json({
            repositories: [
              {
                id: "555",
                fullName: "SherlockHQ/sherlock",
                htmlUrl: "https://github.com/SherlockHQ/sherlock",
                private: true,
                ownerAvatarUrl: null,
                installationId: "987654321",
              },
            ],
          });
        }
        return Response.json({
          installations: [
            {
              installationId: "987654321",
              account: { login: "SherlockHQ", type: "Organization" },
              status: "active",
              manageUrl:
                "https://github.com/organizations/SherlockHQ/settings/installations/987654321",
            },
            {
              installationId: "12",
              account: { login: "old", type: "User" },
              status: "suspended",
              manageUrl: "https://github.com/settings/installations/12",
            },
          ],
        });
      }),
    );

    await expect(getConnectedRepositories()).resolves.toMatchObject({
      repositories: [{ id: "555", installationId: "987654321" }],
      installations: [{ id: "987654321", accountLogin: "SherlockHQ" }],
    });
  });

  test("passes issue filters and preserves authorization failures", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          issues: [],
          pagination: { page: 2, perPage: 20, hasNextPage: false },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({ error: { code: "NOT_FOUND" } }, { status: 404 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await getRepositoryIssues("555", {
      state: "closed",
      page: 2,
      perPage: 20,
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/repositories/555/issues/?state=closed&page=2&perPage=20",
    );
    await expect(getRepositoryIssues("999")).rejects.toMatchObject({
      status: 404,
    });
  });

  test("accepts only the backend GitHub App installation URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({
            url: "https://github.com/apps/sherlock/installations/new?state=opaque",
          }),
        )
        .mockResolvedValueOnce(
          Response.json({ url: "https://attacker.example/install" }),
        ),
    );

    await expect(getGitHubInstallUrl()).resolves.toContain("github.com/apps/");
    await expect(getGitHubInstallUrl()).rejects.toBeInstanceOf(ApiClientError);
  });
});
