import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { ProjectForm } from "@/components/project-form";

export const metadata: Metadata = { title: "Neues Projekt" };

export default function NewProjectPage() {
  return (
    <div className="form-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} aria-hidden="true" /> Zur Übersicht
      </Link>
      <header className="form-header">
        <div>
          <p className="eyebrow">Neue Idee</p>
          <h1>Projekt vormerken</h1>
          <p>Plane dein Vorhaben und sieh sofort, was die Materialien zusammen kosten.</p>
        </div>
        <div className="prototype-note">
          <LockKeyhole size={20} aria-hidden="true" />
          <span><strong>Prototypmodus</strong>Noch keine Daten werden öffentlich gespeichert.</span>
        </div>
      </header>
      <ProjectForm />
    </div>
  );
}
