import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const URL = 'http://localhost:3100/';
const OUT = 'C:/Users/ASUS/AppData/Local/Temp/claude/C--Users-ASUS-OneDrive-Desktop-Bursa/e46463c7-8cd3-4d8e-bf3c-56c5b05ba6c8/scratchpad/agente-b';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log('  ->', name);
}

async function leerContador(page) {
  return page.evaluate(() => {
    const cajas = [...document.querySelectorAll('.llp-contador')];
    for (const caja of cajas) {
      const r = caja.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        return caja.querySelector('.llp-contador-cifra')?.textContent ?? null;
      }
    }
    return null;
  });
}

async function perfil({ id, viewport, reducedMotion }) {
  console.log(`\n=== ${id} ===`);
  const context = await browser.newContext({ viewport, reducedMotion });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e?.message ?? e)));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  await page.locator('#lee-la-letra').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, `v2-${id}-paso-1`);

  await page.getByRole('button', { name: 'Siguiente' }).first().click();
  await page.waitForTimeout(900);
  await shot(page, `v2-${id}-paso-2`);

  await page.getByRole('button', { name: 'Siguiente' }).first().click();
  await page.waitForTimeout(2000); // que la animación del contador termine
  await shot(page, `v2-${id}-paso-3`);

  const cifraTrasLlegar = await leerContador(page);

  // Subir un poco y comprobar que la cifra no retrocede.
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(300);
  const cifraTrasSubir = await leerContador(page);

  const facts = await page.evaluate(() => ({
    reducedMotionMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  const overflowX = facts.scrollWidth > viewport.width + 1;
  console.log('  cifra tras llegar:', cifraTrasLlegar, '| tras subir 300px:', cifraTrasSubir);
  console.log('  reducedMotionMatches:', facts.reducedMotionMatches, '| overflowX:', overflowX);
  if (pageErrors.length) console.log('  !! errores:', pageErrors);

  await context.close();
  return { id, cifraTrasLlegar, cifraTrasSubir, overflowX, pageErrors, reducedMotionMatches: facts.reducedMotionMatches };
}

const resultados = [];
resultados.push(await perfil({ id: 'desktop-1440', viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' }));
resultados.push(await perfil({ id: 'mobile-390', viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' }));
resultados.push(await perfil({ id: 'desktop-1440-reduced', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }));

await browser.close();

console.log('\n=== resumen ===');
const ESPERADO = '$ 3.338.935';
let ok = true;
for (const r of resultados) {
  const bien = r.cifraTrasLlegar === ESPERADO && r.cifraTrasSubir === ESPERADO && !r.overflowX && r.pageErrors.length === 0;
  console.log(`${bien ? 'ok  ' : 'FALLA'} ${r.id}: llegar=${r.cifraTrasLlegar} subir=${r.cifraTrasSubir} overflow=${r.overflowX}`);
  if (!bien) ok = false;
}
process.exit(ok ? 0 : 1);
