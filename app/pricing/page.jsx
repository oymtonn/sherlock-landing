import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Pricing",
  description:
    "Sherlock early-access pricing: free pilot, team plan, and enterprise self-hosting. Priced per investigation, not per seat.",
};

export default function Pricing() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="kicker">Pricing</span>
          <h1>Pay for investigations, not seats</h1>
          <p>
            An investigation is one issue taken from report to verified PR (or
            an honest &quot;could not reproduce&quot;). That&apos;s the unit
            that maps to value.
          </p>
        </div>
      </section>

      <section className="section border-t-0 pt-10">
        <div className="wrap">
          <Reveal>
            <div className="price-grid">
              <div className="price-card">
                <div className="p-name">Pilot</div>
                <div className="p-price">$0 <small>/ 14 days</small></div>
                <div className="p-desc">
                  Point Sherlock at your real backlog and judge the PRs.
                </div>
                <ul>
                  <li>Up to 25 investigations</li>
                  <li>1 repository</li>
                  <li>Full artifacts on every run</li>
                  <li>Community support</li>
                </ul>
                <Link href="/contact" className="btn btn-ghost">Start pilot</Link>
              </div>
              <div className="price-card hot">
                <div className="p-name">Team · early access</div>
                <div className="p-price">$499 <small>/ month</small></div>
                <div className="p-desc">
                  For teams putting Sherlock in the triage loop.
                </div>
                <ul>
                  <li>150 investigations / month</li>
                  <li>Unlimited repositories</li>
                  <li>Priority investigation queue</li>
                  <li>Slack support · onboarding session</li>
                  <li>Overflow at $4 / investigation</li>
                </ul>
                <Link href="/contact" className="btn btn-primary">Book a demo</Link>
              </div>
              <div className="price-card">
                <div className="p-name">Enterprise</div>
                <div className="p-price">Custom</div>
                <div className="p-desc">
                  For orgs with compliance and scale requirements.
                </div>
                <ul>
                  <li>Self-hosted workers in your VPC</li>
                  <li>SSO / SAML · audit log export</li>
                  <li>Custom rate limits &amp; quotas</li>
                  <li>Security review, DPA, MSA</li>
                </ul>
                <Link href="/contact" className="btn btn-ghost">Talk to us</Link>
              </div>
            </div>
          </Reveal>

          <Reveal className="mt-18">
            <div className="section-head mb-7">
              <h2 className="text-[26px]">Common questions</h2>
            </div>
            <div className="ledger">
              <div className="ledger-row grid-cols-[260px_1fr]">
                <span className="l-key">what counts as an investigation?</span>
                <span className="l-val">
                  One triggered run on one issue, whatever the outcome —
                  verified PR, unverified draft, or a &quot;could not
                  reproduce&quot; report. Queued duplicates don&apos;t count.
                </span>
              </div>
              <div className="ledger-row grid-cols-[260px_1fr]">
                <span className="l-key">what if sherlock can&apos;t fix it?</span>
                <span className="l-val">
                  You still get the artifacts: reproduction attempt, log, and
                  graph context. Teams tell us a clean reproduction alone
                  often halves the fix time.
                </span>
              </div>
              <div className="ledger-row grid-cols-[260px_1fr]">
                <span className="l-key">can we cap spend?</span>
                <span className="l-val">
                  Yes — hard monthly caps and per-installation rate limits are
                  configurable. No surprise overage.
                </span>
              </div>
              <div className="ledger-row grid-cols-[260px_1fr]">
                <span className="l-key">early access means…?</span>
                <span className="l-val">
                  Pricing is locked for 12 months for early teams, and you get
                  a direct line to the engineers building Sherlock.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap">
          <h2>Run the pilot on your ugliest bug.</h2>
          <p>If the PR isn&apos;t reviewable, don&apos;t pay us.</p>
          <Link href="/contact" className="btn btn-primary btn-lg">Book a demo</Link>
        </div>
      </section>
    </>
  );
}
