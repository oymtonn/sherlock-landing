// Error type thrown by the backend client. Carries only a status and a
// machine-readable code — never raw backend response bodies, headers or
// tokens.
export class BackendError extends Error {
  constructor(status, code) {
    super(`Sherlock backend request failed (${status})`);
    this.name = "BackendError";
    this.status = status;
    this.code = code;
  }
}

// Central status → safe UI message mapping. Backend `error.message` text is
// never shown verbatim.
const MESSAGES = {
  401: "Your session has expired. Sign in again.",
  403: "You do not have access to this Sherlock account.",
  409: "The GitHub connection changed while onboarding. Please try again.",
  429: "Too many attempts. Please wait and try again.",
  503: "Sherlock is temporarily unavailable. Please try again shortly.",
};

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

export function safeMessageFor(error) {
  if (error instanceof BackendError && MESSAGES[error.status]) {
    return MESSAGES[error.status];
  }
  return GENERIC_MESSAGE;
}
