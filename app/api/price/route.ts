import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { fetchProductPrice, PriceFetchError } from "@/lib/price-fetcher";
import { hasValidRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export const preferredRegion = "fra1";

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  if (!hasValidRequestOrigin(request)) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  const body = await request.json().catch(() => null) as { url?: unknown } | null;
  if (!body || typeof body.url !== "string" || body.url.length > 2048) {
    return NextResponse.json({ error: "Bitte gib einen gültigen Produktlink ein." }, { status: 400 });
  }
  try {
    return NextResponse.json(await fetchProductPrice(body.url));
  } catch (error) {
    const message = error instanceof PriceFetchError ? error.message : "Der Preis konnte nicht geladen werden.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
