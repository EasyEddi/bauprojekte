import "server-only";

import { del, list, put } from "@vercel/blob";
import { fetchProductPrice } from "@/lib/price-fetcher";
import type { ProjectInput, ProjectMaterialInput } from "@/lib/project-input";
import { formatCheckedDate, type Material, type Project } from "@/lib/projects";

const projectPrefix = "projects/";

export async function getProjects(): Promise<Project[]> {
  const { blobs } = await list({ prefix: projectPrefix, limit: 1000 });
  const projects = await Promise.all(
    blobs
      .filter((blob) => blob.pathname.endsWith(".json"))
      .map(async (blob) => {
        const readUrl = new URL(blob.url);
        readUrl.searchParams.set("version", `${new Date(blob.uploadedAt).toISOString()}-${crypto.randomUUID()}`);
        const response = await fetch(readUrl, { cache: "no-store" });
        if (!response.ok) return null;
        return response.json() as Promise<Project>;
      }),
  );

  const latestBySlug = new Map<string, Project>();
  for (const project of projects.filter((entry): entry is Project => entry !== null)) {
    const current = latestBySlug.get(project.slug);
    const projectVersion = `${project.updatedAt ?? project.createdAt}:${project.revision ?? "legacy"}`;
    const currentVersion = current
      ? `${current.updatedAt ?? current.createdAt}:${current.revision ?? "legacy"}`
      : "";
    if (!current || projectVersion > currentVersion) latestBySlug.set(project.slug, project);
  }

  return [...latestBySlug.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

function slugify(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "projekt";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

async function uploadImage(slug: string, image: File) {
  const extension = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
  const imageBlob = await put(`images/${slug}.${extension}`, image, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return imageBlob.url;
}

function projectMaterials(input: ProjectMaterialInput[], now: Date, existing: Project | null): Material[] {
  return input.map((material, index) => {
    const previous = material.id ? existing?.materials.find((entry) => entry.id === material.id) : undefined;
    const lastCheckedAt = material.lastCheckedAt ?? previous?.lastCheckedAt ?? (previous ? undefined : now.toISOString());
    return {
      id: previous?.id ?? crypto.randomUUID(),
      name: material.name,
      productUrl: material.productUrl,
      quantity: material.quantity,
      unitLabel: previous?.unitLabel ?? "Stück",
      unitPriceMinor: material.unitPriceMinor,
      currency: "EUR",
      priceStatus: material.priceStatus,
      priceSource: material.priceSource ?? previous?.priceSource ?? (material.priceStatus === "manual" ? "manual" : undefined),
      lastCheckedAt,
      lastCheckedLabel: lastCheckedAt
        ? formatCheckedDate(new Date(lastCheckedAt))
        : previous?.lastCheckedLabel ?? formatCheckedDate(now),
      sortOrder: index + 1,
    };
  });
}

async function writeProject(project: Project) {
  if (!project.updatedAt || !project.revision) throw new Error("Projektversion fehlt.");
  const versionKey = project.updatedAt.replace(/[:.]/g, "-");
  await put(`${projectPrefix}${project.slug}/${versionKey}-${project.revision}.json`, JSON.stringify(project), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: "application/json; charset=utf-8",
  });
}

export async function refreshProjectPrices(project: Project): Promise<Project> {
  const checkedAt = new Date();

  const materials = await Promise.all(project.materials.map(async (material) => {
    const source = material.priceSource ?? (material.priceStatus === "manual" ? "manual" : undefined);
    if (source === "browser" || source === "manual") {
      return material.priceSource ? material : { ...material, priceSource: source };
    }

    try {
      const result = await fetchProductPrice(material.productUrl);
      return {
        ...material,
        unitPriceMinor: result.priceMinor,
        currency: "EUR" as const,
        priceStatus: "current" as const,
        priceSource: "server" as const,
        lastCheckedAt: checkedAt.toISOString(),
        lastCheckedLabel: formatCheckedDate(checkedAt),
      };
    } catch {
      if (!material.priceSource) return { ...material, priceSource: "browser" as const };
      if (material.priceStatus === "stale") return material;
      return { ...material, priceStatus: "stale" as const };
    }
  }));

  // A detail-page refresh must never write an older project snapshot back to
  // storage. Vercel Blob list results can briefly lag behind an overwrite,
  // which would otherwise undo a just-saved edit. Refreshed prices are only
  // used for this rendered response; project edits remain the sole writer.
  return { ...project, materials };
}

export async function saveProject(input: ProjectInput): Promise<Project> {
  const slug = slugify(input.name);
  const imageUrl = input.image ? await uploadImage(slug, input.image) : null;
  const now = new Date();
  const project: Project = {
    id: crypto.randomUUID(),
    slug,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    revision: crypto.randomUUID(),
    kind: input.kind,
    name: input.name,
    summary: input.description.slice(0, 180),
    description: input.description,
    image: imageUrl,
    imageAlt: input.name,
    status: "Geplant",
    difficulty: "Noch offen",
    duration: "Noch offen",
    materials: projectMaterials(input.materials, now, null),
  };

  await writeProject(project);

  return project;
}

export async function updateProject(slug: string, input: ProjectInput): Promise<Project | null> {
  const existing = await getProjectBySlug(slug);
  if (!existing) return null;

  let imageUrl = existing.image;
  if (input.image) {
    const nextImageUrl = await uploadImage(slug, input.image);
    if (existing.image && existing.image !== nextImageUrl) await del(existing.image);
    imageUrl = nextImageUrl;
  } else if (input.removeImage && existing.image) {
    await del(existing.image);
    imageUrl = null;
  }

  const now = new Date();
  const project: Project = {
    ...existing,
    updatedAt: now.toISOString(),
    revision: crypto.randomUUID(),
    kind: input.kind,
    name: input.name,
    summary: input.description.slice(0, 180),
    description: input.description,
    image: imageUrl,
    imageAlt: input.name,
    materials: projectMaterials(input.materials, now, existing),
  };

  await writeProject(project);

  return project;
}

export async function deleteProject(slug: string): Promise<boolean> {
  const existing = await getProjectBySlug(slug);
  if (!existing) return false;
  const { blobs } = await list({ prefix: projectPrefix, limit: 1000 });
  const projectBlobs = blobs
    .filter((blob) => blob.pathname === `${projectPrefix}${slug}.json` || blob.pathname.startsWith(`${projectPrefix}${slug}/`))
    .map((blob) => blob.url);
  await del([...projectBlobs, ...(existing.image ? [existing.image] : [])]);
  return true;
}
