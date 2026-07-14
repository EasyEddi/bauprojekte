import type { Metadata } from "next";
import Link from "next/link";
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
          <Link className="brand" href="/">Bauprojekte</Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
