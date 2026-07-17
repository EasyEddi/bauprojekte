"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { formatPrice, getProjectTotal, projectKindLabel, type Project } from "@/lib/projects";

type MenuPosition = { x: number; y: number };

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const router = useRouter();
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoreTouchClick = useRef(false);

  useEffect(() => () => {
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
  }, []);

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

  function handleTouchEnd(event: React.TouchEvent<HTMLAnchorElement>) {
    const start = touchStart.current;
    const touch = event.changedTouches.item(0);
    touchStart.current = null;
    if (!start || !touch || Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 16) return;

    event.preventDefault();
    ignoreTouchClick.current = true;
    const now = Date.now();
    const previous = lastTap.current;
    const isDoubleTap = previous
      && now - previous.time <= 340
      && Math.hypot(touch.clientX - previous.x, touch.clientY - previous.y) <= 32;

    if (isDoubleTap) {
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
      navigationTimer.current = null;
      lastTap.current = null;
      openMenu(touch.clientX, touch.clientY);
      return;
    }

    lastTap.current = { time: now, x: touch.clientX, y: touch.clientY };
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    navigationTimer.current = setTimeout(() => {
      navigationTimer.current = null;
      lastTap.current = null;
      ignoreTouchClick.current = false;
      router.push(`/projekte/${project.slug}`);
    }, 360);
  }

  return (
    <div className="project-card-shell" onContextMenu={(event) => { event.preventDefault(); openMenu(event.clientX, event.clientY); }}>
      <Link
        className="project-card"
        href={`/projekte/${project.slug}`}
        aria-label={`${project.name} ansehen`}
        onTouchStart={(event) => {
          const touch = event.touches.item(0);
          touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => { touchStart.current = null; }}
        onClick={(event) => {
          if (!ignoreTouchClick.current) return;
          event.preventDefault();
          event.stopPropagation();
          ignoreTouchClick.current = false;
        }}
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
          <div className="card-title">
            <small>{projectKindLabel(project.kind)}</small>
            <h2>{project.name}</h2>
          </div>
          {project.kind !== "idea" && <strong>{formatPrice(getProjectTotal(project))}</strong>}
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
