"use client";

import { useActionState } from "react";
import { startInstallationAction } from "./actions";

// Client wrapper so the install action can report pending state and safe
// error copy. It only ever receives pre-sanitized messages — never raw
// backend errors and never the access token.
export default function InstallButton() {
  const [state, formAction, pending] = useActionState(
    startInstallationAction,
    null
  );

  return (
    <form action={formAction} className="auth-signin">
      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Opening GitHub…" : "Install Sherlock on GitHub"}
      </button>
      {state?.error && (
        <span className="auth-signin-error mono" role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}
