import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StrayBug from "@/components/StrayBug";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Sherlock — GitHub bugs to verified pull requests",
    template: "%s — Sherlock",
  },
  description:
    "Sherlock reproduces GitHub issues, maps your repo, patches the bug, verifies the fix by replaying the reproduction, and opens a PR your team can review.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body>
        <div className="site">
          <Nav />
          <main>{children}</main>
          <Footer />
          <StrayBug />
        </div>
      </body>
    </html>
  );
}
