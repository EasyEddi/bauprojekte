# Umsetzungsplan

## Phase 0 – Grundlage

- [x] Produktidee und Nutzerabläufe festhalten
- [x] Technische Architektur festlegen
- [x] Datenmodell skizzieren
- [x] Risiken der automatischen Preisermittlung dokumentieren
- [x] Arbeitsnamen und erste visuelle Richtung festlegen

## Phase 1 – Öffentlicher Prototyp

- [x] Next.js-Projekt mit TypeScript und Tailwind anlegen
- [x] Leeren Ausgangszustand ohne öffentliche Platzhalterprojekte anlegen
- [x] Responsive Kachelübersicht umsetzen
- [x] Projektdetailseite umsetzen
- [x] Materialliste und korrekte Summenberechnung umsetzen
- [x] Leere und nicht gefundene Zustände gestalten
- [x] Interaktiven, noch nicht persistenten Erstellen-Prototyp umsetzen
- [x] Erste visuelle Abnahme auf Smartphone und Desktop

## Phase 2 – Daten und Verwaltung

- [ ] Supabase-Projekt verbinden
- [ ] Datenbanktabellen und Row Level Security anlegen
- [ ] Admin-Anmeldung einrichten
- [ ] Geschütztes Formular hinter dem Plus umsetzen
- [ ] Projektbilder hochladen
- [ ] Projekte und Materialien erstellen, bearbeiten und löschen
- [ ] Entwurf und Veröffentlichung unterstützen

## Phase 3 – Preise

- [ ] Sicheren URL-Abruf implementieren
- [ ] JSON-LD-Produktpreise extrahieren
- [ ] Manuellen Ersatzpreis und Preisstatus umsetzen
- [ ] Häufig verwendete Shops testen und priorisieren
- [ ] Preisverlauf speichern
- [ ] Tägliche Aktualisierung über Vercel Cron einrichten
- [ ] Rabatt- und Änderungsanzeige ergänzen

## Phase 4 – Veröffentlichung

- [x] Vercel-Projekt mit GitHub verbinden
- [ ] Umgebungsvariablen hinterlegen
- [ ] Produktionsdatenbank und Storage vorbereiten
- [ ] Sicherheits- und Berechtigungsprüfung durchführen
- [ ] Performance und mobile Bedienung prüfen
- [x] Öffentliche Domain unter `bauprojekte.vercel.app` veröffentlichen

## Abnahmekriterien für Version 1

- Besucher können alle veröffentlichten Projekte ohne Anmeldung ansehen.
- Projektkacheln zeigen korrekt Bild, Name und Gesamtkosten.
- Die Detailansicht zeigt Beschreibung und vollständige Materialliste.
- Nur Eddi kann Inhalte verändern.
- Ein kaputter oder blockierter Shop-Link macht das Projekt nicht unbenutzbar.
- Jeder Preis zeigt Quelle und Zeitpunkt der letzten Prüfung.
- Die Website ist auf einem typischen Smartphone bequem bedienbar.
