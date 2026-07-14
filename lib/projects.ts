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
  createdAt: string;
  name: string;
  summary: string;
  description: string;
  image: string | null;
  imageAlt: string;
  status: string;
  difficulty: string;
  duration: string;
  materials: Material[];
};

export function getProjectTotal(project: Project) {
  return project.materials.reduce((sum, material) => sum + material.quantity * material.unitPriceMinor, 0);
}

export function formatPrice(priceMinor: number, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(priceMinor / 100);
}
