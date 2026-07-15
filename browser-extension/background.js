const importUrl = "https://bauprojekte.vercel.app/preis-import";

function extractPriceFromPage() {
  function amount(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value !== "string") return null;
    let normalized = value.replace(/\s|\u00a0/g, "").replace(/[^0-9,.-]/g, "");
    const comma = normalized.lastIndexOf(",");
    const dot = normalized.lastIndexOf(".");
    if (comma >= 0 && dot >= 0) {
      normalized = comma > dot ? normalized.replace(/\./g, "").replace(",", ".") : normalized.replace(/,/g, "");
    } else if (comma >= 0) {
      normalized = normalized.replace(",", ".");
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1_000_000 ? parsed : null;
  }

  function types(value) {
    return (Array.isArray(value) ? value : [value]).filter((entry) => typeof entry === "string").join(" ");
  }

  function fromJson(value) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        const result = fromJson(entry);
        if (result !== null) return result;
      }
      return null;
    }
    if (!value || typeof value !== "object") return null;
    const type = types(value["@type"]);
    if (/Offer|PriceSpecification/i.test(type) && String(value.priceCurrency ?? value.currency ?? "EUR").toUpperCase() === "EUR") {
      const result = amount(value.price ?? value.lowPrice);
      if (result !== null) return result;
    }
    for (const key of ["offers", "priceSpecification", "@graph"]) {
      const result = fromJson(value[key]);
      if (result !== null) return result;
    }
    return null;
  }

  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const result = fromJson(JSON.parse(script.textContent ?? ""));
      if (result !== null) return Math.round(result * 100);
    } catch {
      // Continue with the next structured source.
    }
  }

  const candidate = document.querySelector([
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
    '[itemprop="price"]',
    '[data-product-price]',
    '[data-current-price]',
    '[data-final-price]',
    '[data-price]',
  ].join(","));
  if (!candidate) return null;
  const raw = candidate.content
    ?? candidate.value
    ?? candidate.dataset?.productPrice
    ?? candidate.dataset?.currentPrice
    ?? candidate.dataset?.finalPrice
    ?? candidate.dataset?.price
    ?? candidate.textContent;
  const result = amount(raw);
  return result === null ? null : Math.round(result * 100);
}

async function showPageMessage(tabId, message) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (text) => window.alert(text),
    args: [message],
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  if (typeof tab.id !== "number") return;
  try {
    const [execution] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPriceFromPage,
    });
    const priceMinor = execution?.result;
    if (!Number.isInteger(priceMinor) || priceMinor < 0) {
      await showPageMessage(tab.id, "Auf dieser Produktseite wurde kein eindeutiger Euro-Preis gefunden.");
      return;
    }
    await chrome.tabs.update(tab.id, { url: `${importUrl}?priceMinor=${priceMinor}` });
  } catch {
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#a23b2a" });
    await chrome.action.setBadgeText({ tabId: tab.id, text: "!" });
    await chrome.action.setTitle({ tabId: tab.id, title: "Diese Seite erlaubt keine Preisübernahme." });
  }
});
