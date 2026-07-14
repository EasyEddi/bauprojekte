import Image from "next/image";
import Link from "next/link";
import { formatPrice, getProjectTotal, type Project } from "@/lib/projects";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <Link className="project-card" href={`/projekte/${project.slug}`} aria-label={`${project.name} ansehen`}>
      <div className="card-image">
        <Image src={project.image} alt={project.imageAlt} fill priority={priority} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" />
      </div>
      <div className="card-body">
        <h2>{project.name}</h2>
        <strong>{formatPrice(getProjectTotal(project))}</strong>
      </div>
    </Link>
  );
}
