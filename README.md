# Bauprojekte

Eine öffentliche Projektübersicht für Bauideen, Materiallisten und aktuelle geschätzte Gesamtkosten.

Familie und Freunde können sehen, was als Nächstes gebaut werden soll, welche Materialien dafür fehlen und wie viel das Projekt voraussichtlich kostet. Projekte werden in einer Kachelübersicht dargestellt und besitzen eine eigene Detailansicht.

## Status

Das Projekt befindet sich in der Planungsphase. Dieses Repository enthält zunächst nur die fachliche und technische Dokumentation. Die Website selbst wird in einem späteren Schritt umgesetzt und über Vercel veröffentlicht.

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
- Supabase für Datenbank, Anmeldung und Bildspeicher
- Vercel für Hosting, Serverfunktionen und geplante Preisprüfungen

## Wichtiger Hinweis zur Preisaktualisierung

Ein beliebiger Shop-Link kann nicht garantiert dauerhaft automatisch ausgelesen werden. Shops ändern ihre Seiten, laden Preise erst im Browser nach oder blockieren automatisierte Zugriffe. Deshalb ist eine gestufte Lösung vorgesehen: strukturierte Produktdaten auslesen, später Shop-spezifische Adapter ergänzen und immer einen manuellen Preis als Rückfalloption anbieten.

