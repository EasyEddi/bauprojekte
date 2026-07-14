import type { Metadata } from "next";
import Link from "next/link";
import { Hammer } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bauprojekte",
    template: "%s · Bauprojekte",
  },
  description: "Bauideen, Materiallisten und aktuelle Projektkosten auf einen Blick.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Bauprojekte – Startseite">
            <span className="brand-mark" aria-hidden="true">
              <Hammer size={20} strokeWidth={2.4} />
            </span>
            <span>Bauprojekte</span>
          </Link>
          <span className="header-note">Eddis Werkstattplan</span>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>Ideen werden besser, wenn man sie anpackt.</p>
          <span>Mit Plan, Material und ein bisschen Sägemehl.</span>
        </footer>
      </body>
    </html>
  );
}
