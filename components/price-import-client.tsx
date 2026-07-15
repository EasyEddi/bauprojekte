"use client";

import { useEffect, useRef } from "react";

const pendingImportKey = "bauprojekte-price-import-pending";
const completedImportKey = "bauprojekte-price-import-completed";

type PriceImportClientProps = {
  priceMinor: number;
  productName: string;
  productUrl: string;
};

export function PriceImportClient({ priceMinor, productName, productUrl }: PriceImportClientProps) {
  const message = useRef<HTMLParagraphElement>(null);

  function show(value: string) {
    if (message.current) message.current.textContent = value;
  }

  useEffect(() => {
    try {
      const rawPending = localStorage.getItem(pendingImportKey);
      if (!rawPending) {
        if (!productUrl) {
          show("Der Produktlink fehlt. Öffne den Preishelfer bitte erneut auf der Produktseite.");
          return;
        }
        const parameters = new URLSearchParams({
          priceMinor: String(priceMinor),
          productName,
          productUrl,
        });
        show("Produkt erkannt. Der Projekteditor wird geöffnet …");
        window.location.replace(`/neu?${parameters}`);
        return;
      }
      const pending = JSON.parse(rawPending) as { materialId?: unknown; createdAt?: unknown };
      if (!Number.isInteger(pending.materialId) || typeof pending.createdAt !== "number" || Date.now() - pending.createdAt > 30 * 60 * 1000) {
        localStorage.removeItem(pendingImportKey);
        show("Die Preisübernahme ist abgelaufen. Starte sie bitte noch einmal aus dem Projektformular.");
        return;
      }
      localStorage.setItem(completedImportKey, JSON.stringify({ materialId: pending.materialId, priceMinor }));
      localStorage.removeItem(pendingImportKey);
      show("Preis übernommen. Du kannst diesen Tab schließen.");
      window.setTimeout(() => window.close(), 700);
    } catch {
      show("Der Preis konnte nicht an das Projektformular übergeben werden.");
    }
  }, [priceMinor, productName, productUrl]);

  return <p ref={message} className="price-import-message" role="status">Preis wird übernommen …</p>;
}
