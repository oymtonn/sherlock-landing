import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-col" style={{ maxWidth: 260 }}>
            <span className="brand">
              <Logo />
              Sherlock
            </span>
            <span style={{ marginTop: 8 }}>
              GitHub bugs to verified pull requests.
            </span>
          </div>
          <div className="footer-col">
            <b>Product</b>
            <Link href="/product">Overview</Link>
            <Link href="/product#graphify">Graphify</Link>
            <Link href="/product#verification">Verification</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className="footer-col">
            <b>Resources</b>
            <Link href="/docs">How it works</Link>
            <Link href="/docs#quickstart">Quickstart</Link>
            <Link href="/security">Security</Link>
          </div>
          <div className="footer-col">
            <b>Company</b>
            <Link href="/contact">Contact</Link>
            <Link href="/contact">Book a demo</Link>
          </div>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} Sherlock</span>
          <span>evidence &gt; vibes</span>
        </div>
      </div>
    </footer>
  );
}
