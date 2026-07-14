import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Boxes } from "lucide-react";
import { formatPrice, getProjectTotal, type Project } from "@/lib/projects";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <Link className="project-card" href={`/projekte/${project.slug}`} aria-label={`${project.name} ansehen`}>
      <div className="card-image">
        <Image src={project.image} alt={project.imageAlt} fill priority={priority} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" />
        <span className="project-status">{project.status}</span>
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <h3>{project.name}</h3>
          <ArrowUpRight size={20} aria-hidden="true" />
        </div>
        <p>{project.summary}</p>
        <div className="card-meta">
          <span><Boxes size={16} aria-hidden="true" /> {project.materials.length} Materialien</span>
          <strong>{formatPrice(getProjectTotal(project))}</strong>
        </div>
      </div>
    </Link>
  );
}
