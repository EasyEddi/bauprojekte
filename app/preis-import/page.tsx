import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PriceImportClient } from "@/components/price-import-client";

export const metadata: Metadata = { title: "Preis übernehmen" };
export const dynamic = "force-dynamic";

type PriceImportSearchParams = {
  priceMinor?: string;
  productUrl?: string;
  productName?: string;
};

function validProductUrl(value: string | undefined) {
  if (!value || value.length > 2048) return "";
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export default async function PriceImportPage({ searchParams }: { searchParams: Promise<PriceImportSearchParams> }) {
  const parameters = await searchParams;
  const value = Number(parameters.priceMinor);
  if (!Number.isInteger(value) || value < 0 || value > 100_000_000) redirect("/preishelfer");
  return (
    <main className="price-import-page">
      <PriceImportClient
        priceMinor={value}
        productName={parameters.productName?.trim().slice(0, 120) ?? ""}
        productUrl={validProductUrl(parameters.productUrl)}
      />
    </main>
  );
}
