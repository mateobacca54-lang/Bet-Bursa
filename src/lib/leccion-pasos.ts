// ============================================================
// leccion-pasos.ts — lógica pura de la nueva anatomía de lección (DESIGN.md §8).
//
// Todo lo de aquí se prueba sin DOM (ver leccion-pasos.test.ts, AGENTS.md § Código):
// partir un texto en frases para revelarlas una por una, decidir cuántas ya se
// mostraron, y evaluar si la apuesta del usuario acertó. Nada de esto toca React,
// `window` ni `document`.
// ============================================================

/**
 * Palabras que terminan en punto sin cerrar una frase (títulos, abreviaturas comunes
 * en español). La lista es corta a propósito: el contenido de Bursa es cercano, casi
 * nunca las usa, pero un "pág." o un "Sr." no deben cortar una frase por la mitad.
 */
const ABREVIATURAS = new Set([
  'sr', 'sra', 'srta', 'dr', 'dra', 'ud', 'uds', 'vs', 'etc', 'ej', 'núm', 'pág', 'art', 'cra', 'cra.', 'no',
]);

/**
 * dividirEnFrases — parte un texto en sus frases, respetando:
 *   - cifras en pesos y separadores de miles ("$8.000", "$1.200.000"): el punto entre
 *     dos dígitos nunca es un final de frase.
 *   - porcentajes con coma decimal ("6,5 %"): no usan punto, así que no hace falta
 *     tratarlos aparte.
 *   - abreviaturas comunes ("pág.", "Sr."): el punto que sigue a una de la lista de
 *     arriba no corta.
 *   - rayas largas ("—"): nunca se tratan como fin de frase, solo `.`, `!` y `?` lo son.
 *
 * Un punto (o `!`/`?`) solo cierra una frase si lo sigue un espacio o el final del
 * texto: así "8.000 pesos" (seguido de otra letra, sin espacio) tampoco se corta.
 */
export function dividirEnFrases(texto: string): string[] {
  const limpio = texto.trim();
  if (!limpio) return [];

  const frases: string[] = [];
  let inicio = 0;

  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i];
    if (c !== '.' && c !== '!' && c !== '?') continue;

    const antes = limpio[i - 1];
    const despues = limpio[i + 1];

    // "$8.000": dígito antes Y dígito después del punto → separador de miles, no final.
    if (c === '.' && antes !== undefined && despues !== undefined && /\d/.test(antes) && /\d/.test(despues)) {
      continue;
    }

    // Debe seguir un espacio (o el final del texto) para ser un cierre real.
    if (despues !== undefined && despues !== ' ' && despues !== '\n') {
      continue;
    }

    // Abreviatura conocida justo antes del punto ("pág.", "Sr.").
    if (c === '.') {
      const palabraAntes = limpio.slice(0, i).match(/([A-Za-zÁÉÍÓÚáéíóúÑñ]+)$/)?.[1];
      if (palabraAntes && ABREVIATURAS.has(palabraAntes.toLowerCase())) {
        continue;
      }
    }

    frases.push(limpio.slice(inicio, i + 1).trim());
    inicio = i + 1;
  }

  const resto = limpio.slice(inicio).trim();
  if (resto) frases.push(resto);

  return frases.filter(Boolean);
}

/**
 * siguienteRevelacion — el conteo de frases visibles tras pedir "una más", sin pasarse
 * del total. `actual` ya cuenta la primera frase (que se muestra sin pedirlo).
 */
export function siguienteRevelacion(actual: number, total: number): number {
  const tope = Math.max(total, 0);
  return Math.min(actual + 1, tope);
}

/** ¿Quedan frases por mostrar? Decide si el botón dice "Seguir" o "Continuar" (DESIGN.md §8). */
export function faltanPorRevelar(actual: number, total: number): boolean {
  return actual < total;
}

/**
 * Cuántas etapas tiene el esquema de `EjemploVisual` en cada lección (rótulos, flechas o
 * columnas que se arman una por una). Las lecciones sin esquema (4–10 por ahora) valen 0:
 * `EjemploVisual` ya devuelve `null` para ellas.
 */
const PASOS_EJEMPLO_VISUAL: Readonly<Record<number, number>> = {
  1: 2,
  2: 2,
  3: 2,
};

export function totalPasosEjemploVisual(leccion: number): number {
  return PASOS_EJEMPLO_VISUAL[leccion] ?? 0;
}

/** El esquema nunca muestra más etapas de las que tiene, aunque el texto tenga más frases. */
export function pasoVisual(revelado: number, leccion: number): number {
  return Math.min(revelado, totalPasosEjemploVisual(leccion));
}

/** ¿La opción elegida en "Tu apuesta" es la que la lección confirma al final? */
export function acertoApuesta(pickId: string | null, acierto: string): boolean {
  return pickId !== null && pickId === acierto;
}

/** La frase que reconoce el acierto sin regañar el error (AGENTS.md: el error no castiga). */
export function fraseResultadoApuesta(acerto: boolean): string {
  return acerto ? '¡Le atinaste!' : 'Casi — y ahora sabes por qué.';
}
