import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>Projekt nicht gefunden</h1>
      <Link className="primary-button" href="/">Zur Projektübersicht</Link>
    </div>
  );
}
