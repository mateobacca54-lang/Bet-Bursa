// ============================================================
// widget-feedback.ts — lógica pura del feedback de los widgets.
// Sin DOM: se prueba en vitest (widget-feedback.test.ts).
// ============================================================

export interface ViewportRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * originFromRect — convierte el rectángulo de un elemento (`getBoundingClientRect()`) en
 * un origen 0–1 para `celebrar()` (WidgetShell, al pasar a 'correct'): el confeti sale
 * desde el centro del propio widget, no siempre desde el centro de la pantalla.
 *
 * Si el viewport no tiene tamaño válido (SSR, prueba sin layout) cae al centro (0.5, 0.5),
 * el mismo valor por defecto de `configCelebracion`.
 */
export function originFromRect(rect: ViewportRect, viewport: ViewportSize): { x: number; y: number } {
  if (!(viewport.width > 0) || !(viewport.height > 0)) {
    return { x: 0.5, y: 0.5 };
  }

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return {
    x: clamp01(centerX / viewport.width),
    y: clamp01(centerY / viewport.height),
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

/**
 * shouldOfferReveal — ¿tiene sentido mostrar el botón "Ver la respuesta" junto al de
 * reintentar? Solo cuando el widget tiene un número de intentos finito y razonable
 * (algunos widgets, como ProportionBuilder o DragClassifier, pasan `Infinity` o `99`
 * porque cada fallo ya se explica solo, y ahí un botón de "ver la respuesta" no aplica).
 */
export function shouldOfferReveal(maxAttempts: number): boolean {
  return Number.isFinite(maxAttempts) && maxAttempts > 0 && maxAttempts <= 10;
}
