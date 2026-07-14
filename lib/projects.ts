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

export const projects: Project[] = [
  {
    id: "project-workbench",
    slug: "mobile-werkbank",
    name: "Mobile Werkbank",
    summary: "Eine stabile Arbeitsfläche für Holzprojekte draußen im Garten.",
    description: "Ich möchte eine robuste Werkbank bauen, die genug Fläche zum Sägen, Bohren und Zusammenbauen bietet, aber trotzdem auf Rollen bewegt werden kann. Unter der Platte entsteht Stauraum für Maschinen und Restholz. So kann ich bei gutem Wetter draußen arbeiten und die Bank danach wieder geschützt unterstellen.",
    image: "/images/werkbank.svg",
    imageAlt: "Illustration einer hölzernen Werkbank im Garten",
    status: "Als Nächstes",
    difficulty: "Mittel",
    duration: "2–3 Tage",
    materials: [
      { id: "w1", name: "Konstruktionsholz 60 × 80 mm", productUrl: "https://www.hornbach.de/", quantity: 6, unitLabel: "Stück", unitPriceMinor: 899, currency: "EUR", priceStatus: "current", lastCheckedLabel: "heute, 08:30 Uhr", sortOrder: 1 },
      { id: "w2", name: "Multiplexplatte Birke 18 mm", productUrl: "https://www.bauhaus.info/", quantity: 1, unitLabel: "Platte", unitPriceMinor: 4790, currency: "EUR", priceStatus: "manual", lastCheckedLabel: "manuell eingetragen", sortOrder: 2 },
      { id: "w3", name: "Lenkrollen mit Feststeller", productUrl: "https://www.obi.de/", quantity: 4, unitLabel: "Stück", unitPriceMinor: 749, currency: "EUR", priceStatus: "current", lastCheckedLabel: "gestern, 19:10 Uhr", sortOrder: 3 },
      { id: "w4", name: "Holzschrauben 6 × 100 mm", productUrl: "https://www.hornbach.de/", quantity: 1, unitLabel: "Packung", unitPriceMinor: 1495, currency: "EUR", priceStatus: "current", lastCheckedLabel: "heute, 08:31 Uhr", sortOrder: 4 },
    ],
  },
  {
    id: "project-raised-bed",
    slug: "hochbeet-aus-laerche",
    name: "Hochbeet aus Lärche",
    summary: "Ein langlebiges Beet für Kräuter, Erdbeeren und frisches Gemüse.",
    description: "Das Hochbeet soll an die sonnige Gartenseite kommen und aus wetterfestem Lärchenholz entstehen. Eine Noppenfolie schützt die Innenseiten, während ein enges Drahtgitter von unten Wühlmäuse fernhält. Die Höhe macht die Gartenarbeit angenehmer und schafft einen festen Platz für eigenes Gemüse.",
    image: "/images/hochbeet.svg",
    imageAlt: "Illustration eines bepflanzten Hochbeets aus Holz",
    status: "In Planung",
    difficulty: "Einfach",
    duration: "1–2 Tage",
    materials: [
      { id: "h1", name: "Lärchenbrett 24 × 140 mm", productUrl: "https://www.bauhaus.info/", quantity: 12, unitLabel: "Stück", unitPriceMinor: 725, currency: "EUR", priceStatus: "current", lastCheckedLabel: "heute, 07:45 Uhr", sortOrder: 1 },
      { id: "h2", name: "Kantholz Lärche 70 × 70 mm", productUrl: "https://www.hornbach.de/", quantity: 4, unitLabel: "Stück", unitPriceMinor: 1190, currency: "EUR", priceStatus: "current", lastCheckedLabel: "heute, 07:46 Uhr", sortOrder: 2 },
      { id: "h3", name: "Noppenfolie für Hochbeete", productUrl: "https://www.obi.de/", quantity: 1, unitLabel: "Rolle", unitPriceMinor: 1999, currency: "EUR", priceStatus: "manual", lastCheckedLabel: "manuell eingetragen", sortOrder: 3 },
      { id: "h4", name: "Volierendraht verzinkt", productUrl: "https://www.obi.de/", quantity: 1, unitLabel: "Rolle", unitPriceMinor: 2499, currency: "EUR", priceStatus: "current", lastCheckedLabel: "gestern, 20:15 Uhr", sortOrder: 4 },
    ],
  },
  {
    id: "project-firewood",
    slug: "feuerholzregal",
    name: "Feuerholzregal",
    summary: "Trocken, ordentlich und direkt am Gartenhaus gestapelt.",
    description: "Mit einem schmalen überdachten Regal soll das Feuerholz endlich luftig und ordentlich lagern. Der Boden bleibt frei, Regen wird durch das schräge Dach abgehalten und die offene Konstruktion sorgt dafür, dass das Holz gut trocknen kann.",
    image: "/images/holzregal.svg",
    imageAlt: "Illustration eines überdachten Feuerholzregals",
    status: "Idee",
    difficulty: "Einfach",
    duration: "1 Tag",
    materials: [
      { id: "f1", name: "Rahmenholz 44 × 74 mm", productUrl: "https://www.hornbach.de/", quantity: 8, unitLabel: "Stück", unitPriceMinor: 519, currency: "EUR", priceStatus: "current", lastCheckedLabel: "heute, 09:02 Uhr", sortOrder: 1 },
      { id: "f2", name: "Dachlatte 24 × 48 mm", productUrl: "https://www.bauhaus.info/", quantity: 6, unitLabel: "Stück", unitPriceMinor: 239, currency: "EUR", priceStatus: "current", lastCheckedLabel: "heute, 09:03 Uhr", sortOrder: 2 },
      { id: "f3", name: "Bitumen-Wellplatte", productUrl: "https://www.obi.de/", quantity: 2, unitLabel: "Platten", unitPriceMinor: 1699, currency: "EUR", priceStatus: "manual", lastCheckedLabel: "manuell eingetragen", sortOrder: 3 },
    ],
  },
];

export function getProjectTotal(project: Project) {
  return project.materials.reduce((sum, material) => sum + material.quantity * material.unitPriceMinor, 0);
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function formatPrice(priceMinor: number, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(priceMinor / 100);
}
