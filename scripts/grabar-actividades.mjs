// ============================================================
// grabar-actividades.mjs — graba los dos videos de "Así se aprende en Bursa."
// (rediseño de esa sección de la landing: dos celulares flotando con la
// pantalla real de una lección en bucle, en vez del carrusel de capturas).
//
// Uso:
//   npm run build && npm run start -- -p 3100     (en otra terminal, déjalo corriendo)
//   node scripts/grabar-actividades.mjs [--puerto 3100]
//
// Por qué producción (build+start) y no `next dev`: así no aparece el indicador
// de desarrollo de Next ("N") en la esquina, que se colaría en el video.
//
// Por qué capturas y no `context.recordVideo`: el `recordVideo` de Playwright
// graba al tamaño CSS del viewport (390×844) e IGNORA `deviceScaleFactor` — pedirle
// un `size` más grande solo estira el lienzo sin más nitidez (el celular queda
// en una esquina con relleno gris). `page.screenshot()` sí respeta
// `deviceScaleFactor`, así que este script arma el video a mano: una captura por
// paso del gesto (más un puñado durante la revelación del resultado) con la
// duración real que cada una estuvo en pantalla, unidas con el demuxer `concat`
// de ffmpeg. El resultado son los mismos 390×844 CSS a resolución real 780×1688.
//
// Qué hace, por cada actividad:
//   1. Abre la LECCIÓN REAL (no /dev/widgets) en un contexto limpio (localStorage
//      recién sembrado, nunca el del navegador de verdad) con el progreso justo
//      para que esa lección esté desbloqueada, y avanza los pasos previos
//      (Gancho → Concepto → Ejemplo) con clics. Esa parte no se captura: el
//      video empieza ya en "Ahora tú", con el widget encuadrado.
//   2. Un momento quieto, luego arrastra el control con mouse.move en pasos
//      pequeños y con espera entre cada uno (igual que
//      scripts/gestos/proportion-builder.mjs) — nunca con un salto ni acelerado.
//   3. Confirma, deja que la animación de la app (no tocada por este script)
//      revele el resultado muestreando varios cuadros, y sostiene el estado
//      final quieto ~1,5-3 s (bucle sin corte feo).
//
// Salida en public/landing/, por cada actividad <nombre>:
//   actividad-<nombre>.webm       VP9, sin audio
//   actividad-<nombre>.mp4        H.264, sin audio, +faststart
//   actividad-<nombre>-inicio.webp  primer cuadro
//   actividad-<nombre>-fin.webp     último cuadro (estado resuelto)
//
// Los `-inicio.webp`/`-fin.webp` no los usa ninguna página hoy (nadie los
// referencia como `poster` ni de ninguna otra forma): quedan por si hacen
// falta más adelante, pero no se les da uso sin revisar antes si de verdad
// se necesitan.
//
// Necesita ffmpeg en PATH. Playwright usa el Chromium ya instalado del
// proyecto — no corre `playwright install`.
// ============================================================

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = path.join(ROOT, 'public', 'landing');
const TMP_DIR = path.join(ROOT, '.tmp-grabaciones');

const puertoIdx = process.argv.indexOf('--puerto');
const PORT = puertoIdx !== -1 ? process.argv[puertoIdx + 1] : '3100';
const BASE = `http://localhost:${PORT}`;

const VIEWPORT = { width: 390, height: 844 };

fs.rmSync(TMP_DIR, { recursive: true, force: true });
fs.mkdirSync(TMP_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

/**
 * Siembra un progreso limpio en localStorage ANTES de que cargue la app (se pasa a
 * `page.addInitScript`, que la ejecuta dentro de la página): la lección pedida queda
 * desbloqueada, ninguna otra.
 */
function sembrarProgreso(completedLessons) {
  try {
    // Literal a propósito: esta función se serializa y corre dentro de la página
    // (page.addInitScript), así que no puede cerrar sobre constantes del script.
    window.localStorage.setItem(
      'bursa:progress:v1:modulo-1',
      JSON.stringify({
        moduleId: 'modulo-1',
        completedLessons,
        lastVisitedLesson: Math.max(...completedLessons, 1),
        streakDays: 1,
        lastActiveDate: null,
        userName: null,
        namePrompted: true,
        emailPrompted: true,
        reviewedConcepts: [],
        pruebaAprobada: false,
        misionHecha: false,
      }),
    );
  } catch {
    // Modo privado u origen bloqueado: la lección seguirá pidiendo desbloqueo,
    // pero no rompe la grabación.
  }
}

/** Abre la lección, siembra el progreso y avanza los 3 pasos previos a "Ahora tú". */
async function irAPractica(context, leccion, completedLessons) {
  const page = await context.newPage();
  await page.addInitScript(sembrarProgreso, completedLessons);
  await page.goto(`${BASE}/modulo/1/leccion/${leccion}`, { waitUntil: 'networkidle' });
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(250);
  return page;
}

/** Junta, en orden, las capturas (con su duración real en pantalla) para un video. */
class Grabadora {
  constructor(page, dir) {
    this.page = page;
    this.dir = dir;
    fs.mkdirSync(dir, { recursive: true });
    this.cuadros = []; // { archivo, duracionSeg }
  }

  /** Toma una captura ahora mismo y le asigna `duracionSeg` de permanencia en pantalla. */
  async cuadro(duracionSeg) {
    const archivo = path.join(this.dir, `f${String(this.cuadros.length).padStart(4, '0')}.png`);
    await this.page.screenshot({ path: archivo });
    this.cuadros.push({ archivo, duracionSeg });
  }

  /** Espera `esperaMs` reales y luego captura: usa esto para tramos quietos. */
  async pausaYcuadro(esperaMs) {
    await this.page.waitForTimeout(esperaMs);
    await this.cuadro(esperaMs / 1000);
  }

  /**
   * Arrastra con el mouse en pasos pequeños (uno por cuadro) y con espera real
   * entre cada uno — igual que scripts/gestos/proportion-builder.mjs. Nunca un
   * salto ni acelerado: cada cuadro dura lo mismo que se esperó para llegar a él.
   */
  async arrastrar(from, to, { pasos = 26, esperaPorPasoMs = 50 } = {}) {
    await this.page.mouse.move(from.x, from.y);
    await this.page.mouse.down();
    for (let i = 1; i <= pasos; i++) {
      const t = i / pasos;
      await this.page.mouse.move(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
      await this.pausaYcuadro(esperaPorPasoMs);
    }
    await this.page.mouse.up();
  }

  /** Muestrea `n` cuadros repartidos en `duracionMs` — para animaciones que dispara la app. */
  async muestrear(duracionMs, n) {
    const paso = duracionMs / n;
    for (let i = 0; i < n; i++) {
      await this.pausaYcuadro(paso);
    }
  }

  /** Escribe la lista para el demuxer `concat` de ffmpeg y la devuelve. */
  escribirLista() {
    const lista = path.join(this.dir, 'lista.txt');
    const lineas = this.cuadros.flatMap(({ archivo, duracionSeg }) => [
      `file '${archivo}'`,
      `duration ${duracionSeg.toFixed(3)}`,
    ]);
    // Quirk del demuxer concat: la duración del último elemento se ignora salvo
    // que el archivo se repita una vez más al final sin duración.
    lineas.push(`file '${this.cuadros[this.cuadros.length - 1].archivo}'`);
    fs.writeFileSync(lista, lineas.join('\n'));
    return lista;
  }
}

/**
 * actividad-almuerzo — Lección 2, ConsequenceSlider: arrastra el año de 2015 a 2025
 * y el precio del almuerzo sube hasta pasar de $15.000 (respuesta correcta).
 */
async function grabarAlmuerzo(browser) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await irAPractica(context, 2, [1]);
  const g = new Grabadora(page, path.join(TMP_DIR, 'almuerzo'));

  await g.pausaYcuadro(1500); // "se ve la pantalla un momento"

  const slider = page.getByRole('slider', { name: 'Año' });
  const box = await slider.boundingBox();
  const y = box.y + box.height / 2;
  await g.arrastrar({ x: box.x + 4, y }, { x: box.x + box.width - 4, y });

  await g.pausaYcuadro(500);
  await page.getByRole('button', { name: 'Verificar' }).click();
  await g.muestrear(1800, 20); // feedback + reacción de Monedita
  await g.pausaYcuadro(3000); // estado final quieto

  await context.close();
  return g;
}

/**
 * actividad-interes — Lección 3, AnimatedComparator: arrastra el punto de predicción
 * hacia arriba y se revela la curva del interés compuesto sobre la del simple.
 */
async function grabarInteres(browser) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await irAPractica(context, 3, [1, 2]);
  const g = new Grabadora(page, path.join(TMP_DIR, 'interes'));

  await g.pausaYcuadro(1500);

  const handle = page.getByRole('slider');
  const svg = page.locator('svg.bursa-comparator__chart');
  const hBox = await handle.boundingBox();
  const sBox = await svg.boundingBox();
  const escalaY = sBox.height / 320; // 320 = alto del viewBox del gráfico
  const desde = { x: hBox.x + hBox.width / 2, y: hBox.y + hBox.height / 2 };
  // Sube casi hasta el tope del gráfico (y=40 en unidades del viewBox): deja el
  // punto cerca de $250 mil, cerca del valor real del interés compuesto a 5 años.
  const hasta = { x: desde.x, y: sBox.y + 40 * escalaY };
  await g.arrastrar(desde, hasta);

  await g.pausaYcuadro(500);
  await page.getByRole('button', { name: 'Fijar mi predicción' }).click();
  await g.muestrear(3000, 30); // dibujo de la curva real (2.2 s) + monedas + feedback
  await g.pausaYcuadro(2500); // estado final quieto

  await context.close();
  return g;
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
}

function ffprobeDuration(file) {
  const out = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  return parseFloat(out.toString().trim());
}

/** Codifica la lista de cuadros de una grabadora a .webm y .mp4, y extrae los pósters. */
function producir(nombre, grabadora) {
  const lista = grabadora.escribirLista();
  const webm = path.join(OUT_DIR, `actividad-${nombre}.webm`);
  const mp4 = path.join(OUT_DIR, `actividad-${nombre}.mp4`);
  const inicio = path.join(OUT_DIR, `actividad-${nombre}-inicio.webp`);
  const fin = path.join(OUT_DIR, `actividad-${nombre}-fin.webp`);

  const entrada = ['-f', 'concat', '-safe', '0', '-i', lista];
  ffmpeg([...entrada, '-an', '-r', '30', '-vsync', 'cfr', '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-pix_fmt', 'yuv420p', '-deadline', 'good', '-cpu-used', '2', webm]);
  ffmpeg([...entrada, '-an', '-r', '30', '-vsync', 'cfr', '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);

  ffmpeg(['-i', mp4, '-frames:v', '1', '-c:v', 'libwebp', '-q:v', '82', inicio]);
  const duracion = ffprobeDuration(mp4);
  ffmpeg(['-sseof', String(-Math.min(0.15, duracion / 2)), '-i', mp4, '-frames:v', '1', '-c:v', 'libwebp', '-q:v', '82', fin]);

  const tamKB = (p) => (fs.statSync(p).size / 1024).toFixed(0);
  console.log(`\n${nombre}: ${duracion.toFixed(2)}s, ${grabadora.cuadros.length} cuadros`);
  console.log(`  ${webm}  ${tamKB(webm)} KB`);
  console.log(`  ${mp4}  ${tamKB(mp4)} KB`);
  console.log(`  ${inicio}  ${tamKB(inicio)} KB`);
  console.log(`  ${fin}  ${tamKB(fin)} KB`);
}

const browser = await chromium.launch();
try {
  console.log('Grabando actividad-almuerzo (Lección 2 · ConsequenceSlider)…');
  const almuerzo = await grabarAlmuerzo(browser);
  producir('almuerzo', almuerzo);

  console.log('\nGrabando actividad-interes (Lección 3 · AnimatedComparator)…');
  const interes = await grabarInteres(browser);
  producir('interes', interes);
} finally {
  await browser.close();
}

fs.rmSync(TMP_DIR, { recursive: true, force: true });
console.log('\nListo.');
