import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Book a demo",
  description:
    "Book a Sherlock demo: watch an issue from your own backlog go from bug report to verified pull request.",
};

export default function Contact() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="kicker">Contact</span>
          <h1>See your own bug get fixed</h1>
          <p>
            The best demo is your backlog. Bring an issue; we&apos;ll run the
            investigation live and walk through every artifact it produces.
          </p>
        </div>
      </section>

      <div className="wrap contact-grid">
        <Reveal>
          <div className="ledger">
            <div className="ledger-row" style={{ gridTemplateColumns: "34px 1fr" }}>
              <span className="l-key mono">30m</span>
              <span className="l-val">
                Live demo on a repo like yours — or on your repo, if you
                install the pilot App first.
              </span>
            </div>
            <div className="ledger-row" style={{ gridTemplateColumns: "34px 1fr" }}>
              <span className="l-key mono">0</span>
              <span className="l-val">
                Code changes required to try it. Install the GitHub App,
                comment on an issue, done.
              </span>
            </div>
            <div className="ledger-row" style={{ gridTemplateColumns: "34px 1fr" }}>
              <span className="l-key mono">14d</span>
              <span className="l-val">
                Free pilot after the demo — 25 investigations on one
                repository, full artifacts.
              </span>
            </div>
          </div>
          <p className="dim" style={{ marginTop: 24, fontSize: 14.5 }}>
            Prefer email? Reach us at{" "}
            <a href="mailto:team@sherlock.dev" style={{ color: "var(--brand)" }}>
              team@sherlock.dev
            </a>
            . Security questionnaires and DPA requests welcome.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <ContactForm />
        </Reveal>
      </div>
    </>
  );
}
