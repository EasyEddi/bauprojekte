import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/project-form";

export const metadata: Metadata = { title: "Neues Projekt" };

export default function NewProjectPage() {
  return (
    <div className="form-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} aria-hidden="true" /> Zur Übersicht
      </Link>
      <header className="form-header">
        <h1>Neues Projekt</h1>
      </header>
      <ProjectForm />
    </div>
  );
}
