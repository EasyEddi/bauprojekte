import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { parseProjectInput } from "@/lib/project-input";
import { deleteProject, updateProject } from "@/lib/project-store";
import { hasValidRequestOrigin } from "@/lib/request-origin";

type ProjectRouteContext = { params: Promise<{ slug: string }> };

function validSlug(slug: string) {
  return /^[a-z0-9-]{1,80}$/.test(slug);
}

export async function PATCH(request: Request, { params }: ProjectRouteContext) {
  if (!await isAdmin()) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  if (!hasValidRequestOrigin(request)) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  const { slug } = await params;
  if (!validSlug(slug)) return NextResponse.json({ error: "Ungültiges Projekt." }, { status: 400 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Die Formulardaten konnten nicht gelesen werden." }, { status: 400 });
  }
  const parsed = parseProjectInput(form);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const project = await updateProject(slug, parsed.data);
    if (!project) return NextResponse.json({ error: "Projekt nicht gefunden." }, { status: 404 });
    return NextResponse.json({ slug: project.slug });
  } catch (error) {
    console.error("Projekt konnte nicht aktualisiert werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
    return NextResponse.json({ error: "Das Projekt konnte nicht aktualisiert werden." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: ProjectRouteContext) {
  if (!await isAdmin()) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  if (!hasValidRequestOrigin(request)) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  const { slug } = await params;
  if (!validSlug(slug)) return NextResponse.json({ error: "Ungültiges Projekt." }, { status: 400 });

  try {
    const deleted = await deleteProject(slug);
    if (!deleted) return NextResponse.json({ error: "Projekt nicht gefunden." }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Projekt konnte nicht gelöscht werden:", error instanceof Error ? error.message : "Unbekannter Fehler");
    return NextResponse.json({ error: "Das Projekt konnte nicht gelöscht werden." }, { status: 500 });
  }
}
