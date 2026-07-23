import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ApiClientError } from "../api";
import type { Investigation, InvestigationStatus } from "../types";

const serviceMocks = vi.hoisted(() => ({
  getInvestigation: vi.fn(),
}));

vi.mock("../investigation-service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../investigation-service")>();
  return {
    ...actual,
    getInvestigation: serviceMocks.getInvestigation,
    nextInvestigationPollDelay: () => 25,
  };
});

import InvestigationDetail from "./InvestigationDetail";

const INVESTIGATION_ID = "inv_01K123456789AB";

function investigation(status: InvestigationStatus): Investigation {
  return {
    investigationId: INVESTIGATION_ID,
    issueTitle: "Broken dashboard",
    status,
    error: status === "failed" ? "The fix could not be verified." : null,
    updatedAt: "2026-07-23T00:00:00.000Z",
    version: status === "active" ? 1 : 2,
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

function modified(status: InvestigationStatus) {
  return {
    status: "modified" as const,
    investigation: investigation(status),
    etag: `W/"${status}"`,
  };
}

afterEach(() => {
  cleanup();
  serviceMocks.getInvestigation.mockReset();
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
      undefined,
      expect.objectContaining({ etag: 'W/"active"' }),
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
});
