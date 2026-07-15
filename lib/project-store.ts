import "server-only";

import { del, list, put } from "@vercel/blob";
import type { ProjectInput, ProjectMaterialInput } from "@/lib/project-input";
import type { Material, Project } from "@/lib/projects";

const projectPrefix = "projects/";

export async function getProjects(): Promise<Project[]> {
  const { blobs } = await list({ prefix: projectPrefix, limit: 1000 });
  const projects = await Promise.all(
    blobs
      .filter((blob) => blob.pathname.endsWith(".json"))
      .map(async (blob) => {
        const response = await fetch(blob.url, { cache: "no-store" });
        if (!response.ok) return null;
        return response.json() as Promise<Project>;
      }),
  );

  return projects
    .filter((project): project is Project => project !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
    return {
      id: previous?.id ?? crypto.randomUUID(),
      name: material.name,
      productUrl: material.productUrl,
      quantity: material.quantity,
      unitLabel: previous?.unitLabel ?? "Stück",
      unitPriceMinor: material.unitPriceMinor,
      currency: "EUR",
      priceStatus: material.priceStatus,
      lastCheckedLabel: now.toLocaleDateString("de-DE"),
      sortOrder: index + 1,
    };
  });
}

export async function saveProject(input: ProjectInput): Promise<Project> {
  const slug = slugify(input.name);
  const imageUrl = input.image ? await uploadImage(slug, input.image) : null;
  const now = new Date();
  const project: Project = {
    id: crypto.randomUUID(),
    slug,
    createdAt: now.toISOString(),
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

  await put(`${projectPrefix}${slug}.json`, JSON.stringify(project), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  });

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
    name: input.name,
    summary: input.description.slice(0, 180),
    description: input.description,
    image: imageUrl,
    imageAlt: input.name,
    materials: projectMaterials(input.materials, now, existing),
  };

  await put(`${projectPrefix}${slug}.json`, JSON.stringify(project), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  });

  return project;
}

export async function deleteProject(slug: string): Promise<boolean> {
  const existing = await getProjectBySlug(slug);
  if (!existing) return false;
  await del([`${projectPrefix}${slug}.json`, ...(existing.image ? [existing.image] : [])]);
  return true;
}
