# Arbeitsregeln für Mitwirkende und Codex

Diese Datei ist vor jeder Änderung am Repository vollständig zu lesen.

## Produktregeln

- Die Website ist öffentlich lesbar, aber nicht öffentlich beschreibbar.
- Das schwebende Plus bleibt der zentrale Einstieg zum Erstellen eines Projekts.
- Projektkarten zeigen mindestens Bild, Name und aktuelle geschätzte Gesamtkosten.
- Eine Projektseite zeigt oben Bild, Name und Preis, danach Beschreibung und Materialliste.
- Materialien zeigen Link, Menge, Einzelpreis, Zeilensumme, Preisstatus und Prüfzeitpunkt.
- Automatische Preise dürfen nie als garantiert aktuell bezeichnet werden.
- Fehlgeschlagene Preisermittlung braucht immer eine verständliche manuelle Ausweichmöglichkeit.

## Technische Regeln

- TypeScript im strikten Modus verwenden.
- Geldbeträge intern in Cent beziehungsweise kleinster Währungseinheit speichern.
- Berechtigungen immer serverseitig und in der Datenbank erzwingen; UI-Verstecken ist kein Schutz.
- Niemals Zugangsdaten, `.env`-Dateien, Tokens oder private Supabase-Schlüssel committen.
- Externe URLs validieren und gegen SSRF absichern, bevor der Server sie abruft.
- Keine fremden Skripte aus Produktseiten ausführen.
- Preisparser als austauschbare Stufen beziehungsweise Adapter strukturieren.
- Semantisches HTML, Tastaturbedienung, sichtbare Fokuszustände und ausreichende Kontraste beibehalten.
- Smartphone-Ansicht als gleichwertiges Hauptziel behandeln.

## Arbeitsablauf

1. Vor Änderungen `git status --short --branch` prüfen.
2. Diese Regeln und die für die Aufgabe relevante Dokumentation lesen.
3. Bestehende, nicht zur Aufgabe gehörende Änderungen nicht überschreiben.
4. Änderungen klein und nachvollziehbar halten.
5. Passende Typ-, Lint-, Test- und Build-Prüfungen ausführen.
6. Bei UI-Arbeit die tatsächliche Darstellung in schmaler und breiter Ansicht visuell prüfen.
7. Dokumentation aktualisieren, wenn sich eine Produkt- oder Architekturentscheidung ändert.

## Noch nicht ungefragt umsetzen

- Öffentliche Registrierung oder öffentliche Schreibrechte
- Bezahlfunktionen oder echtes Crowdfunding
- Kommentare ohne Moderationskonzept
- Browser-Automation zum Umgehen von Shop-Schutzmaßnahmen
- Shop-spezifische Parser, bevor bekannt ist, welche Shops tatsächlich genutzt werden

