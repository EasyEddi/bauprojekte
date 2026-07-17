# Datenmodell

Alle Geldwerte werden als Ganzzahl in der kleinsten Währungseinheit gespeichert, bei Euro also in Cent. Dadurch entstehen keine Rundungsfehler durch Fließkommazahlen.

## Projektdatei in Vercel Blob

Jede gespeicherte Projektversion liegt unveränderlich unter `projects/<slug>/<zeitstempel>-<revision>.json`. Beim Lesen wird pro Slug ausschließlich die neueste Kombination aus `updatedAt` und `revision` verwendet. Bestehende Dateien unter `projects/<slug>.json` bleiben als lesbare Legacy-Version erhalten, verlieren aber gegen jede neuere Revision. Bilddateien liegen getrennt unter `images/<slug>.<endung>`.

Durch neue Blob-Pfade pro Bearbeitung kann weder ein CDN-Cache noch eine verzögerte Listenantwort den Inhalt einer neueren Revision überschreiben. Alte Revisionen bleiben als kleiner Wiederherstellungsverlauf erhalten und werden beim Löschen eines Projekts gemeinsam entfernt.

### Projektfelder

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `id` | UUID | Eindeutige ID |
| `slug` | Text, eindeutig | Lesbarer Teil der Projekt-URL |
| `name` | Text | Projektname |
| `description` | Text, optional leer | Ausführliche Beschreibung |
| `image` | URL oder `null` | Optionale öffentliche URL zum Vorschaubild in Vercel Blob |
| `status` | Text | Aktueller Projektstatus |
| `createdAt` | Zeitstempel | Erstellung |
| `updatedAt` | Zeitstempel | Zeitpunkt der gespeicherten Revision |
| `revision` | UUID | Eindeutige, unveränderliche Versionskennung |

Die Gesamtsumme wird bevorzugt aus den Materialdaten berechnet. Falls sie später für schnellere Übersichten zwischengespeichert wird, muss die Datenbank sie bei jeder Materialänderung neu berechnen.

### Eingebettete Materialien

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `id` | UUID | Eindeutige ID |
| `name` | Text | Anzeigename des Materials |
| `productUrl` | Text | Link zum Produkt |
| `quantity` | Dezimalzahl | Benötigte Menge |
| `unitLabel` | Text, optional | Stück, Meter, Packung usw. |
| `unitPriceMinor` | Integer | Aktueller Einzelpreis in Cent |
| `currency` | Text | ISO-Währung, zunächst `EUR` |
| `priceStatus` | Enum | `current` nach erfolgreicher Prüfung, `manual` als Ersatzpreis oder `stale` nach einer fehlgeschlagenen erneuten Serverprüfung |
| `priceSource` | Enum | `server`, wenn die Website den Link selbst prüfen kann; `browser` bei Übernahme durch die Erweiterung; `manual` beim Ersatzpreis |
| `lastCheckedAt` | ISO-Zeitstempel, optional | Exakter Zeitpunkt der letzten erfolgreichen Preisermittlung |
| `lastCheckedLabel` | Text | Abwärtskompatibles deutsches Datum der letzten Preisangabe |
| `sortOrder` | Integer | Reihenfolge innerhalb der Projektdatei |

## Später: Preisverlauf

Eine getrennte Datenbank oder zusätzliche Verlaufsdateien werden erst mit der automatischen Preisprüfung benötigt.

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `id` | UUID | Eindeutige ID |
| `material_id` | UUID | Zugehöriges Material |
| `unit_price_minor` | Integer | Gefundener Einzelpreis |
| `currency` | Text | ISO-Währung |
| `availability` | Text, optional | Erkannte Verfügbarkeit |
| `source_kind` | Text | JSON-LD, Meta-Tag, Adapter oder manuell |
| `checked_at` | Zeitstempel | Zeitpunkt der Ermittlung |

## Berechnung

```text
Materialsumme = Menge × Einzelpreis
Projektgesamtpreis = Summe aller Materialsummen
```

Die Oberfläche formatiert Cent-Werte erst bei der Anzeige. Bei Dezimalmengen muss serverseitig eine fest definierte Rundungsregel verwendet werden.

## Zugriffsregeln

- Anonyme Nutzer dürfen gespeicherte Projekte, Materialien und öffentliche Bilder lesen.
- Nur der Admin darf Projekte, Materialien und Bilder ändern.
- Preisprüfungen schreiben ausschließlich über vertrauenswürdigen Servercode.
- Preisfehler enthalten keine vollständigen fremden HTML-Antworten oder Geheimnisse.

Beim Öffnen einer Projektseite werden ausschließlich Materialien mit `priceSource: server` erneut geprüft. Browser- und manuelle Preise bleiben unverändert. Alte Datensätze ohne `priceSource` werden einmal geprüft und anschließend entsprechend als `server`, `browser` oder `manual` eingeordnet.
