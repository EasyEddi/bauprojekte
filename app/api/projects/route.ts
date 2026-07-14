import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { saveProject } from "@/lib/project-store";

type IncomingMaterial = {
  name?: unknown;
  productUrl?: unknown;
  quantity?: unknown;
  unitPriceMinor?: unknown;
};

function isAllowedImage(value: FormDataEntryValue | null): value is File {
  return value instanceof File
    && ["image/jpeg", "image/png", "image/webp"].includes(value.type)
    && value.size > 0
    && value.size <= 2 * 1024 * 1024;
}

function parseMaterials(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") return null;
  let values: IncomingMaterial[];
  try {
    values = JSON.parse(raw) as IncomingMaterial[];
  } catch {
    return null;
  }
  if (!Array.isArray(values) || values.length < 1 || values.length > 50) return null;

  const materials = values.map((value) => {
    if (typeof value.name !== "string" || value.name.trim().length < 1 || value.name.length > 120) return null;
    if (typeof value.productUrl !== "string") return null;
    let url: URL;
    try {
      url = new URL(value.productUrl);
    } catch {
      return null;
    }
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (typeof value.quantity !== "number" || !Number.isFinite(value.quantity) || value.quantity <= 0 || value.quantity > 10000) return null;
    if (typeof value.unitPriceMinor !== "number" || !Number.isInteger(value.unitPriceMinor) || value.unitPriceMinor < 0 || value.unitPriceMinor > 100_000_000) return null;
    return {
      name: value.name.trim(),
      productUrl: url.toString(),
      quantity: value.quantity,
      unitPriceMinor: value.unitPriceMinor,
    };
  });

  return materials.every((material) => material !== null) ? materials : null;
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Die Formulardaten konnten nicht gelesen werden." }, { status: 400 });
  }
  const name = form.get("name");
  const description = form.get("description");
  const image = form.get("image");
  const materials = parseMaterials(form.get("materials"));

  if (typeof name !== "string" || name.trim().length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Bitte gib einen gültigen Projektnamen ein." }, { status: 400 });
  }
  if (typeof description !== "string" || description.trim().length < 2 || description.length > 5000) {
    return NextResponse.json({ error: "Bitte gib eine gültige Beschreibung ein." }, { status: 400 });
  }
  if (!isAllowedImage(image)) {
    return NextResponse.json({ error: "Bitte wähle ein JPG-, PNG- oder WebP-Bild bis 2 MB aus." }, { status: 400 });
  }
  if (!materials) {
    return NextResponse.json({ error: "Bitte prüfe die Materialangaben." }, { status: 400 });
  }

  try {
    const project = await saveProject({ name: name.trim(), description: description.trim(), image, materials });
    return NextResponse.json({ slug: project.slug }, { status: 201 });
  } catch (error) {
    console.error("Projekt konnte nicht gespeichert werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
    return NextResponse.json({ error: "Das Projekt konnte nicht gespeichert werden. Bitte versuche es erneut." }, { status: 500 });
  }
}
