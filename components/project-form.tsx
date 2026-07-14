"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Link2, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/projects";

type DraftMaterial = {
  id: number;
  name: string;
  url: string;
  quantity: number;
  priceEuro: string;
};

const emptyMaterial = (id: number): DraftMaterial => ({ id, name: "", url: "", quantity: 1, priceEuro: "" });

function euroInputToMinor(value: string) {
  const normalized = value.replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0;
}

export function ProjectForm() {
  const router = useRouter();
  const [materials, setMaterials] = useState<DraftMaterial[]>([emptyMaterial(1)]);
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const total = useMemo(
    () => materials.reduce((sum, material) => sum + euroInputToMinor(material.priceEuro) * Math.max(0, material.quantity), 0),
    [materials],
  );

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

  function validate(form: FormData) {
    const name = form.get("name");
    const description = form.get("description");
    const image = form.get("image");
    if (typeof name !== "string" || name.trim().length < 2) return "Bitte gib einen Projektnamen ein.";
    if (typeof description !== "string" || description.trim().length < 2) return "Bitte gib eine Beschreibung ein.";
    if (!(image instanceof File) || image.size === 0) return "Bitte wähle ein Vorschaubild aus.";
    if (image.size > 2 * 1024 * 1024) return "Das Vorschaubild darf höchstens 2 MB groß sein.";
    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) return "Das Vorschaubild muss ein JPG, PNG oder WebP sein.";
    for (const [index, material] of materials.entries()) {
      if (!material.name.trim()) return `Bitte gib eine Bezeichnung für Material ${index + 1} ein.`;
      try {
        const url = new URL(material.url);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        return `Bitte gib einen vollständigen Produktlink für Material ${index + 1} ein.`;
      }
      if (!Number.isFinite(material.quantity) || material.quantity <= 0) return `Bitte prüfe die Menge von Material ${index + 1}.`;
      const parsedPrice = Number.parseFloat(material.priceEuro.replace(",", "."));
      if (!material.priceEuro.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) return `Bitte gib einen Preis für Material ${index + 1} ein.`;
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
    setPending(true);
    form.set("materials", JSON.stringify(materials.map((material) => ({
      name: material.name,
      productUrl: material.url,
      quantity: material.quantity,
      unitPriceMinor: euroInputToMinor(material.priceEuro),
    }))));

    try {
      const response = await fetch("/api/projects", { method: "POST", body: form });
      const result = await response.json().catch(() => ({})) as { error?: string; slug?: string };
      if (response.status === 401) {
        router.refresh();
        return;
      }
      if (!response.ok || !result.slug) {
        setError(result.error ?? "Das Projekt konnte nicht gespeichert werden. Bitte versuche es erneut.");
        return;
      }
      router.push(`/projekte/${result.slug}`);
      router.refresh();
    } catch {
      setError("Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.");
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
            <input name="name" maxLength={120} placeholder="z. B. Eine eigene Gartenbank" onChange={() => setError("")} />
          </label>
          <label className="field field-wide">
            <span>Beschreibung</span>
            <textarea name="description" maxLength={5000} rows={5} placeholder="Was möchtest du bauen und wofür soll es später da sein?" onChange={() => setError("")} />
          </label>
          <label className="image-upload field-wide">
            <ImagePlus size={28} aria-hidden="true" />
            <span><strong>{imageName || "Vorschaubild auswählen"}</strong>JPG, PNG oder WebP · maximal 2 MB</span>
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setImageName(event.target.files?.[0]?.name ?? ""); setError(""); }} />
          </label>
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
                <label className="field material-url"><span>Produktlink</span><div className="input-with-icon"><Link2 size={17} /><input type="url" value={material.url} placeholder="https://..." onChange={(event) => updateMaterial(material.id, { url: event.target.value })} /></div></label>
                <label className="field"><span>Menge</span><input type="number" min="0.1" step="0.1" value={material.quantity} onChange={(event) => updateMaterial(material.id, { quantity: Number(event.target.value) })} /></label>
                <label className="field"><span>Preis pro Stück</span><div className="input-with-suffix"><input inputMode="decimal" value={material.priceEuro} placeholder="0,00" onChange={(event) => updateMaterial(material.id, { priceEuro: event.target.value })} /><span>€</span></div></label>
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
          <button className="primary-button" type="submit" disabled={pending}>{pending ? "Speichert …" : "Projekt speichern"} <Check size={18} /></button>
        </div>
      </div>
    </form>
  );
}
