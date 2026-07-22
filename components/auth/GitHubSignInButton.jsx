"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

// GitHub mark — lucide dropped brand icons, so it's inlined here.
function GitHubMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

// The single canonical entry point for GitHub sign-in. Every product login
// action (header, mobile nav, landing CTAs, auth error retry) renders this
// component — OAuth startup logic must not be duplicated elsewhere.
export default function GitHubSignInButton({
  label = "Log In",
  className = "btn btn-ghost",
  pendingLabel = "Redirecting…",
  showIcon = false,
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signIn() {
    if (pending) return;
    setPending(true);
    setFailed(false);

    try {
      const supabase = getSupabaseBrowserClient();

      // Non-authoritative convenience check — server pages still validate.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/onboarding");
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // Success: the browser is navigating to GitHub; stay in the
      // pending state until it does.
    } catch {
      // Never surface raw Supabase/GitHub error details.
      setPending(false);
      setFailed(true);
    }
  }

  return (
    <span className="auth-signin">
      <button
        type="button"
        className={className}
        onClick={signIn}
        disabled={pending}
        aria-busy={pending}
      >
        {showIcon && <GitHubMark />}
        {pending ? pendingLabel : label}
      </button>
      {failed && (
        <span className="auth-signin-error mono" role="alert">
          Couldn’t start GitHub sign-in. Try again.
        </span>
      )}
    </span>
  );
}
