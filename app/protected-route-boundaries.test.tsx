import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import DashboardError from "./dashboard/error";
import DashboardLoading from "./dashboard/loading";
import InvestigationRouteError from "./investigations/error";
import InvestigationRouteLoading from "./investigations/loading";

afterEach(cleanup);

describe("protected route boundaries", () => {
  test.each([
    ["dashboard", DashboardError],
    ["investigation", InvestigationRouteError],
  ] as const)("renders a retryable %s backend failure", (_name, Boundary) => {
    const reset = vi.fn();
    render(<Boundary error={new Error("private backend detail")} reset={reset} />);

    expect(
      screen.getByRole("heading", {
        name: "Sherlock is temporarily unavailable",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("private backend detail")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  test("renders route-level loading states", () => {
    const dashboard = render(<DashboardLoading />);
    expect(
      screen.getByRole("status", { name: "Loading dashboard" }),
    ).toBeInTheDocument();
    dashboard.unmount();

    render(<InvestigationRouteLoading />);
    expect(
      screen.getByRole("status", { name: "Loading investigation" }),
    ).toBeInTheDocument();
  });
});
