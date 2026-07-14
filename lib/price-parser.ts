export type ParsedPrice = {
  priceMinor: number;
  currency: "EUR";
  source: "json-ld" | "meta";
};

function parseAmount(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  let normalized = value.replace(/\s|\u00a0/g, "").replace(/[^0-9,.-]/g, "");
  if (!normalized) return null;
  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    normalized = comma > dot ? normalized.replace(/\./g, "").replace(",", ".") : normalized.replace(/,/g, "");
  } else if (comma >= 0) {
    normalized = normalized.replace(",", ".");
  }
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) && amount >= 0 && amount <= 1_000_000 ? amount : null;
}

function currencyIsEuro(value: unknown) {
  return value === undefined || value === null || String(value).trim() === "" || String(value).toUpperCase() === "EUR";
}

function typeNames(value: unknown) {
  const values = Array.isArray(value) ? value : [value];
  return values.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.split(/[\/#]/).pop()?.toLowerCase());
}

function priceFromJson(value: unknown): number | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const price = priceFromJson(item);
      if (price !== null) return price;
    }
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const object = value as Record<string, unknown>;
  const types = typeNames(object["@type"]);

  if (types.includes("product") && object.offers) {
    const offerPrice = priceFromJson(object.offers);
    if (offerPrice !== null) return offerPrice;
  }
  if (types.includes("offer") || types.includes("aggregateoffer")) {
    const amount = parseAmount(object.price ?? object.lowPrice);
    if (amount !== null && currencyIsEuro(object.priceCurrency)) return amount;
    if (object.priceSpecification) {
      const specificationPrice = priceFromJson(object.priceSpecification);
      if (specificationPrice !== null) return specificationPrice;
    }
  }
  if (types.includes("pricespecification")) {
    const amount = parseAmount(object.price);
    if (amount !== null && currencyIsEuro(object.priceCurrency ?? object.currency)) return amount;
  }
  if (object["@graph"]) return priceFromJson(object["@graph"]);
  return null;
}

function decodeEntities(value: string) {
  return value
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function attributes(tag: string) {
  const result: Record<string, string> = {};
  const expression = /([^\s=<>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(expression)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

export function extractProductPrice(html: string): ParsedPrice | null {
  const scripts = html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const script of scripts) {
    try {
      const data = JSON.parse(decodeEntities(script[1]).trim()) as unknown;
      const amount = priceFromJson(data);
      if (amount !== null) return { priceMinor: Math.round(amount * 100), currency: "EUR", source: "json-ld" };
    } catch {
      // Ignore malformed structured data and continue with the next standard source.
    }
  }

  let metaCurrency = "";
  const amounts: string[] = [];
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const values = attributes(tag);
    const key = (values.property ?? values.name ?? values.itemprop ?? "").toLowerCase();
    const content = values.content ?? values.value;
    if (!content) continue;
    if (["product:price:currency", "og:price:currency", "pricecurrency"].includes(key)) metaCurrency = content;
    if (["product:price:amount", "og:price:amount", "price"].includes(key)) amounts.push(content);
  }
  if (currencyIsEuro(metaCurrency)) {
    for (const value of amounts) {
      const amount = parseAmount(value);
      if (amount !== null) return { priceMinor: Math.round(amount * 100), currency: "EUR", source: "meta" };
    }
  }
  return null;
}
