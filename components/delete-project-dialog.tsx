"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type DeleteProjectDialogProps = {
  name: string;
  onClose: () => void;
  open: boolean;
  slug: string;
};

export function DeleteProjectDialog({ name, onClose, open, slug }: DeleteProjectDialogProps) {
  const router = useRouter();
  const cancelButton = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    cancelButton.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  async function deleteCurrentProject() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/projects/${slug}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (response.status === 401) {
      router.push(`/projekte/${slug}/bearbeiten`);
      router.refresh();
      return;
    }
    if (!response.ok) {
      setError(result.error ?? "Das Projekt konnte nicht gelöscht werden.");
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="delete-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
      <div className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby={`delete-title-${slug}`} aria-describedby={`delete-description-${slug}`}>
        <div className="delete-dialog-icon"><Trash2 size={21} aria-hidden="true" /></div>
        <h2 id={`delete-title-${slug}`}>Projekt löschen?</h2>
        <p id={`delete-description-${slug}`}>„{name}“ und seine Materialliste werden dauerhaft gelöscht.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="delete-dialog-actions">
          <button ref={cancelButton} className="secondary-button" type="button" disabled={pending} onClick={onClose}>Abbrechen</button>
          <button className="danger-button" type="button" disabled={pending} onClick={() => void deleteCurrentProject()}>{pending ? "Löscht …" : "Endgültig löschen"}</button>
        </div>
      </div>
    </div>
  );
}

export function DeleteProjectButton({ name, slug }: { name: string; slug: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="danger-button edit-delete-button" type="button" onClick={() => setOpen(true)}><Trash2 size={17} aria-hidden="true" /> Projekt löschen</button>
      <DeleteProjectDialog name={name} slug={slug} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
