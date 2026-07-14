# Bauprojekte

Eine öffentliche Projektübersicht für Bauideen, Materiallisten und aktuelle geschätzte Gesamtkosten.

**Live:** [bauprojekte.vercel.app](https://bauprojekte.vercel.app)

Familie und Freunde können sehen, was als Nächstes gebaut werden soll, welche Materialien dafür fehlen und wie viel das Projekt voraussichtlich kostet. Projekte werden in einer Kachelübersicht dargestellt und besitzen eine eigene Detailansicht.

## Status

Die öffentliche Anwendung ist über Vercel erreichbar. Die Startseite ist bewusst auf ein reines Kachelraster reduziert. Kacheln zeigen ausschließlich Bild, Projektname und Gesamtkosten. Platzhalterprojekte werden nicht veröffentlicht.

Projekte und Bilder werden dauerhaft in Vercel Blob gespeichert. Das Erstellen-Formular ist serverseitig mit einem Admin-Passwort geschützt; gespeicherte Projekte erscheinen anschließend öffentlich in Übersicht und Detailansicht. Automatische Preisabfragen folgen in einer späteren Ausbaustufe, aktuell wird der Preis manuell eingetragen.

## Geplanter Funktionsumfang

- Öffentliche Übersicht aller Bauprojekte
- Projektkacheln mit Bild, Name und automatisch berechneter Kostensumme
- Detailansicht mit Beschreibung und vollständiger Materialliste
- Materialeinträge mit Shop-Link, Menge, Einzelpreis und Gesamtpreis
- Geschützter Verwaltungsbereich zum Erstellen und Bearbeiten von Projekten
- Automatische Preisprüfung mit sichtbarem Prüfzeitpunkt und manuellem Ersatzpreis
- Responsive Darstellung für Smartphone und Desktop

## Dokumentation

- [Produktbeschreibung](Documentation/PRODUCT-BRIEF.md)
- [Technischer Plan](Documentation/TECHNICAL-PLAN.md)
- [Datenmodell](Documentation/DATA-MODEL.md)
- [Umsetzungsplan](Documentation/ROADMAP.md)
- [Arbeitsregeln](Documentation/AGENT-RULES.md)

## Vorgesehener Stack

- Next.js mit TypeScript
- Tailwind CSS
- Vercel Blob für dauerhaft gespeicherte Projekte und Bilder
- Serverseitig geschützter Admin-Zugang über ein Vercel-Secret
- Vercel für Hosting, Serverfunktionen und geplante Preisprüfungen

## Lokal starten

Voraussetzung ist eine aktuelle Node.js-Version mit pnpm.

```bash
pnpm install
pnpm dev
```

Für lokales Speichern werden `BLOB_READ_WRITE_TOKEN` und `ADMIN_PASSWORD` in einer nicht eingecheckten `.env.local` benötigt.

Die Produktionsprüfung läuft mit:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Wichtiger Hinweis zur Preisaktualisierung

Ein beliebiger Shop-Link kann nicht garantiert dauerhaft automatisch ausgelesen werden. Shops ändern ihre Seiten, laden Preise erst im Browser nach oder blockieren automatisierte Zugriffe. Deshalb ist eine gestufte Lösung vorgesehen: strukturierte Produktdaten auslesen, später Shop-spezifische Adapter ergänzen und immer einen manuellen Preis als Rückfalloption anbieten.
