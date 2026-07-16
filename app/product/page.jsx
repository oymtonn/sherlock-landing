import Link from "next/link";
import Reveal from "@/components/Reveal";
import { RepoGraph } from "@/components/CaseAnimation";

export const metadata = {
  title: "Product",
  description:
    "How Sherlock turns a GitHub issue into a verified pull request: reproduction, Graphify repo mapping, patching, deterministic verification.",
};

export default function Product() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="kicker">Product</span>
          <h1>An investigator, not a code generator</h1>
          <p>
            Sherlock treats every bug like a case: reproduce it, gather
            context, fix it, prove the fix, file the paperwork.
          </p>
        </div>
      </section>

      {/* trigger */}
      <section className="section">
        <div className="wrap">
          <Reveal className="feature-row">
            <div>
              <span className="kicker">01 · Trigger</span>
              <h2>One comment starts the case</h2>
              <p>
                Sherlock lives where your bugs live. A maintainer comments{" "}
                <code className="mono text-[color:var(--brand)]">
                  /sherlock investigate
                </code>{" "}
                on any GitHub issue, and the investigation is queued.
              </p>
              <ul className="feature-list">
                <li>
                  Permissions are checked against the GitHub API — only users
                  with write access or higher can trigger a run.
                </li>
                <li>
                  Bot comments are ignored; installs are rate-limited so a
                  noisy repo can&apos;t burn your budget.
                </li>
                <li>
                  Sherlock replies on the issue with a queued status, then
                  keeps its progress visible.
                </li>
              </ul>
            </div>
            <div className="panel">
              <div className="panel-bar">
                <div className="panel-dots"><i /><i /><i /></div>
                <span>acme/taskboard · issue #482</span>
              </div>
              <div className="p-5">
                <div className="gh-card">
                  <div className="gh-card-head">
                    <span className="chip">dana-oh</span>
                    <span>commented 12s ago</span>
                  </div>
                  <div className="gh-body mono text-[color:var(--brand)]">
                    /sherlock investigate
                  </div>
                </div>
                <div className="gh-card mt-3">
                  <div className="gh-card-head">
                    <span className="chip chip-brand">sherlock[bot]</span>
                    <span>commented just now</span>
                  </div>
                  <div className="gh-body">
                    Investigation <span className="mono">SLK-4127</span> queued.
                    I&apos;ll reproduce this issue, attempt a fix, and open a
                    verified PR if the replay passes.
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* reproduction */}
      <section className="section">
        <div className="wrap">
          <Reveal className="feature-row flip">
            <div className="panel p-5">
              <div className="replay">
                <div className="replay-frame">
                  <div className="rf-bar w-[58%]" />
                  <div className="rf-row" />
                  <div className="rf-row" />
                  <div className="rf-row" />
                  <div className="rf-cap">1 · load board</div>
                </div>
                <div className="replay-frame">
                  <div className="rf-bar w-[45%]" />
                  <div className="rf-row ok" />
                  <div className="rf-row" />
                  <div className="rf-cap">2 · mark task done</div>
                </div>
                <div className="replay-frame">
                  <div className="rf-bar w-[45%]" />
                  <div className="rf-row hl" />
                  <div className="rf-row" />
                  <div className="rf-cap">3 · bug confirmed</div>
                </div>
              </div>
              <div className="term mt-3.5">
                <span className="t-faint">playwright ·</span> reproduction
                saved as replayable script ·{" "}
                <span className="t-warn">trace.zip attached</span>
              </div>
            </div>
            <div>
              <span className="kicker">02 · Reproduce</span>
              <h2>If it can&apos;t reproduce the bug, it stops</h2>
              <p>
                Sherlock boots your application inside a sandboxed container
                and drives it with a real browser, following the issue report
                until the failure is observed.
              </p>
              <ul className="feature-list">
                <li>
                  The reproduction is stored as a deterministic script — the
                  same steps can be replayed at any time.
                </li>
                <li>
                  No reproduction, no patch. Sherlock reports back on the
                  issue instead of guessing.
                </li>
                <li>
                  Browser traces are captured so you can watch what it saw.
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* graphify */}
      <section className="section" id="graphify">
        <div className="wrap">
          <Reveal className="feature-row">
            <div>
              <span className="kicker">03 · Graphify</span>
              <h2>A map of the repo, built before the search starts</h2>
              <p>
                Graphify indexes files, functions, and the relationships
                between them into a queryable graph. Investigations walk the
                graph from symptom to cause instead of grepping and hoping.
              </p>
              <ul className="feature-list">
                <li>Focused context: only code reachable from the failure enters scope.</li>
                <li>Deterministic slice: the same issue maps to the same neighborhood.</li>
                <li>Shipped with the PR so reviewers see the reasoning surface.</li>
              </ul>
            </div>
            <div className="panel p-[26px_18px]">
              <RepoGraph />
              <div className="mono dim text-[12px] text-center mt-1.5">
                2,314 nodes indexed · 6 in scope for #482
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* verification */}
      <section className="section" id="verification">
        <div className="wrap">
          <Reveal className="feature-row flip">
            <div className="ledger">
              <div className="ledger-row">
                <span className="l-key">test input</span>
                <span className="l-val">the saved reproduction — unchanged</span>
                <span className="l-status"><span className="chip">fixed steps</span></span>
              </div>
              <div className="ledger-row">
                <span className="l-key">test target</span>
                <span className="l-val">your app, rebuilt with the patch, in a fresh sandbox</span>
                <span className="l-status"><span className="chip">clean env</span></span>
              </div>
              <div className="ledger-row">
                <span className="l-key">pass condition</span>
                <span className="l-val">every step completes and the failing assertion now holds</span>
                <span className="l-status"><span className="chip chip-verified">3/3 passed</span></span>
              </div>
            </div>
            <div>
              <span className="kicker">04 · Verify</span>
              <h2>The bug that was caught is the test that must pass</h2>
              <p>
                Verification is a replay, not a review. The exact reproduction
                that demonstrated the bug runs against the patched application.
                A model&apos;s opinion never decides the outcome.
              </p>
              <p>
                PRs that pass carry the{" "}
                <span className="text-[color:var(--verified)]">Verified</span>{" "}
                badge. PRs that don&apos;t pass don&apos;t carry it — and
                Sherlock says so on the issue.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PR output */}
      <section className="section">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="kicker">05 · Deliverable</span>
            <h2>A reviewable PR with its evidence attached</h2>
            <p>
              Diff, investigation log, browser trace, graph context, and the
              verification result — everything a reviewer needs to say yes
              with confidence.
            </p>
          </Reveal>
          <Reveal>
            <div className="ev-panel">
              <div className="pr-card">
                <div className="pr-ico">⎇</div>
                <div className="flex-1">
                  <div className="pr-title">Fix active task cache invalidation</div>
                  <div className="pr-meta">
                    #483 · sherlock[bot] · 1 commit · +2 −1 · closes #482
                  </div>
                  <div className="pr-checks">
                    <span><i>✓</i> reproduction replayed against patched build — passed</span>
                    <span><i>✓</i> investigation.log · trace.zip · graph-context.json</span>
                    <span><i>✓</i> awaiting human review — Sherlock never merges</span>
                  </div>
                </div>
                <span className="chip chip-verified self-center">
                  Verified
                </span>
              </div>
            </div>
          </Reveal>
          <div className="mt-12 flex gap-3.5 flex-wrap">
            <Link href="/contact" className="btn btn-primary btn-lg">Book a demo</Link>
            <Link href="/docs" className="btn btn-ghost btn-lg">Read the docs</Link>
          </div>
        </div>
      </section>
    </>
  );
}
