import { FloatingAddButton } from "@/components/floating-add-button";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/projects";

export default function HomePage() {
  return (
    <>
      <section className="project-section" aria-label="Bauprojekte">
        <div className="project-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} priority={index < 2} />
          ))}
        </div>
      </section>
      <FloatingAddButton />
    </>
  );
}
