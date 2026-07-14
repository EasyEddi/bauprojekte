# Datenmodell

Alle Geldwerte werden als Ganzzahl in der kleinsten Währungseinheit gespeichert, bei Euro also in Cent. Dadurch entstehen keine Rundungsfehler durch Fließkommazahlen.

## Projektdatei in Vercel Blob

Jedes Projekt liegt unter `projects/<slug>.json`. Bilddateien liegen getrennt unter `images/<slug>.<endung>`. Dadurch kann ein Projekt unabhängig gelesen oder später ersetzt werden, ohne eine gemeinsame JSON-Datei konkurrierend zu überschreiben.

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
| `priceStatus` | Enum | `current` nach automatischer Prüfung oder `manual` als Ersatzpreis; später zusätzlich `stale` |
| `lastCheckedLabel` | Text | Datum der letzten Preisangabe |
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
