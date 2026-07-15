import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem("bauprojekte-theme")||"dark"}catch{document.documentElement.dataset.theme="dark"}`;

export const metadata: Metadata = {
  title: {
    default: "Bauprojekte",
    template: "%s · Bauprojekte",
  },
  description: "Bauideen, Materiallisten und aktuelle Projektkosten auf einen Blick.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="site-header">
          <ThemeToggle />
          <Link className="brand" href="/">Bauprojekte</Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
