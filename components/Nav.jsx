"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { href: "/product", label: "Product" },
  { href: "/security", label: "Security" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/contact", label: "Book a demo" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) =>
    pathname === href || pathname === `${href}/` ? "active" : "";

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <Logo />
          Sherlock
        </Link>
        <div className="nav-cta">
          <nav className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>
          <span className="border-l h-8 inline-block"></span>

          <Link href="/" className="btn btn-ghost">
            Log In
          </Link>
          <Link href="/" className="btn btn-primary">
            Get Started
          </Link>
        </div>
        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      <div className={`nav-mobile ${open ? "open" : ""}`}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
