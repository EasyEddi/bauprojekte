import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PriceHelperInstall } from "@/components/price-helper-install";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Preishelfer" };
export const dynamic = "force-dynamic";

export default async function PriceHelperPage() {
  if (!await isAdmin()) redirect("/neu");
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "bauprojekte.vercel.app";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return (
    <div className="form-page price-helper-page">
      <Link className="back-link" href="/neu"><ArrowLeft size={18} aria-hidden="true" /> Zum Projektformular</Link>
      <header className="form-header"><h1>Preishelfer</h1></header>
      <PriceHelperInstall origin={origin} />
    </div>
  );
}
