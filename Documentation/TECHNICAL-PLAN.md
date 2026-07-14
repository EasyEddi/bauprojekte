# Technischer Plan

## Architekturentscheidung

Die Website wird als Next.js-Anwendung mit TypeScript umgesetzt und auf Vercel bereitgestellt. Supabase übernimmt PostgreSQL-Datenbank, Anmeldung und Bildspeicher. Diese Trennung hält die Website einfach deploybar und ermöglicht trotzdem dauerhafte, gemeinsam genutzte Daten.

## Komponenten

### Frontend

- Next.js App Router
- React Server Components für öffentliche, gut ladbare Seiten
- Client Components nur für interaktive Formulare und Live-Summen
- Tailwind CSS für ein konsistentes responsives Layout
- Deutsche Oberfläche, Preise mit `Intl.NumberFormat` in Euro

### Backend

- Next.js Server Actions oder Route Handler für Schreibvorgänge
- Serverseitige Prüfung jeder Verwalter-Sitzung
- Supabase PostgreSQL als dauerhafte Datenquelle
- Supabase Storage für Projektbilder
- Eingabeprüfung mit Zod

### Veröffentlichung

- GitHub-Repository als Quellcodequelle
- Vercel-Projekt mit automatischem Deployment von `main`
- Preview-Deployments für spätere Feature-Branches
- Umgebungsvariablen ausschließlich in Vercel und lokal in einer nicht versionierten `.env.local`

## Zugriffsschutz

Die Website ist lesend öffentlich. Das Plus darf sichtbar sein, führt für nicht angemeldete Besucher aber zur Anmeldung. Erstellen, Bearbeiten, Löschen, Bild-Uploads und Preisaktualisierungen werden zusätzlich auf dem Server geschützt. Eine nur im Browser versteckte Schaltfläche reicht nicht aus.

Für Version 1 ist Supabase Auth mit E-Mail-Magic-Link oder E-Mail/Passwort vorgesehen. Zusätzlich wird eine feste Admin-E-Mail als Umgebungsvariable geprüft. Row Level Security erlaubt öffentliche Lesezugriffe nur auf veröffentlichte Projekte und Schreibzugriffe nur für den Admin.

## Preisermittlung

### Warum „jeder Link live“ nicht garantiert werden kann

Produktseiten unterscheiden sich stark. Manche Shops liefern strukturierte Daten, manche rendern Preise mit JavaScript, verlangen Cookies, zeigen regionale Preise oder blockieren Bots. Außerdem können sich HTML-Strukturen jederzeit ändern. Darum wird die Funktion fehlertolerant gebaut.

### Geplante Pipeline

1. URL normalisieren und nur `http` beziehungsweise `https` erlauben.
2. Serverseitig abrufen; private Netzwerkadressen und Weiterleitungen dorthin blockieren.
3. JSON-LD vom Typ `Product` und `Offer` auslesen.
4. Als zweite Stufe standardisierte Meta-Tags prüfen.
5. Später für häufig genutzte Shops gezielte Adapter ergänzen.
6. Preis, Währung, Verfügbarkeit, Quelle und Prüfzeit speichern.
7. Bei Fehlern den letzten gültigen Preis behalten und den Fehlerstatus anzeigen.
8. Falls noch kein Preis existiert, einen manuellen Preis verlangen.

### Aktualisierungsrhythmus

- Beim Hinzufügen eines Materials: sofortiger Versuch
- Beim Öffnen einer Projektseite: nur aktualisieren, wenn der Preis deutlich veraltet ist; nicht jeden Seitenaufruf blockieren
- Geplant: täglicher Vercel-Cronjob für veröffentlichte Projekte
- Manuell: Admin kann eine Aktualisierung anstoßen

Das ist „nahezu aktuell“, ohne Shops bei jedem Besuch unnötig anzufragen oder die Seite langsam zu machen.

### Sicherheitsgrenzen

- Schutz gegen Server-Side Request Forgery: keine lokalen IPs, Cloud-Metadatenziele oder fremden Protokolle
- Kurze Timeouts, begrenzte Antwortgröße und begrenzte Weiterleitungen
- Rate Limit pro Verwalter und Ziel-Domain
- HTML nur parsen, niemals fremde Skripte ausführen
- Shop-Link und extrahierte Texte vor Ausgabe validieren

## Datenfluss

### Öffentliche Seite

1. Server lädt veröffentlichte Projekte aus Supabase.
2. Gespeicherte Preise werden sofort angezeigt.
3. Veraltete Werte sind mit dem Zeitpunkt der letzten Prüfung versehen.
4. Eine Preisprüfung läuft unabhängig und aktualisiert anschließend die Daten.

### Neues Projekt

1. Client sammelt Projektdaten und Materialien.
2. Server validiert Anmeldung und Eingaben.
3. Bild wird in einen eingeschränkten Storage-Bucket geladen.
4. Projekt und Materialien werden transaktional gespeichert.
5. Preisprüfungen werden angestoßen.
6. Der Server berechnet beziehungsweise liefert die neue Summe.

## Beobachtbarkeit und Fehlerbehandlung

- Nutzerfreundliche Statusangaben: aktuell, manuell, veraltet oder Prüfung fehlgeschlagen
- Technische Fehler serverseitig protokollieren, ohne Geheimnisse oder Zugangsdaten auszugeben
- Fehler bei einem Material dürfen andere Materialien nicht blockieren
- Preisverlauf optional von Anfang an speichern, damit Rabatte später nachvollziehbar sind

## Offene Entscheidungen vor der Implementierung

- Endgültiger Projektname und gewünschte Vercel-Domain
- Magic Link oder Passwort für die Admin-Anmeldung
- Supabase oder alternativ Vercel Postgres plus Blob
- Welche Shops zuerst zuverlässig unterstützt werden müssen
- Ob der Preisverlauf bereits in Version 1 sichtbar sein soll

