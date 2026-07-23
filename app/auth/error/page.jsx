import Link from "next/link";
import GitHubSignInButton from "@/components/auth/GitHubSignInButton";

export const metadata = { title: "Sign-in problem" };
export const dynamic = "force-dynamic";

// Fixed allow-list of error codes → safe copy. Anything else falls back to
// the generic entry; query-string text is never rendered.
const ERRORS = {
  missing_code: "The sign-in link was incomplete. Please start again.",
  oauth_exchange_failed:
    "We couldn’t finish signing you in with GitHub. Please try again.",
};

const GENERIC = "Something went wrong while signing you in. Please try again.";

export default async function AuthErrorPage({ searchParams }) {
  const { code } = await searchParams;
  const message = ERRORS[code] ?? GENERIC;

  return (
    <section className="auth-section">
      <div className="wrap">
        <div className="panel auth-panel">
          <div className="panel-bar">
            <span className="panel-dots">
              <i />
              <i />
              <i />
            </span>
            <span>sherlock — sign in</span>
          </div>
          <div className="auth-panel-body">
            <span className="chip chip-red">sign-in interrupted</span>
            <h1>We hit a snag</h1>
            <p>{message}</p>
            <div className="auth-panel-actions">
              <GitHubSignInButton
                label="Try again"
                className="btn btn-primary"
                showIcon
              />
              <Link href="/" className="btn btn-ghost">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
