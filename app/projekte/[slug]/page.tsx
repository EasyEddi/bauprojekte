import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarClock, CircleCheck, CircleDashed, Ruler, ShoppingBasket } from "lucide-react";
import { notFound } from "next/navigation";
import { FloatingAddButton } from "@/components/floating-add-button";
import { formatPrice, getProjectBySlug, getProjectTotal, projects } from "@/lib/projects";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  return project ? { title: project.name, description: project.summary } : {};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const total = getProjectTotal(project);

  return (
    <>
      <article className="project-detail">
        <Link className="back-link" href="/">
          <ArrowLeft size={18} aria-hidden="true" /> Alle Projekte
        </Link>

        <header className="detail-hero">
          <div className="detail-image">
            <Image src={project.image} alt={project.imageAlt} fill priority sizes="(max-width: 900px) 100vw, 60vw" />
            <span className="project-status">{project.status}</span>
          </div>
          <div className="detail-summary">
            <p className="eyebrow">Projektplan</p>
            <h1>{project.name}</h1>
            <p>{project.summary}</p>
            <div className="detail-price">
              <span>Geschätzte Materialkosten</span>
              <strong>{formatPrice(total)}</strong>
              <small>inklusive aller unten aufgeführten Mengen</small>
            </div>
            <div className="detail-facts">
              <span><ShoppingBasket size={17} />{project.materials.length} Materialien</span>
              <span><Ruler size={17} />{project.difficulty}</span>
              <span><CalendarClock size={17} />{project.duration}</span>
            </div>
          </div>
        </header>

        <section className="detail-description">
          <div>
            <p className="eyebrow">Die Idee dahinter</p>
            <h2>Was ich bauen möchte</h2>
          </div>
          <p>{project.description}</p>
        </section>

        <section className="materials-section">
          <div className="section-heading materials-heading">
            <div>
              <p className="eyebrow">Einkaufsliste</p>
              <h2>Materialien</h2>
            </div>
            <p>Preise können sich beim jeweiligen Shop ändern.</p>
          </div>

          <div className="material-list">
            {project.materials.map((material) => {
              const lineTotal = material.quantity * material.unitPriceMinor;
              const isCurrent = material.priceStatus === "current";
              return (
                <div className="material-row" key={material.id}>
                  <div className="material-main">
                    <span className="material-index">{String(material.sortOrder).padStart(2, "0")}</span>
                    <div>
                      <h3>{material.name}</h3>
                      <span className={`price-status ${isCurrent ? "is-current" : "is-manual"}`}>
                        {isCurrent ? <CircleCheck size={14} /> : <CircleDashed size={14} />}
                        {isCurrent ? "Automatisch geprüft" : "Manueller Preis"}
                      </span>
                    </div>
                  </div>
                  <div className="material-quantity">
                    <span>Menge</span>
                    <strong>{material.quantity} {material.unitLabel}</strong>
                  </div>
                  <div className="material-unit-price">
                    <span>Einzelpreis</span>
                    <strong>{formatPrice(material.unitPriceMinor)}</strong>
                  </div>
                  <div className="material-total">
                    <span>Summe</span>
                    <strong>{formatPrice(lineTotal)}</strong>
                  </div>
                  <a className="shop-link" href={material.productUrl} target="_blank" rel="noreferrer">
                    Zum Material <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                  <small className="material-checked">Stand: {material.lastCheckedLabel}</small>
                </div>
              );
            })}
          </div>

          <div className="materials-total">
            <span>Gesamtkosten des Projekts</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </section>
      </article>
      <FloatingAddButton />
    </>
  );
}
