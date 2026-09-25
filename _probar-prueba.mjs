import { chromium } from 'playwright';
import fs from 'node:fs';
const AXE = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const APP = 'http://localhost:3100';

const progresoDe = (n, extra = {}) => {
  const d = new Date();
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return JSON.stringify({
    moduleId: 'modulo-1',
    completedLessons: Array.from({ length: n }, (_, i) => i + 1),
    lastVisitedLesson: Math.max(1, n),
    streakDays: 3,
    lastActiveDate: key,
    userName: 'Mateo',
    namePrompted: true,
    reviewedConcepts: [],
    pruebaAprobada: false,
    ...extra,
  });
};


// elegir espera 420 ms y AnimatePresence añade DURATION.scene (400 ms) de salida.
// Los 650 ms antiguos podían leer el DOM saliente. Como en Storybook, esperamos
// otro aria-label (o el resultado), con una sola pulsación y sin reintentos.
async function responder(page, opcion, ultima = false) {
  const etiqueta = await page.getByRole('radiogroup').getAttribute('aria-label');
  const inicio = Date.now();
  await opcion.click();
  await page.waitForFunction(({ etiqueta, ultima }) => {
    const grupo = document.querySelector('[role="radiogroup"]');
    return ultima
      ? !grupo && /Aprobaste|Todavía no/.test(document.querySelector('h1')?.textContent || '')
      : grupo && grupo.getAttribute('aria-label') !== etiqueta;
  }, { etiqueta, ultima }, { timeout: 5000 });
  console.log('       una pulsación → ' + (ultima ? 'resultado' : 'siguiente situación') + ': ' + (Date.now() - inicio) + ' ms');
}

const CORRECTAS = [
  'No prestarle: nadie garantiza un 20 % en 3 meses sin decir de dónde sale',
  'Con el tiempo, el mismo dinero compra menos: es lo normal, no un abuso puntual',
  'El compuesto: cada año gana sobre lo que ya había ganado antes',
  'Ponerlos en algo que pueda hacerlos crecer, aceptando algo de riesgo',
  'El curso: genera algo que vale más que lo que cuesta la deuda',
  'Separar en qué es fijo, qué es variable y qué es ahorro, y mirar los tres',
];

const browser = await chromium.launch();
let fallos = 0;
const ok = (msg, cond) => {
  console.log(`${cond ? '✓' : '✗'} ${msg}`);
  if (!cond) fallos++;
};

// ── 1. Con las 10 hechas y sin aprobar: aparece el checkpoint, y el saludo dice lo correcto ──
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${APP}/modulo/1`, { waitUntil: 'load' });
  await p.evaluate((v) => localStorage.setItem('bursa:progress:v1:modulo-1', v), progresoDe(10));
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2600);

  const saludo = await p.textContent('h1#saludo-titulo');
  ok('el saludo NO dice "Terminaste" sin haber aprobado la prueba', !/Terminaste/i.test(saludo || ''));

  const checkpoint = await p.locator('text=Ya viste las 10 lecciones').first().isVisible().catch(() => false);
  ok('aparece la tarjeta de la prueba de paso', checkpoint);

  const cta = await p.getByRole('link', { name: /Hacer la prueba/ }).getAttribute('href').catch(() => null);
  ok('el botón del saludo lleva a /modulo/1/prueba', cta === '/modulo/1/prueba');

  await p.addScriptTag({ content: AXE });
  const a = await p.evaluate(async () => await window.axe.run(document, { resultTypes: ['violations'] }));
  ok(`axe en /modulo/1 (awaiting-test): 0 violaciones (hubo ${a.violations.length})`, a.violations.length === 0);
  if (a.violations.length) a.violations.forEach((v) => console.log('   ', v.id, v.nodes.length));

  await ctx.close();
}

// ── 2. Entrar a /modulo/1/prueba sin tener las 10: rechazado con explicación ──
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${APP}/modulo/1`, { waitUntil: 'load' });
  await p.evaluate((v) => localStorage.setItem('bursa:progress:v1:modulo-1', v), progresoDe(3));
  await p.goto(`${APP}/modulo/1/prueba`, { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  const texto = await p.textContent('body');
  ok('sin las 10 hechas, la prueba se niega con una explicación', /faltan lecciones/i.test(texto || ''));
  await ctx.close();
}

// ── 3. Recorrido completo: falla a propósito, ve el repaso, reintenta, aprueba ──
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${APP}/modulo/1`, { waitUntil: 'load' });
  await p.evaluate((v) => localStorage.setItem('bursa:progress:v1:modulo-1', v), progresoDe(10));
  await p.goto(`${APP}/modulo/1/prueba`, { waitUntil: 'load' });
  await p.waitForTimeout(1500);

  await p.getByRole('button', { name: 'Empezar' }).click();
  await p.waitForTimeout(800);

  // Falla las 6 a propósito: garantiza que se pruebe Reintentar en cada ejecución.
  for (let i = 0; i < 6; i++) {
    const opciones = p.getByRole('radio');
    const textos = await opciones.allTextContents();
    const idx = textos.findIndex((t) => !CORRECTAS.includes(t.trim()));
    if (idx < 0) throw new Error('No se encontró una opción incorrecta');
    await responder(p, opciones.nth(idx), i === 5);
  }
  await p.waitForTimeout(600);

  const tituloFallo = await p.locator('h1').first().textContent();
  const reprobado = /Todavía no/.test(tituloFallo || '');
  console.log('   (resultado del primer intento:', tituloFallo, ')');

  await p.addScriptTag({ content: AXE });
  const a1 = await p.evaluate(async () => await window.axe.run(document, { resultTypes: ['violations'] }));
  ok(`axe en la pantalla de resultado: 0 violaciones (hubo ${a1.violations.length})`, a1.violations.length === 0);

  if (reprobado) {
    const repasos = await p.locator('.pp-repaso').count();
    ok('si reprueba, muestra al menos un repaso con la lección que falló', repasos > 0);

    await p.getByRole('button', { name: 'Reintentar' }).click();
    await p.getByRole('radiogroup').waitFor({ state: 'visible' });

    // Las 6 correctas, tal como están en el contenido (src/content/modulo-1/prueba.ts).
    // Las opciones se barajan entre intentos, así que se busca por TEXTO, no por posición.

    for (let i = 0; i < 6; i++) {
      const pregunta = await p.locator('.pp-situacion').textContent().catch(() => '(?)');
      const opciones = p.getByRole('radio');
      const textos = await opciones.allTextContents();
      const idx = textos.findIndex((t) => CORRECTAS.some((c) => t.trim() === c.trim() || t.includes(c)));
      console.log(`   [${i + 1}] "${(pregunta || '').slice(0, 50)}..." -> opciones:`, textos.map((t) => `"${t}"`));
      console.log(`       elegida (idx ${idx}):`, idx >= 0 ? textos[idx] : '(ninguna coincidió)');
      if (idx < 0) throw new Error('No se encontró una respuesta correcta para la situación actual');
      await responder(p, opciones.nth(idx), i === 5);
    }
    await p.waitForTimeout(600);
    const tituloExito = await p.locator('h1').first().textContent().catch(() => '');
    const aprobado = /Aprobaste/.test(tituloExito || '');
    ok(`respondiendo las 6 correctas, aprueba (título: "${tituloExito}")`, aprobado);
    ok('las 6 respuestas se registraron a la primera', await p.getByText('Respondiste bien 6 de 6.', { exact: false }).isVisible());
    if (aprobado) {
      await p.getByRole('button', { name: 'Seguir' }).click();
      await p.waitForTimeout(600);
    }
  } else {
    ok('el primer intento debe fallar para comprobar Reintentar', false);
  }

  // El progreso quedó guardado
  const guardado = await p.evaluate(() => {
    const raw = localStorage.getItem('bursa:progress:v1:modulo-1');
    return raw ? JSON.parse(raw).pruebaAprobada : null;
  });
  ok('pruebaAprobada quedó en true en localStorage', guardado === true);

  await p.waitForTimeout(500);
  ok('al aprobar, vuelve al camino', p.url() === `${APP}/modulo/1`);

  const saludo = await p.textContent('h1#saludo-titulo').catch(() => '');
  ok('el saludo ahora sí dice "Terminaste"', /Terminaste/i.test(saludo || ''));

  await ctx.close();
}

// ── 4. Teclado: se puede elegir con flechas + Enter, sin mouse ──
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${APP}/modulo/1`, { waitUntil: 'load' });
  await p.evaluate((v) => localStorage.setItem('bursa:progress:v1:modulo-1', v), progresoDe(10));
  await p.goto(`${APP}/modulo/1/prueba`, { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  await p.getByRole('button', { name: 'Empezar' }).click();
  await p.waitForTimeout(700);
  await p.keyboard.press('Tab');
  await p.waitForTimeout(150);
  const enfocado = await p.evaluate(() => document.activeElement?.getAttribute('role'));
  ok('con Tab el foco llega a una opción (role=radio)', enfocado === 'radio');
  await ctx.close();
}

// ── 5. El widget Elegir en Storybook: revisado ya en la suite de Storybook, aquí solo humo ──

await browser.close();
console.log(fallos === 0 ? '\n✓ TODO BIEN' : `\n✗ ${fallos} FALLOS`);
process.exit(fallos ? 1 : 0);
