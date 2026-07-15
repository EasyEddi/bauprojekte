import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PriceImportClient } from "@/components/price-import-client";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Preis übernehmen" };
export const dynamic = "force-dynamic";

export default async function PriceImportPage({ searchParams }: { searchParams: Promise<{ priceMinor?: string }> }) {
  if (!await isAdmin()) redirect("/neu");
  const value = Number((await searchParams).priceMinor);
  if (!Number.isInteger(value) || value < 0 || value > 100_000_000) redirect("/preishelfer");
  return <main className="price-import-page"><PriceImportClient priceMinor={value} /></main>;
}
