import { afterEach, describe, expect, test, vi } from "vitest";
import {
  getInvestigation,
  nextInvestigationPollDelay,
  shouldPollInvestigation,
} from "./investigation-service";

const INVESTIGATION_ID = "inv_01K123456789AB";

function backendInvestigation(status: "active" | "completed" | "failed") {
  return {
    id: INVESTIGATION_ID,
    issueTitle: "Broken dashboard",
    status,
    error: null,
    updatedAt: "2026-07-23T00:00:00.000Z",
    version: status === "active" ? 2 : 3,
    timeline: [
      {
        id: "reproduce",
        label: "Reproduce",
        status: status === "active" ? "active" : "completed",
        message: "Reproducing the issue.",
        startedAt: "2026-07-23T00:00:00.000Z",
        finishedAt: null,
      },
    ],
    evidence: {
      before: {
        replay: {
          status: "available",
          videoUrl: "https://signed.example/before.webm",
        },
        screenshots: [
          {
            id: "media-1",
            title: "Before",
            status: "ready",
            url: "https://signed.example/before.png",
          },
        ],
      },
      after: { replay: { status: "pending" }, screenshots: [] },
    },
    fix: {
      summary: "Guard the missing session.",
      diff: "preview",
      diffTruncated: true,
    },
    pullRequest: null,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("investigation transport", () => {
  test("maps backend data and hydrates an authorized exact diff", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/diff/")) {
        return Response.json({
          diff: "diff --git a/a.ts b/a.ts\n",
          diffTruncated: false,
        });
      }
      return Response.json(backendInvestigation("completed"), {
        headers: { ETag: 'W/"investigation-3"' },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getInvestigation(INVESTIGATION_ID);

    expect(result.status).toBe("modified");
    if (result.status !== "modified") return;
    expect(result.etag).toBe('W/"investigation-3"');
    expect(result.investigation).toMatchObject({
      investigationId: INVESTIGATION_ID,
      status: "completed",
      version: 3,
      fix: {
        diff: "diff --git a/a.ts b/a.ts\n",
        diffTruncated: false,
      },
      evidence: {
        before: {
          replay: {
            status: "available",
            videoUrl: "https://signed.example/before.webm",
            posterUrl: null,
          },
        },
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("forwards ETags and handles a not-modified poll", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 304,
        headers: { ETag: 'W/"investigation-4"' },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getInvestigation(INVESTIGATION_ID, undefined, {
        etag: 'W/"investigation-4"',
      }),
    ).resolves.toEqual({
      status: "not-modified",
      etag: 'W/"investigation-4"',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/investigations/${INVESTIGATION_ID}/`,
      expect.objectContaining({
        headers: expect.objectContaining({
          "If-None-Match": 'W/"investigation-4"',
        }),
      }),
    );
  });

  test("preserves 404 for the not-found UI", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({ error: { code: "NOT_FOUND" } }, { status: 404 }),
      ),
    );

    await expect(getInvestigation(INVESTIGATION_ID)).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("investigation polling policy", () => {
  test("polls only active investigations", () => {
    expect(shouldPollInvestigation("active")).toBe(true);
    expect(shouldPollInvestigation("completed")).toBe(false);
    expect(shouldPollInvestigation("failed")).toBe(false);
  });

  test("backs off failures and slows hidden tabs", () => {
    expect(nextInvestigationPollDelay(0, false)).toBe(2_500);
    expect(nextInvestigationPollDelay(2, false)).toBe(10_000);
    expect(nextInvestigationPollDelay(20, false)).toBe(20_000);
    expect(nextInvestigationPollDelay(0, true)).toBe(10_000);
  });
});
