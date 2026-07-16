# Bauprojekte Preishelfer für Opera GX

1. ZIP-Datei entpacken.
2. In Opera GX `opera://extensions` öffnen.
3. Den Entwicklermodus einschalten.
4. `Entpackte Erweiterung laden` wählen und diesen Ordner auswählen.
5. Den Preishelfer über das Erweiterungsmenü an die Symbolleiste heften.

Die Erweiterung hat nur die Berechtigungen `activeTab` und `scripting`. Sie kann eine Produktseite ausschließlich nach einem bewussten Klick auf ihr Symbol lesen. Bei einem gefundenen Preis öffnet sie `https://bauprojekte.vercel.app/preis-import` im aktuellen Produkttab und übergibt Produktname, Link und Preis an den Projekteditor.

Die Preisermittlung ist shopunabhängig: Sie vergleicht strukturierte Produktdaten, standardisierte Meta- und HTML-Attribute sowie sichtbare Euro-Preise. Hinweise auf alte Preise, UVP, Versand, Rabatte, Raten oder Grundpreise werden abgewertet beziehungsweise ausgeschlossen. Wenn zwei unterschiedliche Preise ähnlich wahrscheinlich sind, übernimmt die Erweiterung absichtlich keinen Wert.

Kann die automatische Bewertung keinen eindeutigen Hauptpreis bestimmen, markiert die Erweiterung Elemente beim Darüberfahren. Ein Klick direkt auf den sichtbaren Hauptpreis übernimmt diesen Wert. Mit `Esc` lässt sich der Auswahlmodus abbrechen.
