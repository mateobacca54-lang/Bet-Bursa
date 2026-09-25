// ============================================================
// medir-solapes.mjs — comprueba que NINGÚN elemento tape contenido.
//
//   node scripts/medir-solapes.mjs            (necesita la app en :3100)
//   node scripts/medir-solapes.mjs --rapido   (solo el camino, menos anchos)
//
// Recorre cada pantalla en varios anchos Y EN CADA ESTADO DE PROGRESO, porque varios
// adornos solo se colocan según cuántas lecciones lleves: medir con el camino vacío
// daba 0 choques mientras la etiqueta tapaba el 60 % del cartel (ver 07-PLAN.md, ola 1).
//
// Un solape cuenta si una capa posicionada se pinta encima de un texto o de una
// ilustración y le cubre más de UMBRAL. El orden de pintado se calcula con z-index +
// orden en el DOM, NO con elementFromPoint: las capas con pointer-events:none —como el
// cartel— nunca salen por ahí.
//
// Sale con código 1 si encuentra algo, para poder usarlo como prueba.
// ============================================================

import { chromium } from 'playwright';

const RAPIDO = process.argv.includes('--rapido');
const APP = process.env.BURSA_URL ?? 'http://localhost:3100';

/** Cuánto puede cubrirse antes de considerarlo un defecto */
const UMBRAL = 0.05;

/**
 * Solapes aceptados a propósito, con su motivo. Cualquier otro es un defecto.
 * Formato: [capa, víctima, motivo]
 */
const PERMITIDOS = [
  [
    'img',
    'svg.estampa',
    'Monedita asoma por la esquina del cartel a propósito: es su tarjeta y el protagonista ' +
      'del dibujo va centrado, así que no oculta nada.',
  ],
  [
    'div.lp-phone',
    'img',
    'El celular va delante de la captura de escritorio: es una composición de dos ' +
      'dispositivos, como cualquier foto de producto, no un adorno encima de información. ' +
      'Las dos capturas llevan su propio texto alternativo.',
  ],
  [
    'img',
    'img',
    'Lo mismo, medido desde la imagen de dentro del celular en vez de desde su contenedor.',
  ],
];

const VIEWPORTS = RAPIDO
  ? [[390, 844], [1280, 800], [1920, 1080]]
  : [[390, 844], [430, 932], [768, 1024], [900, 800], [1024, 768], [1280, 800], [1440, 900], [1680, 1050], [1920, 1080]];

const PANTALLAS = RAPIDO
  ? [['camino', '/modulo/1', true]]
  : [
      ['landing', '/', false],
      ['inicio', '/inicio', false],
      ['camino', '/modulo/1', true],
      // 0: nada que repasar ni misión (secciones ausentes). 10: las dos secciones a la
      // vez (repaso + misión), el caso de más contenido posible en la pantalla.
      ['progreso-vacio', '/progreso', 0],
      ['progreso-completo', '/progreso', 10],
      // El número reemplaza a `false`/`true`: cuántas lecciones deben estar hechas para
      // que esta se pueda abrir (el camino bloquea las que van más adelante). No hace
      // falta barrer los 11 estados aquí: a diferencia del camino, una lección no
      // reubica sus adornos según cuánto llevas — un solo estado real basta.
      ['leccion-1', '/modulo/1/leccion/1', 0],
      ['leccion-2', '/modulo/1/leccion/2', 1],
      ['leccion-3', '/modulo/1/leccion/3', 2],
      ['leccion-4', '/modulo/1/leccion/4', 3],
      ['leccion-5', '/modulo/1/leccion/5', 4],
      ['leccion-6', '/modulo/1/leccion/6', 5],
      ['leccion-7', '/modulo/1/leccion/7', 6],
      ['leccion-8', '/modulo/1/leccion/8', 7],
      ['leccion-9', '/modulo/1/leccion/9', 8],
      ['leccion-10', '/modulo/1/leccion/10', 9],
    ];

const progresoDe = (n) => {
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
  });
};

/** Se ejecuta DENTRO del navegador. */
const detectar = (umbral) => {
  const todos = [...document.querySelectorAll('body *')];

  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.15) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2) return false;
    // offsetParent descarta lo oculto (display:none en un ancestro, position:fixed en
    // <html> antiguo) PERO el navegador SIEMPRE lo pone en null para position:fixed,
    // esté o no visible — por especificación, no es un indicio de nada. Sin este caso
    // aparte, cualquier elemento fijo (como el botón de ayuda) queda invisible para
    // este script y ningún solape con él se puede medir nunca.
    if (s.position === 'fixed') return true;
    return el.offsetParent !== null;
  };
  const textoPropio = (el) => {
    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent;
    return t.trim();
  };
  const nombrar = (el) => {
    const cn = typeof el.className === 'string' ? el.className : el.className?.baseVal ?? '';
    const cls = cn.trim() ? `.${cn.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls}`;
  };
  const zDe = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const v = parseInt(getComputedStyle(n).zIndex, 10);
      if (!Number.isNaN(v)) return v;
    }
    return 0;
  };
  // Orden de pintado: primero z-index; a igualdad, gana quien va después en el DOM.
  const sePintaEncima = (a, b) => {
    const za = zDe(a);
    const zb = zDe(b);
    if (za !== zb) return za > zb;
    return !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING);
  };
  // Un encabezado fijo tapando algo al desplazar es normal; sin desplazar, no.
  const esFijo = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const p = getComputedStyle(n).position;
      if (p === 'fixed' || p === 'sticky') return true;
    }
    return false;
  };

  // Lo que de verdad se ve: el rectángulo del elemento recortado por sus contenedores con
  // overflow. Sin esto se contaban como solapes cosas que el navegador ya recorta y no se
  // ven (la etiqueta del camino, que se sale de su contenedor y queda cortada).
  const rectVisible = (el) => {
    let r = el.getBoundingClientRect();
    let caja = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.overflow === 'visible' && s.overflowX === 'visible' && s.overflowY === 'visible') continue;
      if (s.position === 'fixed') break;
      const pr = n.getBoundingClientRect();
      caja = {
        left: Math.max(caja.left, pr.left),
        top: Math.max(caja.top, pr.top),
        right: Math.min(caja.right, pr.right),
        bottom: Math.min(caja.bottom, pr.bottom),
      };
      if (caja.right <= caja.left || caja.bottom <= caja.top) break;
    }
    return {
      left: caja.left,
      top: caja.top,
      right: caja.right,
      bottom: caja.bottom,
      width: Math.max(0, caja.right - caja.left),
      height: Math.max(0, caja.bottom - caja.top),
    };
  };

  const victimas = todos.filter(
    (el) => visible(el) && (textoPropio(el).length > 1 || el.matches('svg.estampa, svg.objeto, img, [data-escena], [data-objeto]'))
  );
  const capas = todos.filter((el) => ['absolute', 'fixed', 'sticky'].includes(getComputedStyle(el).position) && visible(el));

  const out = [];
  for (const a of capas) {
    const ra = rectVisible(a);
    if (ra.width < 2 || ra.height < 2) continue;
    for (const b of victimas) {
      if (a === b || a.contains(b) || b.contains(a)) continue;
      const rb = rectVisible(b);
      if (rb.width < 2 || rb.height < 2) continue;
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (w <= 1 || h <= 1) continue;
      const cubre = (w * h) / Math.max(1, rb.width * rb.height);
      if (cubre < umbral) continue;
      if (!sePintaEncima(a, b)) continue;
      out.push({
        capa: nombrar(a),
        victima: nombrar(b),
        capaTexto: textoPropio(a).slice(0, 40),
        victimaTexto: textoPropio(b).slice(0, 50) || b.getAttribute('data-escena') || b.getAttribute('alt')?.slice(0, 40) || '(ilustración)',
        cubre: Math.round(cubre * 100),
        fija: esFijo(a),
      });
    }
  }
  return out;
};

const permitido = (f) => PERMITIDOS.some(([capa, victima]) => f.capa === capa && f.victima === victima);

const browser = await chromium.launch();
const hallazgos = [];
let casos = 0;

for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  for (const [nombre, ruta, porProgreso] of PANTALLAS) {
    const page = await ctx.newPage();
    const estados =
      porProgreso === true ? Array.from({ length: 11 }, (_, i) => i) : typeof porProgreso === 'number' ? [porProgreso] : [null];
    try {
      await page.goto(APP + ruta, { waitUntil: 'load', timeout: 30000 });
      for (const n of estados) {
        if (n !== null) {
          await page.evaluate((v) => localStorage.setItem('bursa:progress:v1:modulo-1', v), progresoDe(n));
          await page.reload({ waitUntil: 'load' });
        }
        // La recarga puede restaurar el desplazamiento anterior: se vuelve arriba a propósito,
        // o se miden falsos positivos de contenido pasando por debajo del encabezado.
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(2600);
        casos++;
        for (const f of await page.evaluate(detectar, UMBRAL)) {
          hallazgos.push({ pantalla: nombre, vp: `${w}x${h}`, hechas: n, ...f });
        }
      }
    } catch (e) {
      console.log(`ERROR  ${nombre} ${w}x${h}: ${String(e).slice(0, 110)}`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();

const defectos = hallazgos.filter((f) => !permitido(f));
const tolerados = hallazgos.filter(permitido);

const agrupar = (lista) => {
  const m = new Map();
  for (const f of lista) {
    const k = `${f.pantalla} · ${f.capa} TAPA ${f.victima}`;
    if (!m.has(k)) m.set(k, { ...f, vps: new Set(), estados: new Set(), max: 0 });
    const g = m.get(k);
    g.vps.add(f.vp);
    if (f.hechas !== null) g.estados.add(f.hechas);
    g.max = Math.max(g.max, f.cubre);
  }
  return [...m].sort((a, b) => b[1].max - a[1].max);
};

console.log(`\n${casos} casos medidos (${VIEWPORTS.length} anchos × ${PANTALLAS.length} pantallas, el camino en 11 estados)\n`);

if (tolerados.length) {
  console.log('Tolerados a propósito:');
  for (const [k, g] of agrupar(tolerados)) console.log(`  ${g.max}%  ${k}`);
  for (const [, , motivo] of PERMITIDOS) console.log(`       ${motivo}`);
  console.log('');
}

if (!defectos.length) {
  console.log('✓ Nada tapa nada.');
  process.exit(0);
}

console.log(`✗ ${agrupar(defectos).length} SOLAPES:\n`);
for (const [k, g] of agrupar(defectos)) {
  console.log(`${String(g.max).padStart(3)}%  ${k}`);
  console.log(`      "${g.capaTexto || g.capa}"  encima de  "${g.victimaTexto}"`);
  console.log(`      anchos: ${[...g.vps].join(' ')}`);
  if (g.estados.size) console.log(`      lecciones hechas: ${[...g.estados].sort((a, b) => a - b).join(',')}`);
  console.log('');
}
process.exit(1);
