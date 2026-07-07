import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Security",
  description:
    "Sherlock's security model: sandboxed execution, scoped GitHub App permissions, PR-only output, human review on everything.",
};

export default function Security() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="kicker">Security</span>
          <h1>Designed so the blast radius is a branch</h1>
          <p>
            Sherlock's autonomy is bounded on every axis: where code runs, what
            it can touch, who can trigger it, and what it can produce.
          </p>
        </div>
      </section>

      <section className="paper-section">
        <div className="wrap">
          <Reveal>
            <div className="sec-grid">
              <div className="sec-card">
                <h3><span className="sec-ico">▣</span> Sandboxed execution</h3>
                <p>
                  Every investigation clones your repository into an isolated,
                  ephemeral container. Your app runs there — never on your
                  infrastructure, never alongside another tenant&apos;s code.
                  Workspaces are destroyed when the run completes.
                </p>
              </div>
              <div className="sec-card">
                <h3><span className="sec-ico">⚿</span> GitHub App permissions</h3>
                <p>
                  Sherlock installs as a GitHub App scoped to the repositories
                  you select. Access uses short-lived installation tokens — no
                  personal access tokens, no OAuth scope creep, revocable in
                  one click from GitHub settings.
                </p>
              </div>
              <div className="sec-card">
                <h3><span className="sec-ico">⎇</span> PR-only output</h3>
                <p>
                  The only write Sherlock performs is opening a branch and a
                  pull request. It cannot push to protected branches, cannot
                  merge, cannot tag releases, and cannot touch CI/CD or
                  deployment settings.
                </p>
              </div>
              <div className="sec-card">
                <h3><span className="sec-ico">✓</span> Human review, always</h3>
                <p>
                  Every change waits for your team&apos;s review like any other
                  PR. Branch protection rules, required reviews, and CODEOWNERS
                  all apply — Sherlock works inside your process, not around
                  it.
                </p>
              </div>
              <div className="sec-card">
                <h3><span className="sec-ico">§</span> Authorization gates</h3>
                <p>
                  Investigations only start from an exact{" "}
                  <code>/sherlock investigate</code> command by a non-bot user
                  whose write access is verified against the GitHub API at
                  trigger time — payload data is never trusted.
                </p>
              </div>
              <div className="sec-card">
                <h3><span className="sec-ico">∿</span> Rate limits &amp; audit</h3>
                <p>
                  Per-installation rate limits cap concurrent and daily runs.
                  Every investigation produces a complete log of what ran,
                  what was read, and what changed — attached to the PR.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="kicker">The permission surface</span>
            <h2>What Sherlock can and cannot do</h2>
          </Reveal>
          <Reveal>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Access</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Read repository contents</td>
                  <td><span className="chip chip-brand">read</span></td>
                  <td>Clone into the sandbox for reproduction and patching</td>
                </tr>
                <tr>
                  <td>Read &amp; comment on issues</td>
                  <td><span className="chip chip-brand">read / write</span></td>
                  <td>Receive the trigger command, post status updates</td>
                </tr>
                <tr>
                  <td>Create branches &amp; pull requests</td>
                  <td><span className="chip chip-brand">write</span></td>
                  <td>Deliver the fix for human review</td>
                </tr>
                <tr>
                  <td>Push to default / protected branches</td>
                  <td><span className="chip chip-red">never</span></td>
                  <td>PR-only by design</td>
                </tr>
                <tr>
                  <td>Merge pull requests</td>
                  <td><span className="chip chip-red">never</span></td>
                  <td>Your reviewers decide what ships</td>
                </tr>
                <tr>
                  <td>Actions, webhooks, deploy keys, settings</td>
                  <td><span className="chip chip-red">no access</span></td>
                  <td>Out of scope for the App&apos;s permissions</td>
                </tr>
              </tbody>
            </table>
          </Reveal>
          <div style={{ marginTop: 48 }}>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Request the security overview
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
