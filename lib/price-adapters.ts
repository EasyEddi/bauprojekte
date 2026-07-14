import type { ParsedPrice } from "@/lib/price-parser";

const stofferiaHosts = new Set(["stofferia.de", "www.stofferia.de"]);

function stofferiaConfiguredLength(url: URL) {
  if (!stofferiaHosts.has(url.hostname.toLowerCase())) return null;
  const configuration = new URLSearchParams(url.hash.slice(1)).get("neonCfg");
  const match = configuration?.match(/(?:^|[;,|])laenge::(\d+(?:[.,]\d+)?)(?:$|[;,|])/i);
  if (!match) return null;
  const length = Number.parseFloat(match[1].replace(",", "."));
  return Number.isFinite(length) && length >= 0.1 && length <= 1_000 ? length : null;
}

export function applyPriceAdapter(price: ParsedPrice, productUrl: URL): ParsedPrice {
  const configuredLength = stofferiaConfiguredLength(productUrl);
  if (configuredLength === null) return price;
  return {
    ...price,
    priceMinor: Math.round(price.priceMinor * configuredLength),
    source: "adapter",
  };
}
