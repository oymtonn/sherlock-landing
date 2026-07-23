import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ApiClientError } from "../api";
import type { Investigation, InvestigationStatus } from "../types";

const serviceMocks = vi.hoisted(() => ({
  getInvestigation: vi.fn(),
  getExactInvestigationDiff: vi.fn(),
}));

vi.mock("../investigation-service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../investigation-service")>();
  return {
    ...actual,
    getInvestigation: serviceMocks.getInvestigation,
    getExactInvestigationDiff: serviceMocks.getExactInvestigationDiff,
    nextInvestigationPollDelay: () => 25,
  };
});

import InvestigationDetail, {
  SIGNED_MEDIA_REFRESH_INTERVAL_MS,
} from "./InvestigationDetail";

const INVESTIGATION_ID = "inv_01K123456789AB";

function investigation(
  status: InvestigationStatus,
  version = status === "active" ? 1 : 2,
): Investigation {
  return {
    investigationId: INVESTIGATION_ID,
    issueTitle: "Broken dashboard",
    status,
    error: status === "failed" ? "The fix could not be verified." : null,
    updatedAt: "2026-07-23T00:00:00.000Z",
    version,
    timeline: [],
    evidence: {
      before: {
        replay: {
          status: "unavailable",
          videoUrl: null,
          posterUrl: null,
          error: null,
        },
        screenshots: [],
      },
      after: {
        replay: {
          status: "unavailable",
          videoUrl: null,
          posterUrl: null,
          error: null,
        },
        screenshots: [],
      },
    },
    fix: null,
    pullRequest: null,
  };
}

function investigationWithMedia(
  status: InvestigationStatus,
  version: number,
  suffix: string,
): Investigation {
  const value = investigation(status, version);
  value.evidence.before = {
    replay: {
      status: "available",
      videoUrl: `https://signed.example/replay-${suffix}.webm`,
      posterUrl: `https://signed.example/poster-${suffix}.png`,
      error: null,
    },
    screenshots: [
      {
        id: "capture-1",
        title: "Before capture",
        status: "ready",
        url: `https://signed.example/capture-${suffix}.png`,
        error: null,
      },
    ],
  };
  return value;
}

function modified(
  statusOrInvestigation: InvestigationStatus | Investigation,
) {
  const value =
    typeof statusOrInvestigation === "string"
      ? investigation(statusOrInvestigation)
      : statusOrInvestigation;
  return {
    status: "modified" as const,
    investigation: value,
    etag: `W/"${value.version}"`,
  };
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: "visible",
  });
  serviceMocks.getInvestigation.mockReset();
  serviceMocks.getExactInvestigationDiff.mockReset();
});

describe("investigation UI states", () => {
  test("renders the loading state while the first request is pending", () => {
    serviceMocks.getInvestigation.mockReturnValue(new Promise(() => {}));
    render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);
    expect(
      screen.getByRole("status", { name: "Loading investigation" }),
    ).toBeInTheDocument();
  });

  test("renders not-found and initial error states", async () => {
    serviceMocks.getInvestigation.mockRejectedValueOnce(
      new ApiClientError("Investigation not found.", 404),
    );
    const view = render(
      <InvestigationDetail investigationId={INVESTIGATION_ID} />,
    );
    expect(
      await screen.findByRole("heading", { name: "Investigation not found" }),
    ).toBeInTheDocument();

    view.unmount();
    serviceMocks.getInvestigation.mockRejectedValueOnce(
      new ApiClientError("Sherlock is temporarily unavailable.", 503),
    );
    render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);
    expect(
      await screen.findByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
  });

  test.each(["completed", "failed"] as const)(
    "renders the %s terminal state",
    async (status) => {
      serviceMocks.getInvestigation.mockResolvedValue(modified(status));
      render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);
      expect(await screen.findByText(INVESTIGATION_ID)).toBeInTheDocument();
      expect(screen.getByText(status === "completed" ? "Completed" : "Failed"))
        .toBeInTheDocument();
    },
  );

  test("polls active work with ETags and stops after completion", async () => {
    serviceMocks.getInvestigation
      .mockResolvedValueOnce(modified("active"))
      .mockResolvedValueOnce(modified("completed"));
    render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);

    expect(await screen.findByText("Active")).toBeInTheDocument();
    expect(await screen.findByText("Completed")).toBeInTheDocument();
    expect(serviceMocks.getInvestigation).toHaveBeenNthCalledWith(
      2,
      INVESTIGATION_ID,
      expect.objectContaining({ etag: 'W/"1"' }),
    );
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(serviceMocks.getInvestigation).toHaveBeenCalledTimes(2);
  });

  test("keeps rendered evidence during a recoverable polling failure", async () => {
    serviceMocks.getInvestigation
      .mockResolvedValueOnce(modified("active"))
      .mockRejectedValueOnce(new ApiClientError("temporary", 503))
      .mockResolvedValueOnce(modified("completed"));
    render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);

    expect(await screen.findByText(INVESTIGATION_ID)).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Live updates are temporarily unavailable. Retrying automatically.",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Completed")).toBeInTheDocument(),
    );
  });

  test("renews signed media on terminal investigations without an ETag", async () => {
    vi.useFakeTimers();
    serviceMocks.getInvestigation
      .mockResolvedValueOnce(
        modified(investigationWithMedia("completed", 4, "old")),
      )
      .mockResolvedValueOnce(
        modified(investigationWithMedia("completed", 4, "renewed")),
      );
    render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SIGNED_MEDIA_REFRESH_INTERVAL_MS);
    });

    expect(serviceMocks.getInvestigation).toHaveBeenCalledTimes(2);
    expect(serviceMocks.getInvestigation).toHaveBeenNthCalledWith(
      2,
      INVESTIGATION_ID,
      expect.objectContaining({ etag: null }),
    );
    expect(
      screen.getAllByAltText("Before capture screenshot")[0],
    ).toHaveAttribute(
      "src",
      "https://signed.example/capture-renewed.png",
    );
  });

  test("renews media when a long-hidden tab becomes visible", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-23T00:00:00.000Z"));
    serviceMocks.getInvestigation
      .mockResolvedValueOnce(
        modified(investigationWithMedia("completed", 4, "old")),
      )
      .mockResolvedValueOnce(
        modified(investigationWithMedia("completed", 4, "visible")),
      );
    render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);
    await act(async () => {
      await Promise.resolve();
    });

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    vi.setSystemTime(
      new Date(
        Date.parse("2026-07-23T00:00:00.000Z") +
          SIGNED_MEDIA_REFRESH_INTERVAL_MS +
          1,
      ),
    );
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });

    expect(serviceMocks.getInvestigation).toHaveBeenCalledTimes(2);
    expect(serviceMocks.getInvestigation).toHaveBeenNthCalledWith(
      2,
      INVESTIGATION_ID,
      expect.objectContaining({ etag: null }),
    );
  });

  test("recovers a broken screenshot with an unconditional media refresh", async () => {
    vi.useFakeTimers();
    serviceMocks.getInvestigation
      .mockResolvedValueOnce(
        modified(investigationWithMedia("completed", 4, "expired")),
      )
      .mockResolvedValueOnce(
        modified(investigationWithMedia("completed", 4, "recovered")),
      );
    render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      fireEvent.error(screen.getAllByAltText("Before capture screenshot")[0]);
      await Promise.resolve();
    });

    expect(serviceMocks.getInvestigation).toHaveBeenCalledTimes(2);
    expect(serviceMocks.getInvestigation).toHaveBeenNthCalledWith(
      2,
      INVESTIGATION_ID,
      expect.objectContaining({ etag: null }),
    );
    expect(
      screen.getAllByAltText("Before capture screenshot")[0],
    ).toHaveAttribute(
      "src",
      "https://signed.example/capture-recovered.png",
    );
  });

  test("recovers a broken replay with an unconditional media refresh", async () => {
    vi.useFakeTimers();
    serviceMocks.getInvestigation
      .mockResolvedValueOnce(
        modified(investigationWithMedia("completed", 4, "expired")),
      )
      .mockResolvedValueOnce(
        modified(investigationWithMedia("completed", 4, "recovered")),
      );
    const view = render(
      <InvestigationDetail investigationId={INVESTIGATION_ID} />,
    );
    await act(async () => {
      await Promise.resolve();
    });

    const video = view.container.querySelector("video");
    expect(video).not.toBeNull();
    await act(async () => {
      fireEvent.error(video as HTMLVideoElement);
      await Promise.resolve();
    });

    expect(serviceMocks.getInvestigation).toHaveBeenCalledTimes(2);
    expect(serviceMocks.getInvestigation).toHaveBeenNthCalledWith(
      2,
      INVESTIGATION_ID,
      expect.objectContaining({ etag: null }),
    );
    expect(view.container.querySelector("video")).toHaveAttribute(
      "src",
      "https://signed.example/replay-recovered.webm",
    );
  });

  test("rejects an older terminal response that completes after a newer snapshot", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-23T00:00:00.000Z"));
    let resolveNewer!: (value: ReturnType<typeof modified>) => void;
    let resolveOlder!: (value: ReturnType<typeof modified>) => void;
    const newer = new Promise<ReturnType<typeof modified>>((resolve) => {
      resolveNewer = resolve;
    });
    const older = new Promise<ReturnType<typeof modified>>((resolve) => {
      resolveOlder = resolve;
    });
    serviceMocks.getInvestigation
      .mockResolvedValueOnce(modified(investigation("active", 5)))
      .mockReturnValueOnce(newer)
      .mockReturnValueOnce(older);
    render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);
    await act(async () => {
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(25);
    });

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    vi.setSystemTime(
      new Date(
        Date.parse("2026-07-23T00:00:00.000Z") +
          SIGNED_MEDIA_REFRESH_INTERVAL_MS +
          1,
      ),
    );
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });

    await act(async () => {
      resolveNewer(modified(investigation("active", 7)));
      await Promise.resolve();
      resolveOlder(modified(investigation("completed", 6)));
      await Promise.resolve();
    });

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.queryByText("Completed")).not.toBeInTheDocument();
  });

  test("retries exact-diff hydration independently with a bounded policy", async () => {
    vi.useFakeTimers();
    const value = investigation("completed", 4);
    value.fix = {
      summary: "Guard the session.",
      diff: "preview",
      diffTruncated: true,
    };
    serviceMocks.getInvestigation.mockResolvedValueOnce(modified(value));
    serviceMocks.getExactInvestigationDiff
      .mockRejectedValueOnce(new ApiClientError("temporary", 503))
      .mockRejectedValueOnce(new ApiClientError("temporary", 503))
      .mockResolvedValueOnce({
        diff: "diff --git a/a.ts b/a.ts\n",
        diffTruncated: false,
      });
    render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);

    await act(async () => {
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(500);
      await vi.advanceTimersByTimeAsync(1_500);
    });

    expect(serviceMocks.getExactInvestigationDiff).toHaveBeenCalledTimes(3);
    expect(
      screen.queryByText(
        "The backend truncated this diff. Some changed lines are not shown.",
      ),
    ).not.toBeInTheDocument();
  });

  test("stops polling and exposes sign-in when a refresh returns 401", async () => {
    vi.useFakeTimers();
    serviceMocks.getInvestigation
      .mockResolvedValueOnce(modified("active"))
      .mockRejectedValueOnce(new ApiClientError("expired", 401));
    render(<InvestigationDetail investigationId={INVESTIGATION_ID} />);

    await act(async () => {
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(25);
    });

    expect(
      screen.getByRole("link", { name: "Sign in again" }),
    ).toHaveAttribute("href", "/");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100_000);
    });
    expect(serviceMocks.getInvestigation).toHaveBeenCalledTimes(2);
  });
});
