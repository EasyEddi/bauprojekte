"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, ImagePlus, Link2, LoaderCircle, Plus, RefreshCw, Trash2 } from "lucide-react";
import { formatPrice, type PriceSource, type Project } from "@/lib/projects";

type PriceState = "idle" | "loading" | "current" | "manual" | "error";

type DraftMaterial = {
  id: number;
  storedId?: string;
  name: string;
  url: string;
  quantity: number;
  priceMinor: number | null;
  priceState: PriceState;
  priceSource?: PriceSource;
  lastCheckedAt?: string;
  manualPriceEuro: string;
  priceError: string;
};

const emptyMaterial = (id: number): DraftMaterial => ({
  id,
  name: "",
  url: "",
  quantity: 1,
  priceMinor: null,
  priceState: "idle",
  manualPriceEuro: "",
  priceError: "",
});

const pendingImportKey = "bauprojekte-price-import-pending";
const completedImportKey = "bauprojekte-price-import-completed";

type CompletedPriceImport = { materialId: number; priceMinor: number };

export type InitialPriceImport = {
  priceMinor: number;
  productName: string;
  productUrl: string;
};

type ProjectFormProps = {
  initialImport?: InitialPriceImport;
  initialProject?: Project;
};

function projectDraftMaterials(project: Project): DraftMaterial[] {
  return project.materials.map((material, index) => ({
    id: index + 1,
    storedId: material.id,
    name: material.name,
    url: material.productUrl,
    quantity: material.quantity,
    priceMinor: material.unitPriceMinor,
    priceState: material.priceStatus === "manual" ? "manual" : "current",
    priceSource: material.priceSource,
    lastCheckedAt: material.lastCheckedAt,
    manualPriceEuro: material.priceStatus === "manual"
      ? (material.unitPriceMinor / 100).toFixed(2).replace(".", ",")
      : "",
    priceError: "",
  }));
}

function euroInputToMinor(value: string) {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0;
}

async function requestPrice(url: string) {
  const response = await fetch("/api/price", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const result = await response.json().catch(() => ({})) as { error?: string; priceMinor?: number };
  if (!response.ok || typeof result.priceMinor !== "number") {
    throw new Error(result.error ?? "Der Preis konnte nicht geladen werden.");
  }
  return result.priceMinor;
}

export function ProjectForm({ initialImport, initialProject }: ProjectFormProps) {
  const router = useRouter();
  const [materials, setMaterials] = useState<DraftMaterial[]>(initialProject
    ? projectDraftMaterials(initialProject)
    : initialImport ? [{
      ...emptyMaterial(1),
      name: initialImport.productName,
      url: initialImport.productUrl,
      priceMinor: initialImport.priceMinor,
      priceState: "current",
      priceSource: "browser",
      lastCheckedAt: new Date().toISOString(),
    }] : [emptyMaterial(1)]);
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const total = useMemo(
    () => materials.reduce((sum, material) => sum + (material.priceMinor ?? 0) * Math.max(0, material.quantity), 0),
    [materials],
  );

  useEffect(() => {
    function receiveImport(event: StorageEvent) {
      if (event.key !== completedImportKey || !event.newValue) return;
      try {
        const result = JSON.parse(event.newValue) as Partial<CompletedPriceImport>;
        if (!Number.isInteger(result.materialId) || typeof result.priceMinor !== "number" || !Number.isInteger(result.priceMinor) || result.priceMinor < 0) return;
        setMaterials((current) => current.map((material) => material.id === result.materialId
          ? { ...material, priceMinor: result.priceMinor!, priceState: "current", priceSource: "browser", lastCheckedAt: new Date().toISOString(), manualPriceEuro: "", priceError: "" }
          : material));
        localStorage.removeItem(completedImportKey);
      } catch {
        // Ignore malformed browser-helper messages.
      }
    }
    window.addEventListener("storage", receiveImport);
    return () => window.removeEventListener("storage", receiveImport);
  }, []);

  function updateMaterial(id: number, patch: Partial<DraftMaterial>) {
    setError("");
    setMaterials((current) => current.map((material) => material.id === id ? { ...material, ...patch } : material));
  }

  function addMaterial() {
    const nextId = Math.max(0, ...materials.map((material) => material.id)) + 1;
    setMaterials((current) => [...current, emptyMaterial(nextId)]);
  }

  function removeMaterial(id: number) {
    setMaterials((current) => current.length === 1 ? [emptyMaterial(1)] : current.filter((material) => material.id !== id));
  }

  async function syncPrice(id: number) {
    const material = materials.find((entry) => entry.id === id);
    if (!material?.url.trim()) return;
    const requestedUrl = material.url;
    updateMaterial(id, { priceState: "loading", priceMinor: null, priceError: "" });
    try {
      const priceMinor = await requestPrice(requestedUrl);
      setMaterials((current) => current.map((entry) => entry.id === id && entry.url === requestedUrl
        ? { ...entry, priceMinor, priceState: "current", priceSource: "server", lastCheckedAt: new Date().toISOString(), manualPriceEuro: "", priceError: "" }
        : entry));
    } catch (priceError) {
      const message = priceError instanceof Error ? priceError.message : "Der Preis konnte nicht geladen werden.";
      setMaterials((current) => current.map((entry) => entry.id === id && entry.url === requestedUrl
        ? { ...entry, priceMinor: null, priceState: "error", priceError: message }
        : entry));
    }
  }

  function setManualPrice(id: number, value: string) {
    const parsed = Number.parseFloat(value.replace(",", "."));
    updateMaterial(id, {
      manualPriceEuro: value,
      priceMinor: Number.isFinite(parsed) && parsed >= 0 ? euroInputToMinor(value) : null,
      priceState: Number.isFinite(parsed) && parsed >= 0 ? "manual" : "error",
      priceSource: Number.isFinite(parsed) && parsed >= 0 ? "manual" : undefined,
      lastCheckedAt: Number.isFinite(parsed) && parsed >= 0 ? new Date().toISOString() : undefined,
    });
  }

  function openForBrowserImport(material: DraftMaterial) {
    if (!material.url.trim()) return;
    localStorage.setItem(pendingImportKey, JSON.stringify({ materialId: material.id, productUrl: material.url, createdAt: Date.now() }));
    window.open(material.url, "_blank", "noopener");
  }

  function validate(form: FormData) {
    const name = form.get("name");
    const image = form.get("image");
    if (typeof name !== "string" || name.trim().length < 2) return "Bitte gib einen Projektnamen ein.";
    if (image instanceof File && image.size > 2 * 1024 * 1024) return "Das Vorschaubild darf höchstens 2 MB groß sein.";
    if (image instanceof File && image.size > 0 && !["image/jpeg", "image/png", "image/webp"].includes(image.type)) return "Das Vorschaubild muss ein JPG, PNG oder WebP sein.";
    for (const [index, material] of materials.entries()) {
      if (!material.name.trim()) return `Bitte gib eine Bezeichnung für Material ${index + 1} ein.`;
      try {
        const url = new URL(material.url);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        return `Bitte gib einen vollständigen Produktlink für Material ${index + 1} ein.`;
      }
      if (!Number.isFinite(material.quantity) || material.quantity <= 0) return `Bitte prüfe die Menge von Material ${index + 1}.`;
    }
    return "";
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setPending(true);
      const resolvedMaterials = await Promise.all(materials.map(async (material, index) => {
        if (material.priceMinor !== null) return material;
        updateMaterial(material.id, { priceState: "loading", priceError: "" });
        try {
          const priceMinor = await requestPrice(material.url);
          const lastCheckedAt = new Date().toISOString();
          updateMaterial(material.id, { priceMinor, priceState: "current", priceSource: "server", lastCheckedAt, priceError: "" });
          return { ...material, priceMinor, priceState: "current" as const, priceSource: "server" as const, lastCheckedAt };
        } catch (priceError) {
          const message = priceError instanceof Error ? priceError.message : "Der Preis konnte nicht geladen werden.";
          updateMaterial(material.id, { priceState: "error", priceError: message });
          throw new Error(`Preis für Material ${index + 1}: ${message}`);
        }
      }));

      form.set("materials", JSON.stringify(resolvedMaterials.map((material) => ({
        id: material.storedId,
        name: material.name,
        productUrl: material.url,
        quantity: material.quantity,
        unitPriceMinor: material.priceMinor,
        priceStatus: material.priceState === "manual" ? "manual" : "current",
        priceSource: material.priceSource,
        lastCheckedAt: material.lastCheckedAt,
      }))));

      const response = await fetch(initialProject ? `/api/projects/${initialProject.slug}` : "/api/projects", {
        method: initialProject ? "PATCH" : "POST",
        body: form,
      });
      const result = await response.json().catch(() => ({})) as { error?: string; slug?: string };
      if (response.status === 401) {
        router.refresh();
        return;
      }
      if (!response.ok || !result.slug) {
        setError(result.error ?? `Das Projekt konnte nicht ${initialProject ? "aktualisiert" : "gespeichert"} werden. Bitte versuche es erneut.`);
        return;
      }
      window.location.assign(`/projekte/${result.slug}?saved=${Date.now()}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="project-form" onSubmit={submit} noValidate>
      <section className="form-section">
        <div className="form-section-title"><h2>Projekt</h2></div>
        <div className="form-grid">
          <label className="field field-wide">
            <span>Projektname</span>
            <input name="name" maxLength={120} defaultValue={initialProject?.name} placeholder="z. B. Eine eigene Gartenbank" onChange={() => setError("")} />
          </label>
          <label className="field field-wide">
            <span>Beschreibung <small>optional</small></span>
            <textarea name="description" maxLength={5000} rows={5} defaultValue={initialProject?.description} placeholder="Was möchtest du bauen?" onChange={() => setError("")} />
          </label>
          <label className="image-upload field-wide">
            <ImagePlus size={28} aria-hidden="true" />
            <span><strong>{imageName || (initialProject?.image ? "Neues Vorschaubild auswählen" : "Vorschaubild auswählen")}</strong>{initialProject?.image && !imageName ? "aktuelles Bild bleibt erhalten · " : ""}optional · JPG, PNG oder WebP · maximal 2 MB</span>
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setImageName(event.target.files?.[0]?.name ?? ""); setError(""); }} />
          </label>
          {initialProject?.image && <label className="remove-image-control field-wide"><input name="removeImage" type="checkbox" /> Aktuelles Vorschaubild entfernen</label>}
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-title"><h2>Materialien</h2></div>
        <div className="draft-materials">
          {materials.map((material, index) => (
            <div className="draft-material" key={material.id}>
              <div className="draft-material-head">
                <strong>Material {String(index + 1).padStart(2, "0")}</strong>
                <button type="button" className="icon-button" onClick={() => removeMaterial(material.id)} aria-label={`Material ${index + 1} entfernen`}>
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
              <div className="material-form-grid">
                <label className="field material-name"><span>Bezeichnung</span><input value={material.name} placeholder="Konstruktionsholz" onChange={(event) => updateMaterial(material.id, { name: event.target.value })} /></label>
                <label className="field material-url"><span>Produktlink</span><div className="input-with-icon"><Link2 size={17} /><input type="url" value={material.url} aria-label={`Produktlink für Material ${index + 1}`} onBlur={() => void syncPrice(material.id)} onChange={(event) => updateMaterial(material.id, { url: event.target.value, priceMinor: null, priceState: "idle", priceSource: undefined, lastCheckedAt: undefined, manualPriceEuro: "", priceError: "" })} /></div></label>
                <label className="field"><span>Menge</span><input type="number" min="0.1" step="0.1" value={material.quantity} onChange={(event) => updateMaterial(material.id, { quantity: Number(event.target.value) })} /></label>
                <div className={`material-price-box is-${material.priceState}`} aria-live="polite">
                  {material.priceState === "loading" && <><LoaderCircle className="spin" size={18} /><span>Preis wird geladen …</span></>}
                  {material.priceState === "current" && <><Check size={18} /><span>{material.priceSource === "browser" ? "Manuell synchronisiert" : "Automatisch erkannt"}<strong>{formatPrice(material.priceMinor ?? 0)}</strong></span></>}
                  {material.priceState === "idle" && <><span>Preis wird aus dem Link geladen</span></>}
                  {(material.priceState === "error" || material.priceState === "manual") && <div className="price-fallback">
                    {material.priceState === "error" && <small>{material.priceError || "Preis nicht erkannt."}</small>}
                    {material.priceState === "error" && <div className="price-helper-actions">
                      <a href="/preishelfer" target="_blank" rel="noreferrer">Preishelfer einrichten</a>
                      <button type="button" onClick={() => openForBrowserImport(material)}><ExternalLink size={14} /> Produkt öffnen</button>
                    </div>}
                    <label className="field"><span>Ersatzpreis</span><div className="input-with-suffix"><input inputMode="decimal" value={material.manualPriceEuro} placeholder="0,00" onChange={(event) => setManualPrice(material.id, event.target.value)} /><span>€</span></div></label>
                    <button type="button" className="price-retry" onClick={() => void syncPrice(material.id)}><RefreshCw size={14} /> Erneut laden</button>
                  </div>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="secondary-button" type="button" onClick={addMaterial}><Plus size={18} /> Weiteres Material</button>
      </section>

      <div className="form-submit-stack">
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-submit-bar">
          <div><span>Aktuelle Materialsumme</span><strong>{formatPrice(total)}</strong></div>
          <button className="primary-button" type="submit" disabled={pending}>{pending ? "Speichert …" : initialProject ? "Änderungen speichern" : "Projekt speichern"} <Check size={18} /></button>
        </div>
      </div>
    </form>
  );
}
