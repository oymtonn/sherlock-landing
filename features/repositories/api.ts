/* Error contract shared with the UI. During data integration this module
   grows the real request helpers (authenticated fetch against the Sherlock
   backend via `lib/backend/client` — the access token stays server-side);
   for the UI-only phase the mock service in `github-service.ts` throws
   these directly. */
export class ApiClientError extends Error {
  status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}
