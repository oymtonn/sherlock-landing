import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { requireUser } from "@/lib/auth/require-user";
import { getMe, getInstallations, activeInstallations } from "@/lib/backend/client";
import { BackendError, safeMessageFor } from "@/lib/backend/errors";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

// Minimal placeholder proving the auth + installation flow works. All data
// comes from the authenticated backend — a `?installation=success` query
// param is only a display hint, never an authorization source.
export default async function DashboardPage({ searchParams }) {
  const { accessToken } = await requireUser();
  const { installation } = await searchParams;

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
  if (!backendError && active.length === 0) redirect("/onboarding");

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
            <span>sherlock — dashboard</span>
            {login && <span className="chip">@{login}</span>}
          </div>
          <div className="auth-panel-body">
            <span className="auth-brand">
              <Logo />
              Sherlock
            </span>
            {backendError ? (
              <>
                <h1>Dashboard</h1>
                <p>{safeMessageFor(backendError)}</p>
                <div className="auth-panel-actions">
                  <a href="/dashboard" className="btn btn-primary">
                    Try again
                  </a>
                </div>
              </>
            ) : (
              <>
                {installation === "success" && (
                  <span className="chip chip-verified">installation complete</span>
                )}
                <h1>You’re connected</h1>
                <p>
                  Signed in as <strong>{login ? `@${login}` : "your GitHub account"}</strong>.
                </p>
                <ul className="auth-install-list">
                  {active.map((inst) => (
                    <li key={inst.installationId} className="mono">
                      <span className="chip chip-verified">active</span>
                      GitHub App connected to{" "}
                      <strong>@{inst.account?.login}</strong>
                      {inst.account?.type === "Organization"
                        ? " (organization)"
                        : ""}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <form action="/logout" method="post" className="auth-logout">
              <button type="submit" className="btn btn-ghost">
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
