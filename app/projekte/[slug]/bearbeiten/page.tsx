import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { DeleteProjectButton } from "@/components/delete-project-dialog";
import { ProjectForm } from "@/components/project-form";
import { isAdmin } from "@/lib/admin-auth";
import { getProjectBySlug } from "@/lib/project-store";

type EditProjectPageProps = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Projekt bearbeiten" };
export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = await params;
  const [project, authenticated] = await Promise.all([getProjectBySlug(slug), isAdmin()]);
  if (!project) notFound();

  return (
    <div className="form-page">
      <Link className="back-link" href={`/projekte/${project.slug}`}><ArrowLeft size={18} aria-hidden="true" /> Zum Projekt</Link>
      <header className="form-header"><h1>{authenticated ? "Projekt bearbeiten" : "Anmelden"}</h1></header>
      {authenticated ? <>
        <ProjectForm initialProject={project} />
        <section className="edit-danger-zone">
          <div><h2>Projekt löschen</h2><p>Entfernt das Projekt, seine Materialliste und das Vorschaubild dauerhaft.</p></div>
          <DeleteProjectButton name={project.name} slug={project.slug} />
        </section>
      </> : <AdminLogin />}
    </div>
  );
}
