import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { extractProductPrice, type ParsedPrice } from "@/lib/price-parser";

const maximumBytes = 1_500_000;

export class PriceFetchError extends Error {}

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 192 && b === 0 && (c === 0 || c === 2))
    || (a === 198 && (b === 18 || b === 19))
    || (a === 198 && b === 51 && c === 100)
    || (a === 203 && b === 0 && c === 113);
}

function isPrivateAddress(address: string) {
  if (isIP(address) === 4) return isPrivateIpv4(address);
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:")) return isPrivateIpv4(normalized.slice(7));
  return normalized === "::" || normalized === "::1"
    || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("ff")
    || /^fe[89ab]/.test(normalized);
}

async function validateTarget(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new PriceFetchError("Der Produktlink ist ungültig.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new PriceFetchError("Der Produktlink ist nicht erlaubt.");
  }
  if (url.port && !["80", "443"].includes(url.port)) throw new PriceFetchError("Der Port des Produktlinks ist nicht erlaubt.");
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new PriceFetchError("Lokale Adressen sind nicht erlaubt.");
  }
  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new PriceFetchError("Private Netzwerkadressen sind nicht erlaubt.");
  } else {
    const addresses = await lookup(hostname, { all: true, verbatim: true }).catch(() => []);
    if (addresses.length === 0) throw new PriceFetchError("Die Shop-Adresse konnte nicht aufgelöst werden.");
    if (addresses.some(({ address }) => isPrivateAddress(address))) throw new PriceFetchError("Die Shop-Adresse verweist auf ein privates Netzwerk.");
  }
  return url;
}

async function readLimited(response: Response) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) throw new PriceFetchError("Die Produktseite ist zu groß.");
  if (!response.body) throw new PriceFetchError("Die Produktseite enthält keine lesbaren Daten.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let content = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximumBytes) {
      await reader.cancel();
      throw new PriceFetchError("Die Produktseite ist zu groß.");
    }
    content += decoder.decode(value, { stream: true });
  }
  return content + decoder.decode();
}

export async function fetchProductPrice(value: string): Promise<ParsedPrice> {
  let url = await validateTarget(value);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    for (let redirect = 0; redirect <= 3; redirect += 1) {
      const response = await fetch(url, {
        cache: "no-store",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          accept: "text/html,application/xhtml+xml,application/json;q=0.8",
          "user-agent": "Bauprojekte-Preispruefung/1.0 (+https://bauprojekte.vercel.app)",
        },
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location || redirect === 3) throw new PriceFetchError("Der Shop leitet zu oft weiter.");
        url = await validateTarget(new URL(location, url).toString());
        continue;
      }
      if (!response.ok) throw new PriceFetchError(`Der Shop antwortet mit Status ${response.status}.`);
      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (!contentType.includes("html") && !contentType.includes("json")) throw new PriceFetchError("Der Link führt nicht zu einer lesbaren Produktseite.");
      const result = extractProductPrice(await readLimited(response));
      if (!result) throw new PriceFetchError("Auf der Produktseite wurde kein maschinenlesbarer Euro-Preis gefunden.");
      return result;
    }
    throw new PriceFetchError("Der Preis konnte nicht geladen werden.");
  } catch (error) {
    if (error instanceof PriceFetchError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw new PriceFetchError("Der Shop hat zu lange nicht geantwortet.");
    throw new PriceFetchError("Die Produktseite konnte nicht abgerufen werden.");
  } finally {
    clearTimeout(timeout);
  }
}
