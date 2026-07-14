import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminLogin } from "@/components/admin-login";
import { ProjectForm } from "@/components/project-form";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Neues Projekt" };

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const authenticated = await isAdmin();
  return (
    <div className="form-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} aria-hidden="true" /> Zur Übersicht
      </Link>
      <header className="form-header">
        <h1>{authenticated ? "Neues Projekt" : "Anmelden"}</h1>
      </header>
      {authenticated ? <ProjectForm /> : <AdminLogin />}
    </div>
  );
}
