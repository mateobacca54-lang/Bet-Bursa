// ============================================================
// og.mjs — genera public/og.png, la imagen que se ve al compartir Bursa en WhatsApp,
// X o Slack. Antes se usaba una foto de la bolsa de Madrid.
//
//   node scripts/og.mjs            (no necesita servidor: monta el HTML en memoria)
//
// Se regenera a mano cuando cambie la marca; el PNG se versiona en el repo para que
// compilar no dependa de tener Playwright.
// ============================================================

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'public', 'og.png');
const monedita = fs.readFileSync(path.join(root, 'public', 'monedita', 'monedita.webp')).toString('base64');

// Los valores van literales porque esto se ejecuta fuera del navegador de la app,
// donde no existen las variables de tokens.css. Deben coincidir con tokens.css.
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; display: flex; align-items: center; gap: 56px;
    padding: 72px; font-family: Montserrat, sans-serif; color: #0A0F1C;
    background: radial-gradient(70% 90% at 12% 50%, #FFF1C7 0%, #F6EFE6 55%, #F6EFE6 100%);
  }
  .brand { font-size: 30px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: #B93A10; }
  h1 { font-size: 74px; font-weight: 700; line-height: 1.08; letter-spacing: -.5px; margin-top: 18px; max-width: 12ch; }
  p { font-size: 29px; line-height: 1.45; color: #5B6478; margin-top: 22px; max-width: 22ch; }
  img { width: 330px; flex: none; filter: drop-shadow(0 18px 28px rgba(10,15,28,.18)); }
</style></head><body>
  <div>
    <div class="brand">Bursa</div>
    <h1>Entiende tu plata.</h1>
    <p>Escuela de dinero y mercados para jóvenes en Colombia.</p>
  </div>
  <img src="data:image/webp;base64,${monedita}" alt="">
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: out });
await browser.close();
console.log('ok', out);
