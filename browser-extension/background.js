const importUrl = "https://bauprojekte.vercel.app/preis-import";

function extractPriceFromPage() {
  const candidates = [];

  function amount(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value !== "string") return null;
    let normalized = value.replace(/[\s\u00a0'’]/g, "").replace(/[^0-9,.-]/g, "");
    normalized = normalized.replace(/^-/, "");
    const comma = normalized.lastIndexOf(",");
    const dot = normalized.lastIndexOf(".");
    if (comma >= 0 && dot >= 0) {
      normalized = comma > dot ? normalized.replace(/\./g, "").replace(",", ".") : normalized.replace(/,/g, "");
    } else if (comma >= 0) {
      const decimals = normalized.length - comma - 1;
      normalized = decimals > 0 && decimals <= 2 ? normalized.replace(",", ".") : normalized.replace(/,/g, "");
    } else if (dot >= 0) {
      const decimals = normalized.length - dot - 1;
      if (decimals === 3 && /^\d{1,3}(?:\.\d{3})+$/.test(normalized)) normalized = normalized.replace(/\./g, "");
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) && parsed > 0 && parsed <= 1_000_000 ? parsed : null;
  }

  function types(value) {
    return (Array.isArray(value) ? value : [value]).filter((entry) => typeof entry === "string").join(" ");
  }

  function isEuro(value) {
    return value === undefined || value === null || /^(?:EUR|€)$/i.test(String(value).trim());
  }

  function add(value, score, source) {
    const parsed = amount(value);
    if (parsed === null) return;
    const priceMinor = Math.round(parsed * 100);
    if (priceMinor > 0) candidates.push({ priceMinor, score, source });
  }

  function fromJson(value, depth = 0, inheritedCurrency) {
    if (depth > 24) return;
    if (Array.isArray(value)) {
      for (const entry of value.slice(0, 500)) fromJson(entry, depth + 1, inheritedCurrency);
      return;
    }
    if (!value || typeof value !== "object") return;

    const type = types(value["@type"]);
    const currency = value.priceCurrency ?? value.currency ?? value.currencyCode ?? inheritedCurrency;
    if (/Offer|PriceSpecification/i.test(type) && isEuro(currency)) {
      add(value.price, 170, "json-offer");
      add(value.salePrice ?? value.finalPrice, 165, "json-offer");
      add(value.lowPrice, 125, "json-low-price");
    } else if (isEuro(currency) && currency !== undefined) {
      add(value.currentPrice ?? value.salePrice ?? value.finalPrice, 80, "json-state");
      if (value.price !== undefined && /(?:product|offer|variant|price)/i.test(type)) add(value.price, 80, "json-state");
    }

    for (const nested of Object.values(value).slice(0, 500)) {
      if (nested && typeof nested === "object") fromJson(nested, depth + 1, currency);
    }
  }

  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      fromJson(JSON.parse(script.textContent ?? ""));
    } catch {
      // Continue with the next structured source.
    }
  }

  for (const script of document.querySelectorAll('script[type="application/json"], script[id="__NEXT_DATA__"]')) {
    if ((script.textContent?.length ?? 0) > 2_000_000) continue;
    try {
      fromJson(JSON.parse(script.textContent ?? ""));
    } catch {
      // Embedded application state is optional and may not be pure JSON.
    }
  }

  const pageCurrency = document.querySelector([
    'meta[property="product:price:currency"]',
    'meta[property="og:price:currency"]',
    '[itemprop="priceCurrency"]',
  ].join(","));
  const currencyValue = pageCurrency?.content ?? pageCurrency?.getAttribute("value") ?? pageCurrency?.textContent;

  for (const candidate of Array.from(document.querySelectorAll([
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
    '[itemprop="price"]',
    '[data-product-price]',
    '[data-current-price]',
    '[data-final-price]',
    '[data-price-amount]',
    '[data-price]',
  ].join(","))).slice(0, 1000)) {
    const raw = candidate.content
      ?? candidate.value
      ?? candidate.dataset?.productPrice
      ?? candidate.dataset?.currentPrice
      ?? candidate.dataset?.finalPrice
      ?? candidate.dataset?.priceAmount
      ?? candidate.dataset?.price
      ?? candidate.textContent;
    const semantic = `${candidate.id} ${candidate.className} ${Array.from(candidate.attributes).map((entry) => `${entry.name} ${entry.value}`).join(" ")}`.toLowerCase();
    if (/\b(?:old|original|list|strike|crossed|previous|was)[-_ ]?(?:price|preis)\b|\b(?:uvp|rrp|stattpreis)\b/.test(semantic)) continue;
    const score = candidate.matches('meta[property="product:price:amount"], meta[property="og:price:amount"]')
      ? 165
      : candidate.matches('[itemprop="price"]') ? 155 : 145;
    if (isEuro(candidate.getAttribute("currency") ?? candidate.dataset?.currency ?? currencyValue)) add(raw, score, "semantic-attribute");
  }

  function contextFor(element) {
    const parts = [];
    let current = element;
    for (let depth = 0; current && depth < 5; depth += 1, current = current.parentElement) {
      parts.push(current.id, typeof current.className === "string" ? current.className : "", current.getAttribute("itemprop") ?? "", current.getAttribute("aria-label") ?? "");
    }
    return parts.join(" ").toLowerCase();
  }

  function visible(element) {
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && Number.parseFloat(style.opacity || "1") > 0 && element.getClientRects().length > 0;
  }

  const negativeContext = /\b(?:old|original|list|strike|crossed|previous|was)[-_ ]?(?:price|preis)\b|\b(?:uvp|rrp|stattpreis|shipping|versand|delivery|lieferung|saving|sparen|ersparnis|discount|rabatt|installment|rate|monatlich|finanzierung|grundpreis|unitprice|unit-price)\b|\bpro\s+(?:stück|stk|kg|g|l|ml|m|cm)\b|\/(?:stück|stk|kg|g|l|ml|m|cm)\b/;
  const strongContext = /\b(?:product|current|final|sale|selling|offer|main)[-_ ]?(?:price|preis)\b|\b(?:price|preis)[-_ ]?(?:current|final|sale|main)\b/;
  const priceContext = /\b(?:price|preis|amount|cost)\b/;
  const productContext = /\b(?:product|produkt|pdp|buybox|buy-box|purchase|angebot)\b/;
  const euroPattern = /(?:€\s*([0-9][0-9\s\u00a0.'’]*(?:[,.]\d{1,2})?)|([0-9][0-9\s\u00a0.'’]*(?:[,.]\d{1,2})?)\s*(?:€|EUR\b))/gi;
  if (document.body && typeof document.createTreeWalker === "function") {
    const walker = document.createTreeWalker(document.body, 4);
    let textNode;
    let scanned = 0;
    while ((textNode = walker.nextNode()) && scanned < 20_000) {
      scanned += 1;
      const text = textNode.nodeValue?.trim() ?? "";
      if (!/(?:€|\bEUR\b)/i.test(text) || text.length > 300) continue;
      const element = textNode.parentElement;
      if (!element || !visible(element) || /^(?:SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/.test(element.tagName)) continue;
      const context = contextFor(element);
      if (negativeContext.test(`${context} ${text.toLowerCase()}`)) continue;
      let score = 65;
      if (strongContext.test(context)) score += 75;
      else if (priceContext.test(context)) score += 45;
      if (productContext.test(context)) score += 25;
      euroPattern.lastIndex = 0;
      let match;
      while ((match = euroPattern.exec(text))) add(match[1] ?? match[2], score, "visible-text");
    }
  }

  const grouped = new Map();
  for (const candidate of candidates) {
    const group = grouped.get(candidate.priceMinor) ?? { priceMinor: candidate.priceMinor, score: 0, occurrences: 0, sources: new Set() };
    group.score = Math.max(group.score, candidate.score);
    group.occurrences += 1;
    group.sources.add(candidate.source);
    grouped.set(candidate.priceMinor, group);
  }

  const ranked = Array.from(grouped.values())
    .map((group) => ({
      priceMinor: group.priceMinor,
      score: group.score + Math.min(group.occurrences, 5) * 2 + Math.min(group.sources.size, 3) * 4,
    }))
    .sort((left, right) => right.score - left.score);
  if (!ranked[0] || ranked[0].score < 90) return null;
  if (ranked[1] && ranked[1].score >= ranked[0].score - 10) return null;
  return ranked[0].priceMinor;
}

function selectPriceFromPage() {
  function amount(value) {
    if (typeof value !== "string") return null;
    let normalized = value.replace(/[\s\u00a0'’]/g, "").replace(/[^0-9,.-]/g, "");
    const comma = normalized.lastIndexOf(",");
    const dot = normalized.lastIndexOf(".");
    if (comma >= 0 && dot >= 0) {
      normalized = comma > dot ? normalized.replace(/\./g, "").replace(",", ".") : normalized.replace(/,/g, "");
    } else if (comma >= 0) {
      const decimals = normalized.length - comma - 1;
      normalized = decimals > 0 && decimals <= 2 ? normalized.replace(",", ".") : normalized.replace(/,/g, "");
    } else if (dot >= 0 && normalized.length - dot - 1 === 3 && /^\d{1,3}(?:\.\d{3})+$/.test(normalized)) {
      normalized = normalized.replace(/\./g, "");
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) && parsed > 0 && parsed <= 1_000_000 ? Math.round(parsed * 100) : null;
  }

  function pricesInText(text) {
    const results = new Set();
    const pattern = /(?:€\s*([0-9][0-9\s\u00a0.'’]*(?:[,.]\d{1,2})?)|([0-9][0-9\s\u00a0.'’]*(?:[,.]\d{1,2})?)\s*(?:€|EUR\b))/gi;
    let match;
    while ((match = pattern.exec(text))) {
      const parsed = amount(match[1] ?? match[2]);
      if (parsed !== null) results.add(parsed);
    }
    return Array.from(results);
  }

  function priceFromTarget(target) {
    let current = target instanceof Element ? target : target?.parentElement;
    for (let depth = 0; current && depth < 5; depth += 1, current = current.parentElement) {
      const prices = pricesInText(current.textContent ?? "");
      if (prices.length === 1) return prices[0];
      const semanticValue = current.getAttribute("content")
        ?? current.getAttribute("value")
        ?? current.dataset?.productPrice
        ?? current.dataset?.currentPrice
        ?? current.dataset?.finalPrice
        ?? current.dataset?.priceAmount
        ?? current.dataset?.price;
      if (semanticValue) {
        const parsed = amount(semanticValue);
        if (parsed !== null) return parsed;
      }
    }
    return null;
  }

  return new Promise((resolve) => {
    const banner = document.createElement("div");
    banner.textContent = "Preis nicht automatisch eindeutig: Klicke jetzt auf den richtigen Hauptpreis. Esc bricht ab.";
    Object.assign(banner.style, {
      position: "fixed",
      zIndex: "2147483647",
      top: "14px",
      left: "50%",
      transform: "translateX(-50%)",
      maxWidth: "calc(100vw - 28px)",
      padding: "12px 16px",
      color: "#ffffff",
      background: "#214d35",
      border: "2px solid #9ac5a6",
      borderRadius: "10px",
      boxShadow: "0 8px 28px rgba(0, 0, 0, .28)",
      font: "600 14px/1.4 system-ui, sans-serif",
      textAlign: "center",
    });

    let highlighted = null;
    let previousOutline = "";
    let previousCursor = "";

    function restoreHighlight() {
      if (!highlighted) return;
      highlighted.style.outline = previousOutline;
      highlighted.style.cursor = previousCursor;
      highlighted = null;
    }

    function cleanup(result) {
      restoreHighlight();
      banner.remove();
      document.removeEventListener("mouseover", onMouseOver, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
      resolve(result);
    }

    function onMouseOver(event) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target === banner || banner.contains(target) || target === highlighted) return;
      restoreHighlight();
      highlighted = target;
      previousOutline = target.style.outline;
      previousCursor = target.style.cursor;
      target.style.outline = "3px solid #e4815d";
      target.style.cursor = "crosshair";
    }

    function onClick(event) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target === banner || banner.contains(target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const selectedPrice = priceFromTarget(target);
      if (selectedPrice !== null) cleanup(selectedPrice);
      else banner.textContent = "Dort wurde kein einzelner Euro-Preis erkannt. Klicke bitte direkt auf die Preiszahl.";
    }

    function onKeyDown(event) {
      if (event.key === "Escape") cleanup(null);
    }

    document.addEventListener("mouseover", onMouseOver, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.documentElement.appendChild(banner);
  });
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
    let priceMinor = execution?.result;
    if (!Number.isInteger(priceMinor) || priceMinor < 0) {
      const [selection] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: selectPriceFromPage,
      });
      priceMinor = selection?.result;
      if (!Number.isInteger(priceMinor) || priceMinor < 0) {
        await showPageMessage(tab.id, "Die Preisübernahme wurde abgebrochen.");
        return;
      }
    }
    const productUrl = typeof tab.url === "string" ? tab.url : "";
    const productName = typeof tab.title === "string" ? tab.title : "";
    const parameters = new URLSearchParams({
      priceMinor: String(priceMinor),
      productUrl,
      productName,
    });
    await chrome.tabs.update(tab.id, { url: `${importUrl}?${parameters}` });
  } catch {
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#a23b2a" });
    await chrome.action.setBadgeText({ tabId: tab.id, text: "!" });
    await chrome.action.setTitle({ tabId: tab.id, title: "Diese Seite erlaubt keine Preisübernahme." });
  }
});
