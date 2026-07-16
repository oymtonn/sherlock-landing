import Link from "next/link";
import CaseAnimation, { RepoGraph } from "@/components/CaseAnimation";
import HeroHunt from "@/components/HeroHunt";
import InteractiveGraph from "@/components/InteractiveGraph";
import Reveal from "@/components/Reveal";
import Spotlight from "@/components/Spotlight";

export default function Home() {
  return (
    <>
      {/* ---------------------------------------------------- 1 · hero (centered, avatar on the hunt) */}
      <Spotlight className="hero hero-center">
        <div className="wrap">
          <span className="kicker">GitHub App · autonomous bug fixing</span>
          <HeroHunt>
            <h1>
              GitHub bugs to <em>verified</em>
              <br />
              pull requests
            </h1>
          </HeroHunt>
          <p className="text-[color:var(--ink-dim)] text-[18px] max-w-[520px] mx-auto mb-8">
            Sherlock reproduces issues, maps your repo, patches the bug,
            verifies the fix, and opens a PR your team can review.
          </p>
          <div className="hero-ctas">
            <Link href="/contact" className="btn btn-primary btn-lg">
              Book a demo
            </Link>
            <Link href="/docs" className="btn btn-ghost btn-lg">
              See how it works
            </Link>
          </div>
          <div className="mono flex justify-center gap-[22px] flex-wrap mt-9 text-[12.5px] text-[color:var(--ink-faint)]">
            <span className="flex items-center gap-[7px]">
              <i className="w-[5px] h-[5px] rounded-full bg-[color:var(--brand)] inline-block" /> triggered by <b>/sherlock investigate</b>
            </span>
            <span className="flex items-center gap-[7px]">
              <i className="w-[5px] h-[5px] rounded-full bg-[color:var(--brand)] inline-block" /> PR-only — never pushes to main
            </span>
          </div>
        </div>
      </Spotlight>

      {/* ---------------------------------------------------- 3 · how it works */}
      <section className="section" id="how">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="kicker">The pipeline</span>
            <h2>Five stages. Every one leaves evidence.</h2>
            <p>
              Each investigation runs in an isolated sandbox and produces
              artifacts you can inspect — not a chat transcript.
            </p>
          </Reveal>
          <Reveal>
            <div className="steps">
              <div className="step">
                <div className="step-num">01 / reproduce</div>
                <h3>Reproduce</h3>
                <p>
                  Sherlock reads the issue, boots your app in a sandbox, and
                  drives a real browser until it triggers the bug. The
                  reproduction is saved as a replayable script.
                </p>
              </div>
              <div className="step">
                <div className="step-num">02 / map</div>
                <h3>Map repo</h3>
                <p>
                  Graphify builds a graph of files, functions, and
                  relationships, so the investigation focuses on the code that
                  actually matters.
                </p>
              </div>
              <div className="step">
                <div className="step-num">03 / patch</div>
                <h3>Patch</h3>
                <p>
                  With the failure and the relevant code in view, Sherlock
                  writes a minimal, targeted patch — no drive-by refactors.
                </p>
              </div>
              <div className="step">
                <div className="step-num">04 / verify</div>
                <h3>Verify</h3>
                <p>
                  The saved reproduction is replayed against the patched app.
                  Pass or fail is determined by execution, not by opinion.
                </p>
              </div>
              <div className="step">
                <div className="step-num">05 / open pr</div>
                <h3>Open PR</h3>
                <p>
                  A pull request opens with the diff, the investigation log,
                  and the verification result. Your team reviews and merges.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- 3b · follow a live case */}
      <section className="section" id="case">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="kicker">Case replay</span>
            <h2>Follow investigation SLK-4127, stage by stage</h2>
            <p>
              The exact sequence Sherlock runs on every bug. Click any stage
              in the rail to scrub — hover to pause.
            </p>
          </Reveal>
          <Reveal>
            <CaseAnimation />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- 4 · graphify */}
      <section className="section" id="graphify">
        <div className="wrap">
          <Reveal className="feature-row">
            <div>
              <span className="kicker">Graphify</span>
              <h2>Context from structure, not from stuffing files into a prompt</h2>
              <p>
                Before touching a line, Sherlock builds a graph of your
                repository: files, functions, call sites, and the relationships
                between them.
              </p>
              <ul className="feature-list">
                <li>
                  Investigations start from the symptom and walk the graph to
                  the code paths that can cause it.
                </li>
                <li>
                  Irrelevant code stays out of scope — smaller context, fewer
                  wrong turns, cheaper runs.
                </li>
                <li>
                  The graph slice used for each fix ships with the PR, so
                  reviewers see why those files were touched.
                </li>
              </ul>
            </div>
            <div className="panel p-[26px_18px_14px]">
              <InteractiveGraph />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- 5 · deterministic verification */}
      <section className="section" id="verification">
        <div className="wrap">
          <Reveal className="feature-row flip">
            <div className="ledger">
              <div className="ledger-row">
                <span className="l-key">reproduction</span>
                <span className="l-val">
                  3-step browser script, recorded before any code changed
                </span>
                <span className="l-status">
                  <span className="chip chip-red">bug present</span>
                </span>
              </div>
              <div className="ledger-row">
                <span className="l-key">patch applied</span>
                <span className="l-val">
                  server.js · invalidateTaskLists() on task completion
                </span>
                <span className="l-status">
                  <span className="chip">+2 −1</span>
                </span>
              </div>
              <div className="ledger-row">
                <span className="l-key">replay</span>
                <span className="l-val">
                  same script, same steps, patched app
                </span>
                <span className="l-status">
                  <span className="chip chip-verified">passed</span>
                </span>
              </div>
              <div className="ledger-row">
                <span className="l-key">verdict</span>
                <span className="l-val">
                  determined by execution — not by asking a model
                </span>
                <span className="l-status">
                  <span className="chip chip-verified">Verified</span>
                </span>
              </div>
            </div>
            <div>
              <span className="kicker">Deterministic verification</span>
              <h2>&quot;Looks right&quot; is not a test result</h2>
              <p>
                Sherlock never asks an AI whether the fix worked. It replays
                the saved reproduction — the exact steps that triggered the bug
                — against the patched application.
              </p>
              <p>
                If the replay passes, the PR is marked{" "}
                <span className="text-[color:var(--verified)]">Verified</span>. If
                it doesn&apos;t, no PR ships with that badge. The failure mode
                is honest.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- 6 · security & control */}
      <section className="paper-section" id="security">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="kicker">Security &amp; control</span>
            <h2>Autonomy with a short leash</h2>
            <p>
              Sherlock is built to be trusted with your repository by being
              easy to constrain, inspect, and override.
            </p>
          </Reveal>
          <Reveal>
            <div className="sec-grid">
              <div className="sec-card">
                <h3>
                  <span className="sec-ico">▣</span> Sandboxed execution
                </h3>
                <p>
                  Every investigation runs your code in an isolated container.
                  Nothing executes on your infrastructure, and workspaces are
                  destroyed when the run ends.
                </p>
              </div>
              <div className="sec-card">
                <h3>
                  <span className="sec-ico">⚿</span> Scoped GitHub App
                </h3>
                <p>
                  Sherlock installs as a GitHub App with narrowly scoped
                  permissions on the repositories you choose. No personal
                  tokens, no org-wide access.
                </p>
              </div>
              <div className="sec-card">
                <h3>
                  <span className="sec-ico">⎇</span> PR-only workflow
                </h3>
                <p>
                  Output is always a pull request on a branch. Sherlock never
                  commits to main, never merges, and never deploys.
                </p>
              </div>
              <div className="sec-card">
                <h3>
                  <span className="sec-ico">✓</span> Humans gate everything
                </h3>
                <p>
                  Only users with write access can trigger an investigation,
                  and every fix waits for review. Rate limits cap runs per
                  installation.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- 7 · example output */}
      <section className="section" id="evidence">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="kicker">Example output</span>
            <h2>What lands in your repo</h2>
            <p>
              A Sherlock PR arrives with its homework attached. This is a real
              artifact set from an investigation.
            </p>
          </Reveal>
          <Reveal>
            <div className="evidence">
              {/* investigation log */}
              <div className="ev-panel ev-a">
                <div className="panel-bar">
                  <span>investigation.log</span>
                  <span className="chip">SLK-4127</span>
                </div>
                <div className="ev-body term border-0">
                  <div><span className="t-faint">[00:00.4]</span> queued · issue #482 · repo acme/taskboard</div>
                  <div><span className="t-faint">[00:01.1]</span> trigger: <span className="t-warn">/sherlock investigate</span> by dana-oh (write) ✓</div>
                  <div><span className="t-faint">[00:02.8]</span> sandbox up · main@e4f21c9 · app healthy on :3000</div>
                  <div><span className="t-faint">[00:19.5]</span> reproduction recorded · 3 steps · <span className="t-red">bug present</span></div>
                  <div><span className="t-faint">[00:24.0]</span> graphify: 2,314 nodes → <span className="t-warn">6 relevant</span></div>
                  <div><span className="t-faint">[02:47.3]</span> patch drafted · server.js · +2 −1</div>
                  <div><span className="t-faint">[04:20.7]</span> replay vs patch: 3/3 steps <span className="t-green">passed</span></div>
                  <div><span className="t-faint">[04:31.2]</span> PR #483 opened · <span className="t-green">Verified</span></div>
                </div>
              </div>

              {/* reproduction result */}
              <div className="ev-panel ev-b">
                <div className="panel-bar">
                  <span>reproduction</span>
                  <span className="chip chip-red">bug present</span>
                </div>
                <div className="ev-body">
                  <div className="replay">
                    <div className="replay-frame">
                      <div className="rf-bar w-[55%]" />
                      <div className="rf-row" />
                      <div className="rf-row" />
                      <div className="rf-cap">mark done</div>
                    </div>
                    <div className="replay-frame">
                      <div className="rf-bar w-[40%]" />
                      <div className="rf-row hl" />
                      <div className="rf-row" />
                      <div className="rf-cap">stale in Active</div>
                    </div>
                  </div>
                  <p className="dim text-[13px] mt-3">
                    Recorded with a real browser before any code changed —
                    then reused, unmodified, as the verification test.
                  </p>
                </div>
              </div>

              {/* graph context */}
              <div className="ev-panel ev-c">
                <div className="panel-bar">
                  <span>graph-context.json</span>
                  <span className="chip chip-brand">6 nodes</span>
                </div>
                <div className="ev-body">
                  <RepoGraph />
                </div>
              </div>

              {/* patch diff */}
              <div className="ev-panel ev-d">
                <div className="panel-bar">
                  <span>patch</span>
                  <span className="chip">server.js · +2 −1</span>
                </div>
                <div className="ev-body">
                  <div className="diff border-0">
                    <pre>
                      <span className="ln ctx">  app.patch(&quot;/tasks/:id&quot;, async (req, res) =&gt; {"{"}</span>
                      <span className="ln ctx">    const {"{ id }"} = req.params;</span>
                      <span className="ln ctx">    await tasks.update(id, {"{ done: true }"});</span>
                      <span className="ln del">-   res.json({"{ ok: true }"});</span>
                      <span className="ln add">+   invalidateTaskLists();</span>
                      <span className="ln add">+   res.json({"{ ok: true }"});</span>
                      <span className="ln ctx">  {"}"});</span>
                    </pre>
                  </div>
                </div>
              </div>

              {/* verified PR card */}
              <div className="ev-panel ev-e">
                <div className="pr-card">
                  <div className="pr-ico">⎇</div>
                  <div className="flex-1">
                    <div className="pr-title">
                      Fix active task cache invalidation
                    </div>
                    <div className="pr-meta">
                      #483 · sherlock[bot] wants to merge 1 commit into main ·
                      closes #482
                    </div>
                    <div className="pr-checks">
                      <span><i>✓</i> reproduction replayed against patched build — 3/3 steps passed</span>
                      <span><i>✓</i> artifacts: investigation.log · trace.zip · graph-context.json</span>
                    </div>
                  </div>
                  <span className="chip chip-verified self-center">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- 8 · pricing teaser */}
      <section className="section" id="pricing">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="kicker">Pricing</span>
            <h2>Early access, priced for teams</h2>
            <p>
              Simple per-investigation pricing while we onboard early teams.
              No seat math.
            </p>
          </Reveal>
          <Reveal>
            <div className="price-grid">
              <div className="price-card">
                <div className="p-name">Pilot</div>
                <div className="p-price">
                  $0 <small>/ 14 days</small>
                </div>
                <div className="p-desc">
                  Prove it on your own backlog before paying anything.
                </div>
                <ul>
                  <li>Up to 25 investigations</li>
                  <li>1 repository</li>
                  <li>Full artifact output</li>
                </ul>
                <Link href="/contact" className="btn btn-ghost">
                  Start pilot
                </Link>
              </div>
              <div className="price-card hot">
                <div className="p-name">Team · early access</div>
                <div className="p-price">
                  $499 <small>/ month</small>
                </div>
                <div className="p-desc">
                  For teams making Sherlock part of triage.
                </div>
                <ul>
                  <li>150 investigations / month</li>
                  <li>Unlimited repositories</li>
                  <li>Priority queue &amp; support</li>
                </ul>
                <Link href="/contact" className="btn btn-primary">
                  Book a demo
                </Link>
              </div>
              <div className="price-card">
                <div className="p-name">Enterprise</div>
                <div className="p-price">Custom</div>
                <div className="p-desc">
                  Self-hosted workers, SSO, and custom controls.
                </div>
                <ul>
                  <li>Run workers in your VPC</li>
                  <li>Audit log export</li>
                  <li>Security review &amp; DPA</li>
                </ul>
                <Link href="/contact" className="btn btn-ghost">
                  Talk to us
                </Link>
              </div>
            </div>
          </Reveal>
          <div className="mt-7 text-center">
            <Link href="/pricing" className="dim text-[14px]">
              Full pricing details →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- 9 · final CTA */}
      <section className="final-cta">
        <div className="wrap">
          <span className="kicker">Get started</span>
          <h2>Bring Sherlock into your bug triage flow.</h2>
          <p>
            Comment <span className="mono">/sherlock investigate</span> on an
            issue. Review a verified PR. That&apos;s the whole workflow.
          </p>
          <div className="hero-ctas justify-center">
            <Link href="/contact" className="btn btn-primary btn-lg">
              Book a demo
            </Link>
            <Link href="/docs" className="btn btn-ghost btn-lg">
              Read the docs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
