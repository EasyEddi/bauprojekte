import { Download, Puzzle } from "lucide-react";

export function PriceHelperInstall() {
  return (
    <div className="price-helper-install">
      <p><strong>Einmal in Opera GX installieren</strong></p>
      <a className="primary-button price-helper-download" href="/downloads/bauprojekte-preishelfer-opera.zip" download>
        <Download size={17} aria-hidden="true" /> Preishelfer herunterladen
      </a>
      <ol>
        <li>Die heruntergeladene ZIP-Datei rechtsklicken und vollständig entpacken.</li>
        <li><code>opera://extensions</code> in Opera GX öffnen und oben rechts den Entwicklermodus einschalten.</li>
        <li>„Entpackte Erweiterung laden“ anklicken und den entpackten Ordner auswählen.</li>
        <li>Über das Erweiterungs-Symbol den „Bauprojekte Preishelfer“ an die Symbolleiste heften.</li>
      </ol>
      <p><strong>Danach bei jedem Produkt</strong></p>
      <ol>
        <li>Im Projektformular auf „Produkt öffnen“ klicken.</li>
        <li>Auf der Produktseite oben auf <Puzzle size={15} aria-label="Erweiterungen" /> und dann „Bauprojekte Preishelfer“ klicken.</li>
        <li>Der Preis erscheint automatisch im noch geöffneten Projektformular.</li>
      </ol>
      <small>Die Erweiterung darf nur die gerade geöffnete Seite lesen und auch das erst, nachdem du ihr Symbol anklickst. Sie überträgt keine Shop-Anmeldung.</small>
    </div>
  );
}
