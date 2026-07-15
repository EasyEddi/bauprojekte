import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { parseProjectInput } from "@/lib/project-input";
import { saveProject } from "@/lib/project-store";
import { hasValidRequestOrigin } from "@/lib/request-origin";

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Die Formulardaten konnten nicht gelesen werden." }, { status: 400 });
  }

  const parsed = parseProjectInput(form);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const project = await saveProject(parsed.data);
    return NextResponse.json({ slug: project.slug }, { status: 201 });
  } catch (error) {
    console.error("Projekt konnte nicht gespeichert werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
    return NextResponse.json({ error: "Das Projekt konnte nicht gespeichert werden. Bitte versuche es erneut." }, { status: 500 });
  }
}
