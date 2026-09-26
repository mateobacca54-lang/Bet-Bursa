// ============================================================
// crecimiento.ts — lógica pura de los dos capítulos de scroll de la landing:
// "Tu plata se encoge" (inflación) y "Mira crecer tu plata" (ahorro vs. CDT).
// Sin DOM: se prueba en vitest (crecimiento.test.ts). Los componentes solo leen
// estos números y los escriben en pantalla; ninguna cuenta se hace a mano en JSX.
// ============================================================

/**
 * Poder de compra de `monto` de hoy, dentro de `anios`, si la inflación anual se
 * queda fija en `inflacionAnual` (decimal, ej. 0,0624 = 6,24 %). Es la fórmula del
 * valor presente: cuanto más tiempo pasa, menos alcanza la misma plata.
 */
export function poderDeCompra(monto: number, inflacionAnual: number, anios: number): number {
  return monto / Math.pow(1 + inflacionAnual, anios);
}

/**
 * Factor de `scale` (CSS/GSAP) para que el ÁREA de una imagen sea proporcional a
 * `valor` frente a `valorBase` — no su alto ni su ancho. Sin esto, una imagen que
 * vale la mitad parecería que solo encogió un 30 %: el ojo compara área, no lado
 * (de ahí la raíz cuadrada). `valor` negativo se recorta a 0 (un área no es negativa);
 * `valorBase` no positivo no tiene proporción posible y devuelve 1 (sin cambio).
 */
export function escalaPorArea(valor: number, valorBase: number): number {
  if (!(valorBase > 0)) return 1;
  const ratio = Math.max(0, valor) / valorBase;
  return Math.sqrt(ratio);
}

/** Total guardado si apartas `depositoMensual` cada mes durante `meses`, sin que gane nada extra. */
export function ahorroAcumulado(depositoMensual: number, meses: number): number {
  return depositoMensual * meses;
}

/**
 * Tasa mensual equivalente a una tasa efectiva anual `tasaEfectivaAnual` (decimal,
 * ej. 0,1026 = 10,26 % EA). Es la que de verdad compone mes a mes; la EA es solo la
 * forma en que un CDT anuncia su tasa.
 */
export function tasaMensualDesdeEA(tasaEfectivaAnual: number): number {
  return Math.pow(1 + tasaEfectivaAnual, 1 / 12) - 1;
}

/**
 * Valor futuro de depositar `depositoMensual` al final de cada uno de `meses` meses,
 * a una tasa mensual `tasaMensual` (decimal) que se reinvierte: cada mes gana interés
 * también sobre los intereses de los meses anteriores (interés compuesto). Con tasa 0
 * no hay nada que componer: es la misma suma que `ahorroAcumulado`.
 */
export function valorFuturoMensual(depositoMensual: number, tasaMensual: number, meses: number): number {
  if (meses <= 0) return 0;
  if (tasaMensual === 0) return depositoMensual * meses;
  return (depositoMensual * (Math.pow(1 + tasaMensual, meses) - 1)) / tasaMensual;
}

/**
 * Los montos mensuales entre los que se puede elegir en "Mira crecer tu plata"
 * (las tres píldoras). Orden = orden en pantalla, de menos a más.
 */
export const MONTOS_MENSUALES: readonly number[] = [50_000, 100_000, 200_000];

/** Monto mensual con el que arranca el capítulo, antes de que el usuario elija otro. */
export const MONTO_MENSUAL_DEFECTO = 100_000;

/** Un punto (x, y) de la gráfica de "Mira crecer tu plata", en unidades del viewBox. */
export interface PuntoGrafica {
  x: number;
  y: number;
}

/**
 * Un punto por mes (0 a `mesesTotal`) de las dos líneas de la gráfica — lo guardado sin
 * interés y lo mismo en un CDT — dentro de un viewBox de `ancho` x `alto` con `padding`
 * de aire en los cuatro lados. Las dos líneas comparten el mismo eje vertical (el máximo
 * de las dos series al final del plazo), así se pueden comparar en el mismo dibujo.
 */
export function construirPuntosGrafica(
  depositoMensual: number,
  tasaMensual: number,
  mesesTotal: number,
  ancho: number,
  alto: number,
  padding: number
): { ahorro: PuntoGrafica[]; cdt: PuntoGrafica[] } {
  const max = Math.max(
    ahorroAcumulado(depositoMensual, mesesTotal),
    valorFuturoMensual(depositoMensual, tasaMensual, mesesTotal),
    1
  );
  const anchoUtil = ancho - padding * 2;
  const altoUtil = alto - padding * 2;
  const ahorro: PuntoGrafica[] = [];
  const cdt: PuntoGrafica[] = [];
  for (let m = 0; m <= mesesTotal; m++) {
    const x = padding + (m / mesesTotal) * anchoUtil;
    ahorro.push({ x, y: padding + altoUtil - (ahorroAcumulado(depositoMensual, m) / max) * altoUtil });
    cdt.push({ x, y: padding + altoUtil - (valorFuturoMensual(depositoMensual, tasaMensual, m) / max) * altoUtil });
  }
  return { ahorro, cdt };
}

/**
 * El punto de una serie de `construirPuntosGrafica` en el mes `m` (puede ser
 * fraccionario), interpolado entre los dos meses enteros más cercanos — así la punta de
 * la línea se mueve suave con el scroll en vez de saltar mes a mes.
 */
export function puntoEnGrafica(puntos: PuntoGrafica[], m: number): PuntoGrafica {
  const i = Math.min(puntos.length - 2, Math.max(0, Math.floor(m)));
  const t = Math.min(1, Math.max(0, m - i));
  return {
    x: puntos[i].x + (puntos[i + 1].x - puntos[i].x) * t,
    y: puntos[i].y + (puntos[i + 1].y - puntos[i].y) * t,
  };
}

/** El atributo `d` de un `<path>` de SVG que une `puntos` con segmentos rectos. */
export function trazoSvg(puntos: PuntoGrafica[]): string {
  return puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
}

/** El frasco tiene 4 estampas: de la primera moneda a la planta ya crecida. */
export const ETAPAS_FRASCO = 4;

/**
 * Posición continua del frasco entre sus 4 estampas — 1 al empezar, 4 al llegar a
 * `mesesTotal` — según cuántos `meses` ya pasaron. Entrada de `opacidadesFrasco`;
 * fuera de [0, mesesTotal] se recorta a los extremos.
 */
export function etapaFrasco(meses: number, mesesTotal: number): number {
  if (!(mesesTotal > 0)) return 1;
  const progreso = Math.min(1, Math.max(0, meses / mesesTotal));
  return 1 + progreso * (ETAPAS_FRASCO - 1);
}

/**
 * Opacidad de cada una de las 4 estampas del frasco para `meses` (de `mesesTotal`),
 * pensada para poner las 4 imágenes apiladas y fundir una en la otra (crossfade) en
 * vez de saltar entre ellas. Como mucho dos estampas consecutivas están visibles a la
 * vez; la primera llega sola a 1 en el mes 0 y la última, sola, en `mesesTotal`.
 */
export function opacidadesFrasco(meses: number, mesesTotal: number): [number, number, number, number] {
  const etapa = etapaFrasco(meses, mesesTotal);
  const opacidades: number[] = [];
  for (let i = 1; i <= ETAPAS_FRASCO; i++) {
    opacidades.push(Math.max(0, 1 - Math.abs(etapa - i)));
  }
  return opacidades as [number, number, number, number];
}
