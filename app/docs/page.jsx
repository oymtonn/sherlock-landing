import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "How it works",
  description:
    "Sherlock docs: install the GitHub App, trigger an investigation, and understand the pipeline from reproduction to verified PR.",
};

export default function Docs() {
  return (
    <>
      <section className="page-hero" style={{ paddingBottom: 24 }}>
        <div className="wrap">
          <span className="kicker">Docs</span>
          <h1>How Sherlock works</h1>
          <p>
            From installing the GitHub App to reviewing your first verified
            pull request.
          </p>
        </div>
      </section>

      <div className="wrap docs-layout">
        <nav className="docs-nav">
          <a href="#quickstart">Quickstart</a>
          <a href="#trigger">Triggering</a>
          <a href="#pipeline">The pipeline</a>
          <a href="#artifacts">Artifacts</a>
          <a href="#outcomes">Outcomes</a>
          <a href="#limits">Limits &amp; controls</a>
        </nav>

        <div className="docs-body">
          <h2 id="quickstart">Quickstart</h2>
          <p>
            Install the Sherlock GitHub App on the repositories you want
            covered. Installation takes about a minute and requires no code
            changes, CI configuration, or SDK.
          </p>
          <div className="term">
            <div><span className="t-faint">1.</span> Install the GitHub App → select repositories</div>
            <div><span className="t-faint">2.</span> Open any bug issue</div>
            <div><span className="t-faint">3.</span> Comment <span className="t-amber">/sherlock investigate</span></div>
            <div><span className="t-faint">4.</span> Review the PR when it arrives</div>
          </div>
          <div className="docs-note">
            <b>Requirement:</b> your app needs a way to run in a container —
            a Dockerfile or a standard build. Sherlock detects common setups
            automatically; anything unusual can be configured per repo.
          </div>

          <h2 id="trigger">Triggering an investigation</h2>
          <p>
            Sherlock listens for the exact comment{" "}
            <code>/sherlock investigate</code> on an issue. When it sees one,
            it verifies the commenter&apos;s repository role against the
            GitHub API — <code>write</code>, <code>maintain</code>, or{" "}
            <code>admin</code> is required. Bot users are ignored. Webhook
            payload permissions are never trusted; the role is always
            resolved through an installation-authenticated API call.
          </p>
          <p>
            Accepted commands are queued as jobs and processed by isolated
            workers, so a burst of triggers never blocks GitHub webhook
            handling. Sherlock replies on the issue when the investigation is
            queued, and again with results.
          </p>

          <h2 id="pipeline">The pipeline</h2>
          <p>Every investigation moves through five stages:</p>
          <div className="term">
            <div><span className="t-amber">reproduce</span> <span className="t-faint">—</span> boot the app in a sandbox, drive a real browser, record a replayable script that demonstrates the failure</div>
            <div><span className="t-amber">map</span> <span className="t-faint">—</span> query the Graphify repo graph for files, functions, and relationships reachable from the failure</div>
            <div><span className="t-amber">patch</span> <span className="t-faint">—</span> draft a minimal change against the mapped code paths</div>
            <div><span className="t-amber">verify</span> <span className="t-faint">—</span> rebuild with the patch and replay the saved reproduction in a fresh sandbox</div>
            <div><span className="t-amber">deliver</span> <span className="t-faint">—</span> open a PR with the diff and all artifacts attached</div>
          </div>
          <p>
            The stages are strictly ordered: a patch is never drafted before a
            reproduction exists, and the Verified badge is never applied
            unless the replay passed.
          </p>

          <h2 id="artifacts">Artifacts</h2>
          <p>Every run produces an inspectable evidence set:</p>
          <div className="ledger" style={{ margin: "20px 0 24px" }}>
            <div className="ledger-row" style={{ gridTemplateColumns: "200px 1fr" }}>
              <span className="l-key">investigation.log</span>
              <span className="l-val">timestamped record of every stage, decision, and command</span>
            </div>
            <div className="ledger-row" style={{ gridTemplateColumns: "200px 1fr" }}>
              <span className="l-key">reproduction script</span>
              <span className="l-val">the deterministic browser script that triggers the bug</span>
            </div>
            <div className="ledger-row" style={{ gridTemplateColumns: "200px 1fr" }}>
              <span className="l-key">trace.zip</span>
              <span className="l-val">browser traces from reproduction and verification runs</span>
            </div>
            <div className="ledger-row" style={{ gridTemplateColumns: "200px 1fr" }}>
              <span className="l-key">graph-context.json</span>
              <span className="l-val">the Graphify slice the investigation worked from</span>
            </div>
            <div className="ledger-row" style={{ gridTemplateColumns: "200px 1fr" }}>
              <span className="l-key">pull request</span>
              <span className="l-val">the patch, linked to the issue, with the verification result</span>
            </div>
          </div>

          <h2 id="outcomes">Outcomes</h2>
          <p>An investigation ends in one of three states, all reported on the issue:</p>
          <div className="term">
            <div><span className="t-green">verified pr</span> <span className="t-faint">—</span> the replay passed against the patched build; PR carries the Verified badge</div>
            <div><span className="t-amber">draft pr</span> <span className="t-faint">—</span> a plausible patch exists but verification didn&apos;t pass; shipped as a draft, clearly labeled</div>
            <div><span className="t-red">no reproduction</span> <span className="t-faint">—</span> the bug couldn&apos;t be reproduced; you get the attempt log and what was tried</div>
          </div>
          <p>
            Sherlock never dresses up an unverified fix as a verified one.
            The badge is backed by an execution result you can re-run.
          </p>

          <h2 id="limits">Limits &amp; controls</h2>
          <p>
            Installations have configurable rate limits on concurrent and
            daily investigations. Repository access is controlled entirely
            through the GitHub App installation — uninstalling revokes
            everything instantly. For self-hosted workers, quotas, network
            policy, and image allowlists are under your control. See{" "}
            <Link href="/security" style={{ color: "var(--amber)" }}>
              Security
            </Link>{" "}
            for the full model.
          </p>

          <div style={{ marginTop: 48, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-primary btn-lg">Book a demo</Link>
            <Link href="/product" className="btn btn-ghost btn-lg">Product overview</Link>
          </div>
        </div>
      </div>
    </>
  );
}
