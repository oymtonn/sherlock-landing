import "server-only";
import { createSupabaseServerClient } from "../supabase/server";
import { backendRequest } from "./client";
import { BackendError } from "./errors";

function errorResponse(status, code) {
  return Response.json({ error: { code } }, { status });
}

// Dashboard Client Components call only same-origin route handlers. This
// proxy validates the Supabase user server-side and forwards the short-lived
// access token to the configured Sherlock backend without exposing it to the
// browser or accepting arbitrary backend origins.
export async function proxyDashboardRequest(
  path,
  /** @type {{ method?: string, body?: unknown, headers?: Record<string, string> }} */
  { method = "GET", body, headers } = {},
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return errorResponse(401, "UNAUTHENTICATED");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return errorResponse(401, "UNAUTHENTICATED");

  let backendResponse;
  try {
    backendResponse = await backendRequest(path, {
      accessToken: session.access_token,
      method,
      body,
      headers,
    });
  } catch (requestError) {
    if (requestError instanceof BackendError) {
      return errorResponse(requestError.status, requestError.code);
    }
    return errorResponse(503, "BACKEND_UNREACHABLE");
  }

  const responseHeaders = new Headers();
  const contentType = backendResponse.headers.get("content-type");
  const etag = backendResponse.headers.get("etag");
  const cacheControl = backendResponse.headers.get("cache-control");
  if (contentType) responseHeaders.set("content-type", contentType);
  if (etag) responseHeaders.set("etag", etag);
  if (cacheControl) responseHeaders.set("cache-control", cacheControl);

  return new Response(
    backendResponse.status === 304 ? null : await backendResponse.arrayBuffer(),
    {
      status: backendResponse.status,
      headers: responseHeaders,
    },
  );
}
