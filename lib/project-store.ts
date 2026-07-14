import "server-only";
import { list, put } from "@vercel/blob";
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

type NewProject = {
  name: string;
  description: string;
  image: File;
  materials: Array<Pick<Material, "name" | "productUrl" | "quantity" | "unitPriceMinor">>;
};

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

export async function saveProject(input: NewProject): Promise<Project> {
  const slug = slugify(input.name);
  const extension = input.image.type === "image/png" ? "png" : input.image.type === "image/webp" ? "webp" : "jpg";
  const imageBlob = await put(`images/${slug}.${extension}`, input.image, {
    access: "public",
    addRandomSuffix: false,
  });

  const now = new Date();
  const project: Project = {
    id: crypto.randomUUID(),
    slug,
    createdAt: now.toISOString(),
    name: input.name,
    summary: input.description.slice(0, 180),
    description: input.description,
    image: imageBlob.url,
    imageAlt: input.name,
    status: "Geplant",
    difficulty: "Noch offen",
    duration: "Noch offen",
    materials: input.materials.map((material, index) => ({
      id: crypto.randomUUID(),
      name: material.name,
      productUrl: material.productUrl,
      quantity: material.quantity,
      unitLabel: "Stück",
      unitPriceMinor: material.unitPriceMinor,
      currency: "EUR",
      priceStatus: "manual",
      lastCheckedLabel: now.toLocaleDateString("de-DE"),
      sortOrder: index + 1,
    })),
  };

  await put(`${projectPrefix}${slug}.json`, JSON.stringify(project), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
  });

  return project;
}
