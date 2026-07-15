# Produktbeschreibung

## Vision

`Bauprojekte` macht aus einer losen Bauidee einen verständlichen, teilbaren Plan. Familienmitglieder sollen auf einen Blick erkennen können, was Eddi bauen möchte, warum das Projekt interessant ist und welche Materialien beziehungsweise Kosten dafür anfallen.

## Zielgruppe

- Eddi als einziger Verwalter der Inhalte
- Eltern und weitere Familienmitglieder als öffentliche Besucher
- Optional später: Familienmitglieder, die ein Projekt finanziell oder mit Material unterstützen möchten

## Kernablauf für Besucher

1. Die Startseite zeigt alle veröffentlichten Projekte als Kacheln.
2. Jede Kachel enthält Projektname, aktuelle geschätzte Gesamtkosten und ein Vorschaubild, falls vorhanden.
3. Ein Klick öffnet die Projektseite.
4. Oben stehen erneut Name, Gesamtkosten und das optionale Bild.
5. Darunter folgen die optionale Beschreibung und die Materialliste.
6. Jeder Materialeintrag zeigt Bezeichnung, Menge, Einzelpreis, Zeilensumme, Zeitpunkt der letzten Preisprüfung und Link zum Shop.

## Kernablauf für den Verwalter

1. Das Plus am unteren Bildschirmrand öffnet die Anmeldung, falls Eddi noch nicht angemeldet ist.
2. Nach erfolgreicher Anmeldung öffnet sich das Formular für ein neues Projekt.
3. Eddi gibt einen Namen ein und kann optional eine Beschreibung sowie ein Bild ergänzen.
4. Er fügt beliebig viele Materialien mit Name, Menge und Produktlink hinzu.
5. Das System versucht den Preis serverseitig zu ermitteln.
6. Falls das nicht gelingt, kann Eddi einen Preis manuell eintragen.
7. Die Gesamtsumme aktualisiert sich bei jeder Änderung.
8. Das Projekt kann als Entwurf gespeichert oder veröffentlicht werden.

## Anforderungen für Version 1

### Muss

- Öffentliche, responsive Projektübersicht
- Detailseite pro Projekt
- Sichere Anmeldung für genau einen Verwalter
- Projekt erstellen, bearbeiten, veröffentlichen und löschen
- Eigenes Rechtsklickmenü auf Projektkacheln mit Bearbeiten und Löschen
- Bild optional hochladen
- Materialien hinzufügen, ändern und entfernen
- Menge und Einzelpreis je Material
- Automatisch berechnete Material- und Projektsummen
- Preisermittlung aus strukturierten Produktdaten, wenn der Shop diese bereitstellt
- Manueller Ersatzpreis, wenn die Automatik fehlschlägt
- Anzeige von Währung, Preisquelle, Prüfstatus und letzter Aktualisierung

### Soll

- Automatische tägliche Preisprüfung
- Manuelle Schaltfläche „Preise aktualisieren“
- Kennzeichnung von Rabatten und Preisänderungen
- Entwürfe, die öffentlich nicht sichtbar sind
- Sinnvolle Lade-, Leer- und Fehlerzustände

### Später möglich

- Beiträge oder Materialspenden durch Familienmitglieder
- Projektstatus wie Idee, geplant, finanziert, im Bau und fertig
- Fortschrittsbilder
- Kommentare oder Reaktionen
- Mehrere Bezugsquellen pro Material
- Budgetziel und bereits vorhandenes Material

## Gestaltungsrichtung

- Schlichte, funktionale Übersicht ohne Hero-Bereich, Sprüche oder dekorative Zusatzblöcke
- Projektkacheln zeigen nur optionales Bild, Name und Preis
- Kartenraster auf Desktop, einspaltige Liste auf kleinen Smartphones
- Gut erreichbares Plus als schwebende Aktion am unteren Rand
- Ruhige Farbflächen in Hellgrün und Creme, dunkles Grün für Aktionen und ein sparsamer Terrakotta-Akzent
- Dark Mode ist der Standard; ein Umschalter links oben aktiviert den Light Mode und merkt sich die Auswahl im Browser
- Einheitliche, weiche Karten für Übersicht und Formular; keine übergroßen Überschriften oder dekorativen Infoboxen
- Die Projektdetailseite verwendet denselben schlichten Kartenstil wie Übersicht und Formular

## Fachliche Regeln

- Öffentlich sichtbar sind nur veröffentlichte Projekte.
- Schreibzugriffe erfordern eine bestätigte Verwalter-Sitzung.
- Der Projektpreis ist die Summe aus `Menge × aktuellem Einzelpreis` aller aktiven Materialien.
- Ein Preis ohne erfolgreiche automatische Prüfung bleibt erlaubt, wird aber als manuell gekennzeichnet.
- Veraltete Preise werden sichtbar markiert und niemals als garantiert aktuell dargestellt.
- Ein externer Produktlink öffnet sich in einem neuen Tab.

## Erfolgskriterien

- Ein Familienmitglied versteht ein Projekt ohne zusätzliche Erklärung.
- Eddi kann ein Projekt einschließlich Materialliste bequem am Smartphone anlegen.
- Summen stimmen auch bei Mengen größer als eins.
- Fehlgeschlagene Preisprüfungen verhindern nicht das Speichern eines Projekts.
- Fremde Besucher können keine Inhalte erstellen oder verändern.
