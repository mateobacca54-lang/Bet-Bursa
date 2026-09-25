// ============================================================
// velas.ts — velas de mercado para el fondo del cierre (FondoVelas).
//
// Todo aquí es puro y determinista: la misma seed siempre da las mismas velas,
// para que el fondo no "salte" entre servidor y cliente ni entre recargas.
// Nada de Math.random() suelto — el generador es un PRNG con seed explícita.
// ============================================================

/** Un candelero: apertura, máximo, mínimo y cierre (OHLC). */
export interface Vela {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface GenerarVelasOptions {
  /** Cuántas velas generar (FondoVelas usa entre 40 y 60). */
  count: number;
  /** Semilla del PRNG: misma seed, misma serie. */
  seed: number;
  /** Valor de apertura de la primera vela. */
  startValue?: number;
  /** Máximo cambio proporcional por paso (0.04 = hasta ±4%). */
  volatility?: number;
}

/**
 * PRNG determinista (mulberry32): dada una seed entera, produce siempre la misma
 * secuencia de números en [0, 1). No es criptográfico — no hace falta, es solo para
 * que el fondo decorativo sea reproducible.
 */
export function crearGeneradorSeed(seed: number): () => number {
  let a = seed >>> 0;
  return function siguiente(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

/**
 * Genera `count` velas como una caminata aleatoria: cada cierre es el punto de
 * partida de la siguiente. Determinista por `seed` (misma seed, misma serie).
 */
export function generarVelas({ count, seed, startValue = 100, volatility = 0.04 }: GenerarVelasOptions): Vela[] {
  if (count <= 0) return [];
  const random = crearGeneradorSeed(seed);
  const velas: Vela[] = [];
  let apertura = Math.max(startValue, 0.01);

  for (let i = 0; i < count; i++) {
    const cambio = (random() * 2 - 1) * volatility;
    const cierre = Math.max(apertura * (1 + cambio), 0.01);
    // Las mechas asoman un poco más allá del cuerpo, cada una con su propio sorteo.
    const mechaArriba = random() * volatility * 0.6 * apertura;
    const mechaAbajo = random() * volatility * 0.6 * apertura;
    const high = Math.max(apertura, cierre) + mechaArriba;
    const low = Math.max(Math.min(apertura, cierre) - mechaAbajo, 0.01);
    velas.push({ open: apertura, high, low, close: cierre });
    apertura = cierre;
  }

  return velas;
}

/** El rectángulo (cuerpo) y la mecha de una vela, ya en coordenadas de pantalla. */
export interface VelaGeometria {
  /** Centro horizontal de la columna (para la mecha y para medir distancia al puntero). */
  centroX: number;
  /** Centro vertical del cuerpo (para medir distancia al puntero). */
  centroY: number;
  /** Borde izquierdo del cuerpo. */
  x: number;
  /** Ancho del cuerpo. */
  ancho: number;
  /** Borde superior del cuerpo (el menor entre open/close, en coordenadas de pantalla). */
  cuerpoY: number;
  /** Alto del cuerpo (nunca 0: una vela doji sigue siendo visible). */
  cuerpoAlto: number;
  /** Y del extremo superior de la mecha (el high). */
  mechaY1: number;
  /** Y del extremo inferior de la mecha (el low). */
  mechaY2: number;
  /** true si cerró arriba de donde abrió (vela "de subida"). */
  sube: boolean;
}

export interface GeometriaOptions {
  width: number;
  height: number;
  /** Fracción del ancho de columna que queda como separación entre velas. */
  gap?: number;
  /** Fracción de `height` que se deja como margen arriba y abajo al escalar. */
  paddingY?: number;
}

/**
 * Convierte una serie de velas en rectángulos y mechas listos para dibujar en un
 * lienzo de `width`×`height` (p. ej. un `viewBox` de SVG). Pura: no toca el DOM.
 */
export function calcularGeometriaVelas(velas: readonly Vela[], { width, height, gap = 0.35, paddingY = 0.08 }: GeometriaOptions): VelaGeometria[] {
  if (velas.length === 0 || width <= 0 || height <= 0) return [];

  const minimo = Math.min(...velas.map((v) => v.low));
  const maximo = Math.max(...velas.map((v) => v.high));
  const rango = Math.max(maximo - minimo, 1e-6);
  const altoUtil = height * (1 - paddingY * 2);
  const margenSuperior = height * paddingY;

  const escalarY = (valor: number): number => margenSuperior + altoUtil * (1 - (valor - minimo) / rango);

  const slot = width / velas.length;
  const anchoCuerpo = Math.max(slot * (1 - gap), 1);

  return velas.map((v, i) => {
    const centroX = i * slot + slot / 2;
    const x = centroX - anchoCuerpo / 2;
    const yApertura = escalarY(v.open);
    const yCierre = escalarY(v.close);
    const cuerpoY = Math.min(yApertura, yCierre);
    const cuerpoAlto = Math.max(Math.abs(yCierre - yApertura), 1);

    return {
      centroX,
      centroY: cuerpoY + cuerpoAlto / 2,
      x,
      ancho: anchoCuerpo,
      cuerpoY,
      cuerpoAlto,
      mechaY1: escalarY(v.high),
      mechaY2: escalarY(v.low),
      sube: v.close >= v.open,
    };
  });
}

/** Distancia euclidiana entre dos puntos. */
export function distancia(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

/**
 * Intensidad (0 a 1) de la reacción de una vela al puntero, según qué tan cerca está.
 * A `distancia = 0` da 1 (máxima); a `distancia >= radio` da 0 (nada). La caída es
 * suave (smoothstep), no lineal, para que el efecto se sienta como un susurro y no
 * como un foco que se prende y apaga de golpe.
 */
export function intensidadPorProximidad(dist: number, radio: number): number {
  if (radio <= 0) return 0;
  const t = 1 - clamp(dist / radio, 0, 1);
  return t * t * (3 - 2 * t);
}
