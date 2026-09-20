#!/usr/bin/env node
// ============================================================
// capture.mjs — Plan B de verificación visual para Bursa
//
// Sustituye al navegador de Antigravity cuando no está disponible.
// Usa el Playwright que ya está instalado en el proyecto.
//
// Graba la MISMA página en tres perfiles y entrega los artefactos
// que pide docs/ANTIGRAVITY-WORKPLAN.md §5:
//
//   desktop         1280×800, movimiento normal
//   reduced-motion  1280×800, prefers-reduced-motion: reduce
//   mobile-390      390×844, móvil con touch
//
// Uso:
//   npm run capture -- --url <url> --name <tarea> [opciones]
//
// Opciones:
//   --url       (obligatoria) página a grabar. Requiere el servidor vivo:
//               npm run dev → http://localhost:3000
//               npm run storybook → http://localhost:6006/iframe.html?id=<story>&viewMode=story
//   --name      (obligatoria) nombre de la tarea, ej. tarea-e. Salida: artifacts/<name>/
//   --wait      ms que se graba si no hay --script. Por defecto 6000
//   --script    módulo .mjs que exporta `async function run(page, ctx)` con el gesto a grabar
//               (hover, clic, arrastre). ctx = { profile, reducedMotion }
//   --profiles  subconjunto separado por comas. Por defecto los tres
//   --out       carpeta de salida. Por defecto artifacts/<name>
//
// Los videos se graban a velocidad real (no se aceleran).
// Sale con código 1 si hay una excepción no capturada, si el emulador de
// reduced-motion no quedó activo, o si hay scroll horizontal a 390 px.
// ============================================================

import { chromium } from 'playwright';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PROFILES = [
  {
    id: 'desktop',
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'no-preference',
  },
  {
    id: 'reduced-motion',
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
  },
  {
    id: 'mobile-390',
    viewport: { width: 390, height: 844 },
    reducedMotion: 'no-preference',
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  },
];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function fail(message, code = 2) {
  console.error(`\ncapture: ${message}\n`);
  process.exit(code);
}

const args = parseArgs(process.argv.slice(2));

if (typeof args.url !== 'string' || typeof args.name !== 'string') {
  fail('faltan --url y --name. Ver el encabezado de scripts/capture.mjs.');
}
if (!/^[a-z0-9][a-z0-9_-]*$/i.test(args.name)) {
  fail('--name solo admite letras, números, guion y guion bajo.');
}

const waitMs = args.wait === undefined ? 6000 : Number(args.wait);
if (!Number.isFinite(waitMs) || waitMs < 0) fail('--wait debe ser un número de ms.');

const wanted = typeof args.profiles === 'string' ? args.profiles.split(',') : PROFILES.map((p) => p.id);
const profiles = PROFILES.filter((p) => wanted.includes(p.id));
if (profiles.length === 0) {
  fail(`--profiles no coincide con ninguno de: ${PROFILES.map((p) => p.id).join(', ')}`);
}

const outDir = path.resolve(typeof args.out === 'string' ? args.out : path.join('artifacts', args.name));
const tmpDir = path.join(outDir, '.tmp-video');

// El servidor tiene que estar vivo: que cada agente levante el suyo
// es la vía rápida a cinco puertos en conflicto.
if (/^https?:/i.test(args.url)) {
  try {
    await fetch(args.url, { signal: AbortSignal.timeout(5000) });
  } catch {
    fail(
      `no responde ${args.url}\n` +
        '¿Está corriendo el servidor? (npm run dev → :3000, npm run storybook → :6006)\n' +
        'No levantes uno propio: usa el que ya está corriendo.'
    );
  }
}

let userScript = null;
if (typeof args.script === 'string') {
  const mod = await import(pathToFileURL(path.resolve(args.script)).href);
  if (typeof mod.run !== 'function') fail('--script debe exportar `async function run(page, ctx)`.');
  userScript = mod;
}

await rm(outDir, { recursive: true, force: true });
await mkdir(tmpDir, { recursive: true });

const browser = await chromium.launch();
const results = [];
const failures = [];

for (const profile of profiles) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    reducedMotion: profile.reducedMotion,
    isMobile: profile.isMobile ?? false,
    hasTouch: profile.hasTouch ?? false,
    deviceScaleFactor: profile.deviceScaleFactor ?? 1,
    recordVideo: { dir: tmpDir, size: profile.viewport },
  });
  const page = await context.newPage();

  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e)));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  await page.goto(args.url, { waitUntil: 'load' });

  if (userScript) {
    await userScript.run(page, { profile: profile.id, reducedMotion: profile.reducedMotion === 'reduce' });
    await page.waitForTimeout(500); // que el último cuadro quede en reposo
  } else {
    await page.waitForTimeout(waitMs);
  }

  const facts = await page.evaluate(() => ({
    reducedMotionMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  // Se compara contra el ancho nominal del perfil, NO contra window.innerWidth:
  // en emulación móvil Chrome ensancha el viewport para que quepa el contenido,
  // y entonces innerWidth crece con él y el desborde nunca se detecta.
  const overflowX = facts.scrollWidth > profile.viewport.width + 1;

  const base = path.join(outDir, profile.id);
  await page.screenshot({ path: `${base}.png` });

  const video = page.video();
  await context.close(); // el video se finaliza al cerrar el contexto
  await video.saveAs(`${base}.webm`);

  const wantsReduced = profile.reducedMotion === 'reduce';
  const problems = [];
  if (pageErrors.length > 0) problems.push(`excepciones no capturadas: ${pageErrors.length}`);
  if (wantsReduced && !facts.reducedMotionMatches) problems.push('reduced-motion NO quedó emulado');
  if (profile.id === 'mobile-390' && overflowX) {
    problems.push(`scroll horizontal a 390 px (contenido de ${facts.scrollWidth} px)`);
  }

  results.push({
    profile: profile.id,
    viewport: profile.viewport,
    reducedMotionEmulated: facts.reducedMotionMatches,
    overflowX,
    pageErrors,
    consoleErrors,
    files: [`${profile.id}.webm`, `${profile.id}.png`],
    problems,
  });
  for (const p of problems) failures.push(`[${profile.id}] ${p}`);
}

await browser.close();
await rm(tmpDir, { recursive: true, force: true });

const summary = {
  url: args.url,
  name: args.name,
  capturedAt: new Date().toISOString(),
  script: typeof args.script === 'string' ? args.script : null,
  ok: failures.length === 0,
  failures,
  results,
};
await writeFile(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');

console.log(`\ncapture: ${args.name} → ${path.relative(process.cwd(), outDir) || '.'}`);
for (const r of results) {
  const flag = r.problems.length === 0 ? 'ok ' : 'FALLA';
  console.log(`  ${flag}  ${r.profile.padEnd(15)} ${r.files.join('  ')}`);
  for (const p of r.problems) console.log(`         · ${p}`);
  if (r.consoleErrors.length > 0) console.log(`         · aviso: ${r.consoleErrors.length} console.error`);
}
console.log('');
process.exit(summary.ok ? 0 : 1);
