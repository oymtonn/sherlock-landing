import { afterEach, describe, expect, test, vi } from "vitest";

const proxyDashboardRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/backend/dashboard-proxy", () => ({
  proxyDashboardRequest,
}));

import { GET } from "./route";

afterEach(() => {
  proxyDashboardRequest.mockReset();
});

describe("investigation BFF route", () => {
  test("forwards the conditional ETag and preserves an empty 304", async () => {
    proxyDashboardRequest.mockResolvedValue(new Response(null, { status: 304 }));
    const response = await GET(
      new Request(
        "https://frontend.example/api/investigations/inv_01K123456789AB/",
        { headers: { "If-None-Match": 'W/"investigation-6"' } },
      ),
      {
        params: Promise.resolve({
          investigationId: "inv_01K123456789AB",
        }),
      },
    );

    expect(proxyDashboardRequest).toHaveBeenCalledWith(
      "/api/investigations/inv_01K123456789AB",
      { headers: { "If-None-Match": 'W/"investigation-6"' } },
    );
    expect(response.status).toBe(304);
    await expect(response.text()).resolves.toBe("");
  });
});
