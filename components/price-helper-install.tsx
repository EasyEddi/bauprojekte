"use client";

import { useEffect, useRef } from "react";

function bookmarklet(origin: string) {
  const destination = JSON.stringify(`${origin}/preis-import`);
  const script = `(()=>{const n=v=>{if(typeof v==='number')return v;v=String(v??'').replace(/\\s/g,'').replace(/[^0-9,.-]/g,'');const c=v.lastIndexOf(','),d=v.lastIndexOf('.');if(c>=0&&d>=0)v=c>d?v.replace(/\\./g,'').replace(',','.'):v.replace(/,/g,'');else if(c>=0)v=v.replace(',','.');return Number.parseFloat(v)};const w=o=>{if(Array.isArray(o)){for(const x of o){const r=w(x);if(r!=null)return r}}else if(o&&typeof o==='object'){const t=[o['@type']].flat().join(' ');if(/Offer|PriceSpecification/i.test(t)&&String(o.priceCurrency||o.currency||'EUR').toUpperCase()==='EUR'){const r=n(o.price??o.lowPrice);if(Number.isFinite(r))return r}for(const k of ['offers','priceSpecification','@graph']){const r=w(o[k]);if(r!=null)return r}}return null};let p=null;for(const s of document.querySelectorAll('script[type="application/ld+json"]')){try{p=w(JSON.parse(s.textContent));if(p!=null)break}catch{}}if(p==null){const e=document.querySelector('meta[property="product:price:amount"],meta[property="og:price:amount"],[itemprop="price"],[data-price],[data-product-price],[data-current-price],[data-final-price]');if(e)p=n(e.content||e.value||e.dataset.price||e.dataset.productPrice||e.dataset.currentPrice||e.dataset.finalPrice||e.textContent)}if(!Number.isFinite(p)||p<0){alert('Auf dieser Seite wurde kein eindeutiger Euro-Preis gefunden.');return}location.href=${destination}+'?priceMinor='+Math.round(p*100)})()`;
  return `javascript:${script}`;
}

export function PriceHelperInstall({ origin }: { origin: string }) {
  const bookmark = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    bookmark.current?.setAttribute("href", bookmarklet(origin));
  }, [origin]);
  return (
    <div className="price-helper-install">
      <p>Ziehe diesen Knopf einmal in deine Lesezeichenleiste:</p>
      <a ref={bookmark} className="primary-button price-helper-bookmark" href="#">Preis übernehmen</a>
      <ol>
        <li>Im Projektformular auf „Produkt öffnen“ klicken.</li>
        <li>Auf der Produktseite das Lesezeichen „Preis übernehmen“ anklicken.</li>
        <li>Der Preis erscheint automatisch im noch geöffneten Projektformular.</li>
      </ol>
      <small>Der Helfer liest nur die geöffnete Produktseite. Er überträgt keine Anmeldung und führt keine Shop-Automation aus.</small>
    </div>
  );
}
