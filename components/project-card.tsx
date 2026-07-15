"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { formatPrice, getProjectTotal, type Project } from "@/lib/projects";

type MenuPosition = { x: number; y: number };

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!menuPosition) return;
    function closeMenu() { setMenuPosition(null); }
    function closeMenuWithKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("keydown", closeMenuWithKeyboard);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("keydown", closeMenuWithKeyboard);
    };
  }, [menuPosition]);

  function openMenu(x: number, y: number) {
    setMenuPosition({
      x: Math.max(8, Math.min(x, window.innerWidth - 190)),
      y: Math.max(8, Math.min(y, window.innerHeight - 112)),
    });
  }

  return (
    <div className="project-card-shell" onContextMenu={(event) => { event.preventDefault(); openMenu(event.clientX, event.clientY); }}>
      <Link
        className="project-card"
        href={`/projekte/${project.slug}`}
        aria-label={`${project.name} ansehen`}
        onKeyDown={(event) => {
          if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            openMenu(rect.left + 20, rect.top + 20);
          }
        }}
      >
        <div className="card-image">
          {project.image
            ? <Image src={project.image} alt={project.imageAlt} fill priority={priority} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" />
            : <div className="card-image-empty" aria-hidden="true" />}
        </div>
        <div className="card-body">
          <h2>{project.name}</h2>
          <strong>{formatPrice(getProjectTotal(project))}</strong>
        </div>
      </Link>

      {menuPosition && <div className="project-context-menu" role="menu" aria-label={`Aktionen für ${project.name}`} style={{ left: menuPosition.x, top: menuPosition.y }} onClick={(event) => event.stopPropagation()}>
        <Link role="menuitem" href={`/projekte/${project.slug}/bearbeiten`}><Pencil size={16} aria-hidden="true" /> Bearbeiten</Link>
        <button role="menuitem" type="button" onClick={() => { setMenuPosition(null); setDeleteOpen(true); }}><Trash2 size={16} aria-hidden="true" /> Löschen</button>
      </div>}

      <DeleteProjectDialog name={project.name} slug={project.slug} open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}
