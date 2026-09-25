// ============================================================
// exportar-animaciones.mjs — junta en una carpeta todos los dibujos de Bursa.
//
//   node scripts/exportar-animaciones.mjs [carpeta-destino]
//
// Necesita Storybook (localhost:6006) y la app (localhost:3100) corriendo: los dibujos
// se leen de su render real, no de una copia, así que la carpeta nunca se desincroniza.
// Por defecto escribe en ../../Animaciones (junto a Fotos y Personajes).
//
// Qué produce:
//   Estampas/    las escenas grandes (4:3): .svg, .svg con fondo, .png y .png sin fondo
//   Objetos/     los dibujitos chicos (cuadrados): .svg y .png sin fondo
//   Personajes/  Monedita recortada (.png y .webp)
//   Compartir/   la imagen que se ve al compartir el enlace
//   Grabaciones/ videos cortos de las animaciones (héroe, escenas de scroll, camino)
//
// Los .svg llevan los colores ya resueltos (no dependen de tokens.css). Los textos usan
// Montserrat: si el programa donde se abren no la tiene, verá otra tipografía; los .png no.
// ============================================================

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.resolve(process.argv[2] ?? path.join(root, '..', '..', 'Animaciones'));
const SB = 'http://localhost:6006/iframe.html?viewMode=story&id=';
const APP = 'http://localhost:3100';

for (const d of ['Estampas', 'Objetos', 'Personajes', 'Compartir', 'Grabaciones']) {
  fs.rmSync(path.join(out, d), { recursive: true, force: true });
  fs.mkdirSync(path.join(out, d), { recursive: true });
}

const browser = await chromium.launch();

/** Serializa cada <svg> con los colores ya resueltos y, si se pide, con un fondo. */
async function exportSvgs(page, selector, attr, folder, { fondo, w, h }) {
  const items = await page.evaluate(
    async ({ selector, attr, fondo, w, h }) => {
      const rootStyle = getComputedStyle(document.documentElement);
      const resolve = (s) => s.replace(/var\((--[\w-]+)\)/g, (_, n) => rootStyle.getPropertyValue(n).trim());
      return await Promise.all([...document.querySelectorAll(selector)].map(async (svg) => {
        const c = svg.cloneNode(true);
        // Los SVG descargados deben abrir sin depender del servidor de Bursa.
        for (const img of c.querySelectorAll('image')) {
          const source = img.getAttribute('href');
          if (!source || source.startsWith('data:')) continue;
          const response = await fetch(source);
          if (!response.ok) throw new Error(`No se pudo incrustar ${source}`);
          const blob = await response.blob();
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          img.setAttribute('href', dataUrl);
        }
        for (const a of ['class', 'style', 'aria-hidden', 'focusable', 'width', 'height', `data-${attr}`]) c.removeAttribute(a);
        c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        c.setAttribute('width', String(w));
        c.setAttribute('height', String(h));
        const inner = resolve(c.innerHTML);
        const html = c.outerHTML;
        const open = html.slice(0, html.indexOf('>') + 1);
        const vb = c.viewBox.baseVal;
        const bg = fondo ? `<rect width="${vb.width}" height="${vb.height}" fill="${resolve(fondo)}"/>` : '';
        return { name: svg.dataset[attr], conFondo: `${open}${bg}${inner}</svg>`, sinFondo: `${open}${inner}</svg>` };
      }));
    },
    { selector, attr, fondo, w, h },
  );
  for (const it of items) {
    fs.writeFileSync(path.join(out, folder, `${it.name}.svg`), it.sinFondo);
    if (fondo) fs.writeFileSync(path.join(out, folder, `${it.name}-con-fondo.svg`), it.conFondo);
  }
  return items.map((i) => i.name);
}

// ─── Estampas ───
{
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 1000 }, deviceScaleFactor: 4 });
  const p = await ctx.newPage();
  await p.goto(`${SB}illus-estampa--todas`, { waitUntil: 'load' });
  await p.waitForSelector('svg.estampa', { timeout: 30000 });
  await p.waitForTimeout(800);
  const names = await exportSvgs(p, 'svg.estampa', 'escena', 'Estampas', { fondo: 'var(--surface-raised)', w: 960, h: 720 });
  for (let i = 0; i < names.length; i++) {
    const el = p.locator('svg.estampa').nth(i);
    await el.screenshot({ path: path.join(out, 'Estampas', `${names[i]}.png`) });
    // sin fondo: se quita el papel y el redondeo del contenedor
    await el.evaluate((n) => {
      n.style.background = 'transparent';
      n.style.borderRadius = '0';
    });
    await el.screenshot({ path: path.join(out, 'Estampas', `${names[i]}-sin-fondo.png`), omitBackground: true });
  }
  console.log(`Estampas: ${names.length}`);
  await ctx.close();
}

// ─── Objetos ───
{
  const ctx = await browser.newContext({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 5 });
  const p = await ctx.newPage();
  await p.goto(`${SB}illus-objetos--todos`, { waitUntil: 'load' });
  await p.waitForSelector('svg.objeto', { timeout: 30000 });
  await p.waitForTimeout(800);
  const names = await exportSvgs(p, 'svg.objeto', 'objeto', 'Objetos', { fondo: null, w: 480, h: 480 });
  for (let i = 0; i < names.length; i++) {
    await p.locator('svg.objeto').nth(i).screenshot({ path: path.join(out, 'Objetos', `${names[i]}.png`), omitBackground: true });
  }
  console.log(`Objetos: ${names.length}`);
  await ctx.close();
}

// ─── Monedita (recorte) y vista previa para compartir ───
fs.copyFileSync(path.join(root, 'public', 'monedita', 'monedita.webp'), path.join(out, 'Personajes', 'monedita.webp'));
{
  const p = await (await browser.newContext({ viewport: { width: 700, height: 700 } })).newPage();
  await p.goto(`${APP}/monedita/monedita.webp`, { waitUntil: 'load' });
  const png = await p.evaluate(async () => {
    const img = document.querySelector('img');
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/png').split(',')[1];
  });
  fs.writeFileSync(path.join(out, 'Personajes', 'monedita.png'), Buffer.from(png, 'base64'));
}
fs.copyFileSync(path.join(root, 'public', 'og.png'), path.join(out, 'Compartir', 'vista-previa-al-compartir.png'));

// ─── Grabaciones de las animaciones (a velocidad real) ───
async function grabar(nombre, viewport, gesto, url = APP) {
  const dir = path.join(out, 'Grabaciones', `_tmp-${nombre}`);
  const ctx = await browser.newContext({ viewport, recordVideo: { dir, size: viewport } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await gesto(p);
  const video = p.video();
  await ctx.close();
  fs.renameSync(await video.path(), path.join(out, 'Grabaciones', `${nombre}.webm`));
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`Grabación: ${nombre}`);
}

await grabar('heroe-tarjetas-flotan-y-se-abren', { width: 1280, height: 800 }, async (p) => {
  await p.waitForTimeout(4500);
  await p.locator('.lp-col--right .lp-card').first().click({ force: true });
  await p.waitForTimeout(2200);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1200);
});

await grabar('aprendes-haciendo-escenas-con-scroll', { width: 1280, height: 800 }, async (p) => {
  const g = await p.evaluate(() => {
    const s = document.querySelector('#como-funciona');
    return { top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight };
  });
  const travel = g.h - 800;
  await p.evaluate((y) => scrollTo(0, y), g.top);
  await p.waitForTimeout(1200);
  for (const f of [0.15, 0.5, 0.9]) {
    await p.evaluate((y) => scrollTo({ top: y, behavior: 'smooth' }), g.top + travel * f);
    await p.waitForTimeout(2200);
  }
});

await grabar(
  'camino-grafica-de-mercado',
  { width: 1280, height: 800 },
  async (p) => {
    await p.evaluate(() => {
      const d = new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      localStorage.setItem(
        'bursa:progress:v1:modulo-1',
        JSON.stringify({ moduleId: 'modulo-1', completedLessons: [1, 2, 3], lastVisitedLesson: 3, streakDays: 3, lastActiveDate: key, userName: '', namePrompted: true, reviewedConcepts: [] }),
      );
    });
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(600);
    await p.locator('[aria-label^="Camino del módulo"]').scrollIntoViewIfNeeded();
    await p.waitForTimeout(5000);
  },
  `${APP}/modulo/1`,
);

await browser.close();
console.log('Listo →', out);
