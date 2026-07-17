import "server-only";

import type { PriceSource, PriceStatus, ProjectKind } from "@/lib/projects";

export type ProjectMaterialInput = {
  id?: string;
  name: string;
  productUrl: string;
  quantity: number;
  unitPriceMinor: number;
  priceStatus: Extract<PriceStatus, "current" | "manual">;
  priceSource?: PriceSource;
  lastCheckedAt?: string;
};

export type ProjectInput = {
  kind: ProjectKind;
  name: string;
  description: string;
  image: File | null;
  removeImage: boolean;
  materials: ProjectMaterialInput[];
};

type IncomingMaterial = {
  id?: unknown;
  name?: unknown;
  productUrl?: unknown;
  quantity?: unknown;
  unitPriceMinor?: unknown;
  priceStatus?: unknown;
  priceSource?: unknown;
  lastCheckedAt?: unknown;
};

export type ProjectInputResult =
  | { data: ProjectInput; error?: never }
  | { data?: never; error: string };

function isAllowedImage(value: FormDataEntryValue | null): value is File {
  return value instanceof File
    && ["image/jpeg", "image/png", "image/webp"].includes(value.type)
    && value.size > 0
    && value.size <= 2 * 1024 * 1024;
}

function parseMaterials(raw: FormDataEntryValue | null): ProjectMaterialInput[] | null {
  if (typeof raw !== "string") return null;
  let values: IncomingMaterial[];
  try {
    values = JSON.parse(raw) as IncomingMaterial[];
  } catch {
    return null;
  }
  if (!Array.isArray(values) || values.length > 50) return null;

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
    if (!["current", "manual"].includes(String(value.priceStatus))) return null;
    if (value.priceSource !== undefined && !["server", "browser", "manual"].includes(String(value.priceSource))) return null;
    const checkedAt = typeof value.lastCheckedAt === "string" && Number.isFinite(Date.parse(value.lastCheckedAt))
      ? new Date(value.lastCheckedAt).toISOString()
      : undefined;
    return {
      id: typeof value.id === "string" && value.id.length <= 100 ? value.id : undefined,
      name: value.name.trim(),
      productUrl: url.toString(),
      quantity: value.quantity,
      unitPriceMinor: value.unitPriceMinor,
      priceStatus: value.priceStatus as "current" | "manual",
      priceSource: value.priceSource as PriceSource | undefined,
      lastCheckedAt: checkedAt,
    };
  });

  return materials.every((material) => material !== null) ? materials : null;
}

export function parseProjectInput(form: FormData): ProjectInputResult {
  const kind = form.get("kind") ?? "project";
  const name = form.get("name");
  const description = form.get("description");
  const image = form.get("image");
  const materials = parseMaterials(form.get("materials"));

  if (kind !== "project" && kind !== "idea") {
    return { error: "Bitte wähle eine gültige Art aus." };
  }
  if (typeof name !== "string" || name.trim().length < 2 || name.length > 120) {
    return { error: "Bitte gib einen gültigen Projektnamen ein." };
  }
  if (typeof description !== "string" || description.length > 5000) {
    return { error: "Bitte gib eine gültige Beschreibung ein." };
  }
  const optionalImage = image instanceof File && image.size === 0 ? null : image;
  if (optionalImage !== null && !isAllowedImage(optionalImage)) {
    return { error: "Bitte wähle ein JPG-, PNG- oder WebP-Bild bis 2 MB aus." };
  }
  if (!materials || (kind === "project" && materials.length < 1)) {
    return { error: "Bitte prüfe die Materialangaben." };
  }

  return {
    data: {
      kind,
      name: name.trim(),
      description: description.trim(),
      image: optionalImage,
      removeImage: form.get("removeImage") === "on",
      materials,
    },
  };
}
