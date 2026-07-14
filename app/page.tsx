import { ArrowDown, BadgeEuro, Boxes, TreePine } from "lucide-react";
import { FloatingAddButton } from "@/components/floating-add-button";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/projects";

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Rausgehen. Anpacken. Selber bauen.</p>
          <h1>Aus Ideen werden <em>echte Projekte.</em></h1>
          <p className="hero-intro">
            Hier sammle ich alles, was ich gern bauen möchte – mit Materialliste,
            Kosten und einem klaren Plan für den ersten Handgriff.
          </p>
          <a className="hero-link" href="#projekte">
            Projekte ansehen <ArrowDown size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="hero-board" aria-label="Kurzübersicht">
          <div className="hero-board-top">
            <span>Werkstattnotiz</span>
            <span>Sommer 2026</span>
          </div>
          <p>„Nicht nur überlegen, was möglich wäre – anfangen, es möglich zu machen.“</p>
          <div className="hero-stats">
            <div><strong>{projects.length}</strong><span>Ideen</span></div>
            <div><strong>{projects.reduce((sum, project) => sum + project.materials.length, 0)}</strong><span>Materialien</span></div>
          </div>
        </div>
      </section>

      <section className="project-section" id="projekte">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Auf der Werkbank</p>
            <h2>Meine Bauvorhaben</h2>
          </div>
          <p>Alle Preise sind Schätzungen und zeigen den Stand der letzten Prüfung.</p>
        </div>

        {projects.length > 0 ? (
          <div className="project-grid">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} priority={index < 2} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <TreePine size={32} aria-hidden="true" />
            <h3>Noch Platz für die erste Idee</h3>
            <p>Über das Plus kannst du dein erstes Bauprojekt vormerken.</p>
          </div>
        )}

        <div className="principles" aria-label="Was die Übersicht zeigt">
          <div><Boxes aria-hidden="true" /><span><strong>Materialklarheit</strong>Alles Nötige an einem Ort</span></div>
          <div><BadgeEuro aria-hidden="true" /><span><strong>Ehrliche Kosten</strong>Mit Preisstand und Quelle</span></div>
          <div><TreePine aria-hidden="true" /><span><strong>Draußen bauen</strong>Weniger Bildschirm, mehr Werkstück</span></div>
        </div>
      </section>

      <FloatingAddButton />
    </>
  );
}
