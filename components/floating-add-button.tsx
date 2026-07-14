import Link from "next/link";
import { Plus } from "lucide-react";

export function FloatingAddButton() {
  return (
    <Link className="floating-add" href="/neu" aria-label="Neues Projekt anlegen">
      <Plus size={26} strokeWidth={2.5} aria-hidden="true" />
      <span>Projekt hinzufügen</span>
    </Link>
  );
}
