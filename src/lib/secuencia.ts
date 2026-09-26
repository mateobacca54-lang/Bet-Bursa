// ============================================================
// secuencia.ts — lógica pura del scrub suave de una secuencia de imágenes
// (los celulares girando en "Así se aprende en Bursa.", en celular).
//
// Dos piezas, sin DOM:
//   cuadroParaProgreso: qué cuadro de la secuencia le corresponde a un progreso 0..1.
//   acercar: suaviza cualquier valor (progreso, o el currentTime del video en
//     escritorio) para que el dibujo no siga el dedo en crudo, sino que lo persiga
//     con una interpolación exponencial — así un scroll brusco no salta de golpe.
// ============================================================

/** Índice de cuadro (0..total-1) para un progreso 0..1. NaN o total<=0 → 0. */
export function cuadroParaProgreso(progreso: number, total: number): number {
  if (!Number.isFinite(progreso) || !(total > 0)) return 0;
  const p = Math.min(1, Math.max(0, progreso));
  return Math.min(total - 1, Math.round(p * (total - 1)));
}

/**
 * Interpolación exponencial de `actual` hacia `objetivo`: en cada llamada avanza
 * `factor` de la distancia que falta. Se ajusta exactamente al objetivo cuando la
 * diferencia ya es menor que `epsilon`, para que nunca quede persiguiéndolo para
 * siempre. `factor` se recorta a [0, 1] (0 = no se mueve, 1 = salta de una vez).
 */
export function acercar(actual: number, objetivo: number, factor: number, epsilon = 0.01): number {
  if (!Number.isFinite(actual) || !Number.isFinite(objetivo)) return objetivo;
  if (Math.abs(objetivo - actual) < epsilon) return objetivo;
  const f = Math.min(1, Math.max(0, factor));
  return actual + (objetivo - actual) * f;
}
