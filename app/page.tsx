import { FloatingAddButton } from "@/components/floating-add-button";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/lib/project-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await getProjects();
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
