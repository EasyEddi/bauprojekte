import Link from "next/link";
import { Hammer } from "lucide-react";

export default function NotFound() {
  return (
    <div className="not-found">
      <Hammer size={40} aria-hidden="true" />
      <p className="eyebrow">404 · Projekt nicht gefunden</p>
      <h1>Hier liegt noch nichts auf der Werkbank.</h1>
      <p>Das Projekt existiert nicht oder wurde noch nicht veröffentlicht.</p>
      <Link className="primary-button" href="/">Zur Projektübersicht</Link>
    </div>
  );
}
