# Datenmodell

Alle Geldwerte werden als Ganzzahl in der kleinsten Währungseinheit gespeichert, bei Euro also in Cent. Dadurch entstehen keine Rundungsfehler durch Fließkommazahlen.

## `projects`

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `id` | UUID | Eindeutige ID |
| `slug` | Text, eindeutig | Lesbarer Teil der Projekt-URL |
| `name` | Text | Projektname |
| `description` | Text | Ausführliche Beschreibung |
| `image_path` | Text | Pfad zum Vorschaubild im Storage |
| `status` | Enum | `draft`, `published`, später weitere Zustände |
| `created_at` | Zeitstempel | Erstellung |
| `updated_at` | Zeitstempel | Letzte Änderung |
| `published_at` | Zeitstempel, optional | Veröffentlichung |

Die Gesamtsumme wird bevorzugt aus den Materialdaten berechnet. Falls sie später für schnellere Übersichten zwischengespeichert wird, muss die Datenbank sie bei jeder Materialänderung neu berechnen.

## `materials`

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `id` | UUID | Eindeutige ID |
| `project_id` | UUID | Zugehöriges Projekt |
| `name` | Text | Anzeigename des Materials |
| `product_url` | Text | Link zum Produkt |
| `quantity` | Dezimalzahl | Benötigte Menge |
| `unit_label` | Text, optional | Stück, Meter, Packung usw. |
| `current_unit_price_minor` | Integer, optional | Aktueller Einzelpreis in Cent |
| `currency` | Text | ISO-Währung, zunächst `EUR` |
| `price_source` | Enum | `automatic` oder `manual` |
| `price_status` | Enum | `current`, `stale`, `failed`, `pending` |
| `last_checked_at` | Zeitstempel, optional | Letzte automatische Prüfung |
| `last_error_code` | Text, optional | Maschinenlesbarer Fehlergrund |
| `sort_order` | Integer | Reihenfolge in der Liste |
| `created_at` | Zeitstempel | Erstellung |
| `updated_at` | Zeitstempel | Letzte Änderung |

## `price_history`

Diese Tabelle ist für Rabatt- und Preisänderungsanzeigen sinnvoll und kann bereits im MVP angelegt werden, auch wenn die Oberfläche sie noch nicht vollständig zeigt.

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

- Anonyme Nutzer dürfen `published`-Projekte und deren Materialien lesen.
- Entwürfe sind nur für den Admin lesbar.
- Nur der Admin darf Projekte, Materialien und Bilder ändern.
- Preisprüfungen schreiben ausschließlich über vertrauenswürdigen Servercode.
- Preisfehler enthalten keine vollständigen fremden HTML-Antworten oder Geheimnisse.

