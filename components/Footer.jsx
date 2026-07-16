import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--line-soft)] pt-14 pb-10 mt-auto text-[14px] text-[color:var(--ink-faint)]">
      <div className="wrap">
        <div className="flex justify-between gap-10 flex-wrap">
          <div className="footer-col max-w-[260px]">
            <span className="brand">
              <Logo />
              Sherlock
            </span>
            <span className="mt-2">
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
        <div className="mono mt-11 pt-5 border-t border-[color:var(--line-soft)] flex justify-between gap-4 flex-wrap text-[12px]">
          <span>© {new Date().getFullYear()} Sherlock</span>
          <span>evidence &gt; vibes</span>
        </div>
      </div>
    </footer>
  );
}
