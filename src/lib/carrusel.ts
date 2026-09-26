/**
 * Lógica pura del carrusel "Highlights" (sin DOM): a qué índice llevar el
 * scroll, y cuál es el siguiente/anterior respetando los límites (no da vueltas:
 * el carrusel se detiene en el primero y en el último, AGENTS.md/PLAN §5 fase 5).
 */

/** Recorta `i` a [0, total - 1]. Con `total <= 0` siempre da 0. */
export function clampIndice(i: number, total: number): number {
  if (!(total > 0)) return 0;
  if (!Number.isFinite(i)) return 0;
  return Math.min(total - 1, Math.max(0, Math.floor(i)));
}

/** Índice siguiente, o el mismo si ya está en el último (sin bucle). */
export function siguienteIndice(actual: number, total: number): number {
  return clampIndice(actual + 1, total);
}

/** Índice anterior, o el mismo si ya está en el primero (sin bucle). */
export function anteriorIndice(actual: number, total: number): number {
  return clampIndice(actual - 1, total);
}

/**
 * De qué tarjeta está más cerca el scroll: cada tarjeta ocupa `paso` px del eje
 * de scroll (ancho de tarjeta + separación) y `posicion` es el `scrollLeft` actual.
 * Redondea al más cercano, para que el snap y el punto activo siempre coincidan.
 */
export function indiceDesdeScroll(posicion: number, paso: number, total: number): number {
  if (!(paso > 0)) return 0;
  const p = Number.isFinite(posicion) ? posicion : 0;
  return clampIndice(Math.round(p / paso), total);
}

/** ¿Toca avanzar automáticamente? Solo si no se llegó ya al final. */
export function debeAvanzarAuto(actual: number, total: number): boolean {
  return actual < total - 1;
}
