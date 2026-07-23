import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
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
    default: "Sherlock — Once you’re live, stay live",
    template: "%s — Sherlock",
  },
  description:
    "Sherlock finds and fixes bugs after launch so your website keeps running and your users keep moving.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body>
        <div className="site">
          <Nav />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
