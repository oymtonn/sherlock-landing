import { BackendError } from "./errors";

// Server-only client for the Sherlock backend. The backend owns all
// application data (installations, repositories, investigations, replays)
// and the GitHub App installation callback; the frontend only forwards the
// authenticated user's Supabase access token.

const REQUEST_TIMEOUT_MS = 10_000;

function isDevLoopbackHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

// Validates SHERLOCK_API_URL and returns the backend origin. Callers can
// never substitute their own origin.
function getBackendOrigin() {
  const raw = process.env.SHERLOCK_API_URL;
  if (!raw) {
    throw new Error("Missing required env var SHERLOCK_API_URL");
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("SHERLOCK_API_URL must be an absolute URL");
  }

  if (url.username || url.password) {
    throw new Error("SHERLOCK_API_URL must not contain credentials");
  }
  if (url.search || url.hash) {
    throw new Error("SHERLOCK_API_URL must not contain a query or fragment");
  }
  if (url.protocol !== "https:") {
    const devHttpAllowed =
      process.env.NODE_ENV !== "production" &&
      url.protocol === "http:" &&
      isDevLoopbackHost(url.hostname);
    if (!devHttpAllowed) {
      throw new Error("SHERLOCK_API_URL must use https");
    }
  }

  return url.origin;
}

// Fetches a backend API path with the user's Supabase access token. Only
// relative `/api/` paths are accepted — this is not a general proxy.
export async function backendRequest(
  path,
  { accessToken, method = "GET", body, headers: requestHeaders } = {},
) {
  if (typeof path !== "string" || !path.startsWith("/api/")) {
    throw new Error("Backend paths must be relative and begin with /api/");
  }
  if (!accessToken) {
    throw new BackendError(401, "MISSING_TOKEN");
  }

  const origin = getBackendOrigin();
  const url = new URL(path, origin);
  if (url.origin !== origin) {
    throw new Error("Backend path escaped the configured origin");
  }

  const headers = {
    ...requestHeaders,
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };

  const init = {
    method,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  try {
    return await fetch(url, init);
  } catch {
    // Network failure or timeout — never log the request (it carries the
    // Authorization header).
    throw new BackendError(503, "BACKEND_UNREACHABLE");
  }
}

async function backendFetch(path, { accessToken, method = "GET", body } = {}) {
  const response = await backendRequest(path, { accessToken, method, body });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const code =
      typeof payload?.error?.code === "string"
        ? payload.error.code
        : "UNKNOWN";
    throw new BackendError(response.status, code);
  }

  return payload;
}

export async function getMe(accessToken) {
  return backendFetch("/api/me", { accessToken });
}

export async function getInstallations(accessToken) {
  return backendFetch("/api/installations", { accessToken });
}

export async function startInstallation(accessToken) {
  return backendFetch("/api/installations/start", {
    accessToken,
    method: "POST",
    body: {},
  });
}

// Only backend-confirmed active installations count as connected.
export function activeInstallations(installationsResponse) {
  const list = installationsResponse?.installations;
  if (!Array.isArray(list)) return [];
  return list.filter((i) => i?.status === "active");
}

// The GitHub App installation URL comes from the backend; validate it
// strictly before redirecting the browser to it.
export function validateInstallationUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new BackendError(502, "INVALID_INSTALLATION_URL");
  }

  const ok =
    url.protocol === "https:" &&
    url.hostname === "github.com" &&
    !url.username &&
    !url.password &&
    url.pathname.startsWith("/apps/") &&
    url.pathname.endsWith("/installations/new");

  if (!ok) {
    throw new BackendError(502, "INVALID_INSTALLATION_URL");
  }

  return url.toString();
}
