import Link from "next/link";
import HeroHunt from "@/components/HeroHunt";
import ScrollCase from "@/components/ScrollCase";
import Spotlight from "@/components/Spotlight";
import {
  AmbientVisualPlaceholder,
  PullRequestPlaceholder,
  VideoArtifactPlaceholder,
} from "@/components/Placeholders";

// The landing page tells one investigation, start to close:
// hero (case opened) → scroll case file (the four moves) → verification
// (proof, not promises) → the pull request (everything lands in one PR)
// → case-closed CTA. Detailed product, security and pricing content lives
// on its own pages.
export default function Home() {
  return (
    <>
      {/* ── Hero — the case opens ─────────────────────────────────────── */}
      <Spotlight className="hero hero-center hero-stage">
        <AmbientVisualPlaceholder />
        <i className="grain-veil" aria-hidden="true" />
        <div className="wrap">
          <HeroHunt>
            <h1>
              <span className="block">GitHub bugs to</span>
              <span className="block whitespace-nowrap">
                <em>verified</em> pull requests
              </span>
            </h1>
          </HeroHunt>
          <p className="text-[#E7E7E7] font-bold text-[25px] max-w-[620px] mx-auto mb-8">
            <span className="block">Vibe-code your app today.</span>
            <span className="block">
              Sherlock keeps it working tomorrow.
            </span>
          </p>
          <div className="hero-ctas">
            <Link href="/contact" className="btn btn-primary btn-lg">
              TRY IT FOR FREE
            </Link>
          </div>
        </div>

        {/* transition: measurement ruler — the investigation begins */}
        <div className="hero-baseline" aria-hidden="true">
        </div>
      </Spotlight>
      <ScrollCase />
      <div className="divider-hatch" aria-hidden="true" />

      {/* ── Verification — proof, not promises ────────────────────────── */}
      <section className="verify-section" aria-labelledby="verify-title">
        <div className="wrap">
          <div className="section-head verify-head">
            
            <h2 id="verify-title">See the bug. See it gone.</h2>
            <p>
              Sherlock records the failure, applies the fix, and runs the
              same path again.
            </p>
          </div>

          <div className="verify-compare">
            <div className="verify-frame is-fail">
              <VideoArtifactPlaceholder
                tone="bug"
                badge="failed"
                label="16:10 before-fix reproduction"
                meta="run 01 · unpatched build"
              />
            </div>

            <div className="verify-spine" aria-hidden="true">
              <span className="verify-spine-chip mono">patch applied</span>
            </div>

            <div className="verify-frame is-pass">
              <VideoArtifactPlaceholder
                tone="verified"
                badge="passed"
                label="16:10 after-fix verification"
                meta="run 02 · patched build"
              />
            </div>
          </div>

          {/* one shared execution timeline: identical steps on both runs */}
          <div className="verify-timeline" aria-hidden="true">
            <div className="vt-half vt-fail mono">
              <span className="vt-mark">open route</span>
              <span className="vt-mark">replay steps</span>
              <span className="vt-mark">assert</span>
            </div>
            <span className="vt-node" />
            <div className="vt-half vt-pass mono">
              <span className="vt-mark">open route</span>
              <span className="vt-mark">replay steps</span>
              <span className="vt-mark">assert</span>
            </div>
          </div>
        </div>
      </section>

      {/* transition: hatched evidence band */}
      <div className="divider-hatch" aria-hidden="true" />

      {/* ── Case file closes into one pull request ────────────────────── */}
      <section className="pr-section" aria-labelledby="pr-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="pr-title">Everything lands in one pull request.</h2>
            <p>The fix, the reasoning, and the proof—ready for review.</p>
          </div>

          <div className="pr-stage">
            <i className="corner-marks pr-stage-marks" aria-hidden="true" />
            <span className="pr-stamp" aria-hidden="true">
              verified · slk-4127
            </span>
            <PullRequestPlaceholder />
          </div>
        </div>
      </section>

      <div className="divider-hatch" aria-hidden="true" />

      {/* ── Final CTA — case closed ───────────────────────────────────── */}
      <section className="final-cta case-closed">
        <div className="wrap final-cta-grid">
          <div className="final-cta-copy">
            <h2>Ship Your App with Sherlock</h2>
            <p>
              No credit card required. No risk. No commitment. Just a free trial of Sherlock.
            </p>
            <div className="hero-ctas">
              <Link href="/contact" className="btn btn-primary btn-lg">
                Start investigating
              </Link>
              <Link href="/pricing" className="underline btn-lg">
                See pricing
              </Link>
            </div>
          </div>

          <div
            className="cta-demo"
            role="img"
            aria-label="Sherlock investigation-to-PR product demo — video placeholder, 16:10"
          >
            <div className="cta-demo-bar mono" aria-hidden="true">
              <span className="panel-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="cta-demo-name">sherlock — product demo</span>
              <span className="cta-demo-ratio">16:10</span>
            </div>
            <div className="cta-demo-screen" aria-hidden="true">
              <span className="cta-play">▶</span>
              <strong>Sherlock investigation-to-PR product demo</strong>
              <span className="mono">16:10 — drop the final recording here</span>
              <span className="cta-demo-chapters mono">
                issue → evidence → patch → <b>verified</b>
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
