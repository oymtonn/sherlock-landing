import Link from "next/link";
// import CaseAnimation from "@/components/CaseAnimation";
import HeroHunt from "@/components/HeroHunt";
// import Reveal from "@/components/Reveal";
import ScrollCase from "@/components/ScrollCase";
import Spotlight from "@/components/Spotlight";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <Spotlight className="hero hero-center">
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
      </Spotlight>

      {/* The case replay is unique to the landing page. Detailed product,
          security, artifact, and pricing content lives on their own pages.
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
      </section>*/}

      <ScrollCase />

      {/* Final CTA */}
      <section className="final-cta">
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

          <div className="cta-demo" aria-label="Sign-in demo video placeholder">
            <div className="cta-demo-bar"></div>
            <div className="cta-demo-screen">
              <span>Video placeholder</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
