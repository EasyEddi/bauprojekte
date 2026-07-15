import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminLogin } from "@/components/admin-login";
import { ProjectForm, type InitialPriceImport } from "@/components/project-form";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Neues Projekt" };

export const dynamic = "force-dynamic";

type NewProjectSearchParams = {
  priceMinor?: string;
  productName?: string;
  productUrl?: string;
};

function initialPriceImport(parameters: NewProjectSearchParams): InitialPriceImport | undefined {
  const priceMinor = Number(parameters.priceMinor);
  if (!Number.isInteger(priceMinor) || priceMinor < 0 || priceMinor > 100_000_000) return undefined;
  if (!parameters.productUrl || parameters.productUrl.length > 2048) return undefined;
  try {
    const productUrl = new URL(parameters.productUrl);
    if (!["http:", "https:"].includes(productUrl.protocol)) return undefined;
    return {
      priceMinor,
      productName: parameters.productName?.trim().slice(0, 120) ?? "",
      productUrl: productUrl.toString(),
    };
  } catch {
    return undefined;
  }
}

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<NewProjectSearchParams> }) {
  const authenticated = await isAdmin();
  const importedMaterial = initialPriceImport(await searchParams);
  return (
    <div className="form-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} aria-hidden="true" /> Zur Übersicht
      </Link>
      <header className="form-header">
        <h1>{authenticated ? "Neues Projekt" : "Anmelden"}</h1>
      </header>
      {authenticated ? <ProjectForm initialImport={importedMaterial} /> : <AdminLogin />}
    </div>
  );
}
