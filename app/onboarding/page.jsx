import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { requireUser } from "@/lib/auth/require-user";
import { getMe, getInstallations, activeInstallations } from "@/lib/backend/client";
import { BackendError, safeMessageFor } from "@/lib/backend/errors";
import InstallButton from "./InstallButton";

export const metadata = { title: "Connect GitHub" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { accessToken } = await requireUser();

  let me = null;
  let backendError = null;
  let active = [];
  try {
    const [meResponse, installationsResponse] = await Promise.all([
      getMe(accessToken),
      getInstallations(accessToken),
    ]);
    me = meResponse;
    active = activeInstallations(installationsResponse);
  } catch (error) {
    if (!(error instanceof BackendError)) throw error;
    backendError = error;
  }

  if (backendError?.status === 401) redirect("/");
  if (active.length > 0) redirect("/dashboard");

  const login = me?.user?.login ?? null;

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
            <span>sherlock — onboarding</span>
            {login && <span className="chip">@{login}</span>}
          </div>
          <div className="auth-panel-body">
            <span className="auth-brand">
              <Logo />
              Sherlock
            </span>
            {backendError ? (
              <>
                <h1>Connect Sherlock to GitHub</h1>
                <p>{safeMessageFor(backendError)}</p>
                <div className="auth-panel-actions">
                  <a href="/onboarding" className="btn btn-primary">
                    Try again
                  </a>
                </div>
              </>
            ) : (
              <>
                <span className="chip chip-brand">no active connection</span>
                <h1>Connect Sherlock to GitHub</h1>
                <p>
                  Install the Sherlock GitHub App to start investigating.
                  GitHub will let you pick the account and the repositories
                  Sherlock can access.
                </p>
                <div className="auth-panel-actions">
                  <InstallButton />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
