import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CircleCheck, CircleDashed } from "lucide-react";
import { notFound } from "next/navigation";
import { FloatingAddButton } from "@/components/floating-add-button";
import { getProjectBySlug, refreshProjectPrices } from "@/lib/project-store";
import { formatPrice, getProjectTotal, materialSyncLabel } from "@/lib/projects";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return project ? { title: project.name, description: project.summary || undefined } : {};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const storedProject = await getProjectBySlug(slug);
  if (!storedProject) notFound();
  const project = await refreshProjectPrices(storedProject);
  const total = getProjectTotal(project);

  return (
    <>
      <article className="project-detail">
        <Link className="back-link" href="/"><ArrowLeft size={18} aria-hidden="true" /> Alle Projekte</Link>

        <header className={`detail-overview-card ${project.image ? "" : "no-image"}`}>
          {project.image && <div className="detail-overview-image">
            <Image src={project.image} alt={project.imageAlt} fill priority sizes="(max-width: 960px) 100vw, 960px" />
          </div>}
          <div className="detail-overview-body">
            <h1>{project.name}</h1>
            <div><span>Materialkosten</span><strong>{formatPrice(total)}</strong></div>
          </div>
        </header>

        {project.description && <section className="detail-content-card">
          <h2>Beschreibung</h2>
          <p>{project.description}</p>
        </section>}

        <section className="detail-content-card detail-materials-card">
          <div className="detail-card-heading"><h2>Materialien</h2><span>{project.materials.length} Einträge</span></div>
          <div className="detail-material-list">
            {project.materials.map((material) => {
              const lineTotal = material.quantity * material.unitPriceMinor;
              const syncStatus = materialSyncLabel(material);
              return (
                <div className="detail-material-row" key={material.id}>
                  <div className="detail-material-name">
                    <h3>{material.name}</h3>
                    <span className={`price-status ${syncStatus.isSynced ? "is-current" : "is-manual"}`}>
                      {syncStatus.isSynced ? <CircleCheck size={14} /> : <CircleDashed size={14} />}
                      {syncStatus.text}
                    </span>
                  </div>
                  <div className="detail-material-calculation"><span>{material.quantity} {material.unitLabel} × {formatPrice(material.unitPriceMinor)}</span><strong>{formatPrice(lineTotal)}</strong></div>
                  <a className="shop-link" href={material.productUrl} target="_blank" rel="noreferrer">Zum Material <ArrowUpRight size={16} aria-hidden="true" /></a>
                </div>
              );
            })}
          </div>
          <div className="detail-total"><span>Gesamtkosten</span><strong>{formatPrice(total)}</strong></div>
        </section>
      </article>
      <FloatingAddButton />
    </>
  );
}
