export type PriceStatus = "current" | "manual" | "stale";
export type PriceSource = "server" | "browser" | "manual";

export type Material = {
  id: string;
  name: string;
  productUrl: string;
  quantity: number;
  unitLabel: string;
  unitPriceMinor: number;
  currency: "EUR";
  priceStatus: PriceStatus;
  priceSource?: PriceSource;
  lastCheckedAt?: string;
  lastCheckedLabel: string;
  sortOrder: number;
};

export type Project = {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt?: string;
  revision?: string;
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

export function formatCheckedDate(value: Date) {
  return value.toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });
}

export function materialSyncLabel(material: Material, now = new Date()) {
  const parsedCheckedAt = material.lastCheckedAt ? new Date(material.lastCheckedAt) : null;
  const checkedLabel = parsedCheckedAt && Number.isFinite(parsedCheckedAt.getTime())
    ? formatCheckedDate(parsedCheckedAt)
    : material.lastCheckedLabel;
  const source = material.priceSource ?? (material.priceStatus === "manual" ? "manual" : undefined);

  if (source === "server" && material.priceStatus === "current") {
    return { isSynced: true, text: "synced" };
  }

  const checkedToday = checkedLabel === formatCheckedDate(now);
  if (source === "browser" && checkedToday) {
    return { isSynced: true, text: `synced · Stand ${checkedLabel}` };
  }

  return { isSynced: false, text: `unsynced · Stand ${checkedLabel}` };
}
