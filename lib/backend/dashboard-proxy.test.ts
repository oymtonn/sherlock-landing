import { afterEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  backendRequest: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("./client", () => ({
  backendRequest: mocks.backendRequest,
}));

import { proxyDashboardRequest } from "./dashboard-proxy";

function authenticatedClient(token = "supabase-access-token") {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-a" } },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: token } },
      }),
    },
  };
}

afterEach(() => {
  mocks.createSupabaseServerClient.mockReset();
  mocks.backendRequest.mockReset();
});

describe("dashboard BFF boundary", () => {
  test("validates the user and forwards only the server-side access token", async () => {
    mocks.createSupabaseServerClient.mockResolvedValue(authenticatedClient());
    mocks.backendRequest.mockResolvedValue(
      Response.json({ repositories: [] }, { status: 200 }),
    );

    const response = await proxyDashboardRequest("/api/repositories");

    expect(response.status).toBe(200);
    expect(mocks.backendRequest).toHaveBeenCalledWith("/api/repositories", {
      accessToken: "supabase-access-token",
      method: "GET",
      body: undefined,
      headers: undefined,
    });
    await expect(response.json()).resolves.toEqual({ repositories: [] });
  });

  test("returns 401 without contacting the backend when auth is invalid", async () => {
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error("invalid"),
        }),
      },
    });

    const response = await proxyDashboardRequest("/api/repositories");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: { code: "UNAUTHENTICATED" },
    });
    expect(mocks.backendRequest).not.toHaveBeenCalled();
  });

  test("preserves an authorization-derived 404 without exposing details", async () => {
    mocks.createSupabaseServerClient.mockResolvedValue(authenticatedClient());
    mocks.backendRequest.mockResolvedValue(
      Response.json(
        { error: { code: "NOT_FOUND", message: "not found" } },
        { status: 404 },
      ),
    );

    const response = await proxyDashboardRequest(
      "/api/investigations/inv_01K123456789AB",
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: "NOT_FOUND", message: "not found" },
    });
  });

  test("forwards ETags and emits an empty 304 response", async () => {
    mocks.createSupabaseServerClient.mockResolvedValue(authenticatedClient());
    mocks.backendRequest.mockResolvedValue(
      new Response(null, {
        status: 304,
        headers: {
          ETag: 'W/"investigation-inv_01K123456789AB-7"',
          "Cache-Control": "private, no-cache",
        },
      }),
    );

    const response = await proxyDashboardRequest(
      "/api/investigations/inv_01K123456789AB",
      { headers: { "If-None-Match": 'W/"investigation-6"' } },
    );

    expect(mocks.backendRequest).toHaveBeenCalledWith(
      "/api/investigations/inv_01K123456789AB",
      expect.objectContaining({
        accessToken: "supabase-access-token",
        headers: { "If-None-Match": 'W/"investigation-6"' },
      }),
    );
    expect(response.status).toBe(304);
    expect(response.headers.get("etag")).toBe(
      'W/"investigation-inv_01K123456789AB-7"',
    );
    expect(response.headers.get("cache-control")).toBe("private, no-cache");
    await expect(response.text()).resolves.toBe("");
  });
});
