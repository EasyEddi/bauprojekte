# Technischer Plan

## Architekturentscheidung

Die Website wird als Next.js-Anwendung mit TypeScript umgesetzt und auf Vercel bereitgestellt. Vercel Blob speichert jedes Projekt als eigene JSON-Datei und die zugehörigen Vorschaubilder. Für die kleine, von einem einzelnen Admin verwaltete Familienseite ist das einfacher als eine relationale Datenbank und trotzdem dauerhaft sowie geräteübergreifend.

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
- Vercel Blob als dauerhafte Datenquelle für Projekt-JSON und Bilder
- Serverseitige Eingabeprüfung vor jedem Schreibzugriff
- Vercel-Funktionen laufen verbindlich in der Region Frankfurt, nah am Blob-Speicher und an den überwiegend deutschen Shops

### Veröffentlichung

- GitHub-Repository als Quellcodequelle
- Vercel-Projekt mit automatischem Deployment von `main`
- Preview-Deployments für spätere Feature-Branches
- Umgebungsvariablen ausschließlich in Vercel und lokal in einer nicht versionierten `.env.local`
- Produktionsdomain: `https://bauprojekte.vercel.app`

## Zugriffsschutz

Die Website ist lesend öffentlich. Das Plus bleibt sichtbar, führt für nicht angemeldete Besucher aber zur Passwort-Anmeldung. Das Passwort liegt ausschließlich als Vercel-Umgebungsvariable vor. Nach erfolgreicher Prüfung setzt der Server ein signiertes, `HttpOnly`, `SameSite=Strict`-Cookie. Der Projekt-Endpunkt prüft diese Sitzung erneut; ein nur im Browser verstecktes Formular wäre kein Schutz.

## Preisermittlung

### Warum „jeder Link live“ nicht garantiert werden kann

Produktseiten unterscheiden sich stark. Manche Shops liefern strukturierte Daten, manche rendern Preise mit JavaScript, verlangen Cookies, zeigen regionale Preise oder blockieren Bots. Außerdem können sich HTML-Strukturen jederzeit ändern. Darum wird die Funktion fehlertolerant gebaut.

### Aktuelle Pipeline

1. URL normalisieren und nur `http` beziehungsweise `https` erlauben.
2. Serverseitig abrufen; private Netzwerkadressen und Weiterleitungen dorthin blockieren.
   Falls derselbe Shop bei der ersten Antwort eine öffentliche Markt- oder Sitzungsauswahl setzt, wird die Produktseite einmal mit genau diesen kurzlebigen Cookies erneut geladen.
3. JSON-LD vom Typ `Product` und `Offer` auslesen.
4. Als zweite Stufe standardisierte Meta-Tags prüfen.
5. Als allgemeine dritte Stufe semantische HTML-Preismarkierungen sammeln und bewerten; alte Preise, UVP und uneindeutige Kandidaten nicht automatisch übernehmen.
6. Bekannte Shop-Konfigurationen über kleine, getrennte Adapter berücksichtigen; aktuell wird die im Stofferia-Link gespeicherte Stofflänge auf den Meterpreis angewendet.
7. Den ermittelten Cent-Wert mit dem Preisstatus im Material speichern.
8. Falls kein Preis gefunden wird, direkt im Formular einen manuellen Ersatzpreis anbieten.
9. Bei Shop-Schutzseiten kann der Admin optional die lokale Opera-GX-Erweiterung „Bauprojekte Preishelfer“ installieren. Sie hat nur `activeTab` und `scripting`, liest eine Produktseite erst nach einem bewussten Klick und übergibt Produktname, Link und Cent-Wert an den Projekteditor. Der Import funktioniert sowohl direkt von einer Produktseite als auch mit einem bereits geöffneten Material im Formular. Dadurch bleibt er auch bei Seiten nutzbar, deren Content Security Policy Lesezeichen-Skripte blockiert.
10. Später für weitere häufig genutzte Shops gezielte Adapter ergänzen.

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

1. Server listet gespeicherte Projektdateien aus Vercel Blob.
2. Gespeicherte Preise werden sofort angezeigt.
3. Veraltete Werte sind mit dem Zeitpunkt der letzten Prüfung versehen.
4. Eine Preisprüfung läuft unabhängig und aktualisiert anschließend die Daten.

### Neues Projekt

1. Client sammelt Projektdaten und Materialien.
2. Server validiert Anmeldung und Eingaben.
3. Ein optionales Bild wird nach Typ- und Größenprüfung in Vercel Blob geladen.
4. Projekt und Materialien werden gemeinsam als eigene JSON-Datei gespeichert.
5. Noch nicht abgerufene Preise werden vor dem Speichern geprüft.
6. Der Server berechnet beziehungsweise liefert die neue Summe.

## Beobachtbarkeit und Fehlerbehandlung

- Nutzerfreundliche Statusangaben: aktuell, manuell, veraltet oder Prüfung fehlgeschlagen
- Technische Fehler serverseitig protokollieren, ohne Geheimnisse oder Zugangsdaten auszugeben
- Fehler bei einem Material dürfen andere Materialien nicht blockieren
- Preisverlauf optional von Anfang an speichern, damit Rabatte später nachvollziehbar sind

## Offene Entscheidungen vor der Implementierung

- Welche Shops zuerst zuverlässig unterstützt werden müssen
- Ob der Preisverlauf bereits in Version 1 sichtbar sein soll
