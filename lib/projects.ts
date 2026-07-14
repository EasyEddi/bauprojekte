export type PriceStatus = "current" | "manual" | "stale";

export type Material = {
  id: string;
  name: string;
  productUrl: string;
  quantity: number;
  unitLabel: string;
  unitPriceMinor: number;
  currency: "EUR";
  priceStatus: PriceStatus;
  lastCheckedLabel: string;
  sortOrder: number;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  image: string;
  imageAlt: string;
  status: string;
  difficulty: string;
  duration: string;
  materials: Material[];
};

export const projects: Project[] = [];

export function getProjectTotal(project: Project) {
  return project.materials.reduce((sum, material) => sum + material.quantity * material.unitPriceMinor, 0);
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function formatPrice(priceMinor: number, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(priceMinor / 100);
}
