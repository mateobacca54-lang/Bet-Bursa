// ============================================================
// widget-math.ts — lógica pura de DragClassifier y AnimatedComparator.
// Sin DOM: se prueba en vitest (widget-math.test.ts).
// ============================================================

import type { DropZone } from './types';

// ─── DragClassifier ─────────────────────────────────────────

export interface ZoneRect {
  id: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Zona a la que pertenece un ítem según la configuración, o null si no está en ninguna. */
export function correctZoneId(zones: readonly DropZone[], itemId: string): string | null {
  return zones.find((z) => z.correctItemIds.includes(itemId))?.id ?? null;
}

/**
 * Zona sobre la que se soltó un ítem. Cuenta como "sobre la zona" el rectángulo ampliado
 * `slack` px (un dedo no es preciso). Si el punto cae en varias, gana la de centro más cercano.
 * Devuelve null si se soltó lejos de todas: el ítem vuelve a su sitio sin contar como fallo.
 */
export function pickZoneAt(rects: readonly ZoneRect[], x: number, y: number, slack = 24): string | null {
  let best: { id: string; dist: number } | null = null;
  for (const r of rects) {
    const inside = x >= r.left - slack && x <= r.right + slack && y >= r.top - slack && y <= r.bottom + slack;
    if (!inside) continue;
    const dist = Math.hypot(x - (r.left + r.right) / 2, y - (r.top + r.bottom) / 2);
    if (best === null || dist < best.dist) best = { id: r.id, dist };
  }
  return best?.id ?? null;
}

/** Fallos por ítem a partir de los cuales el widget lo coloca y explica (nadie se atasca). */
export const MAX_MISSES_PER_ITEM = 2;

// ─── AnimatedComparator ─────────────────────────────────────

/** Valor tras `years` años con interés simple: solo se gana sobre el capital inicial. */
export function simpleValue(principal: number, rate: number, years: number): number {
  return principal * (1 + rate * years);
}

/** Valor tras `years` años con interés compuesto: cada año se gana también sobre lo ganado. */
export function compoundValue(principal: number, rate: number, years: number): number {
  return principal * Math.pow(1 + rate, years);
}

/** Cuánto se aleja `predicted` de `actual`, en % del real (siempre ≥ 0). */
export function percentOff(predicted: number, actual: number): number {
  if (actual === 0) return predicted === 0 ? 0 : Infinity;
  return (Math.abs(predicted - actual) / Math.abs(actual)) * 100;
}

/** Ajusta `value` al múltiplo de `step` más cercano dentro de [min, max]. */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  return Math.min(max, Math.max(min, snapped));
}

/**
 * Convierte una posición vertical (px, 0 = arriba) en un valor de la escala.
 * `top` es la posición del valor máximo y `bottom` la del mínimo.
 */
export function yToValue(y: number, top: number, bottom: number, min: number, max: number): number {
  const t = (bottom - y) / (bottom - top);
  return min + Math.min(1, Math.max(0, t)) * (max - min);
}

/** Inversa de `yToValue`. */
export function valueToY(value: number, top: number, bottom: number, min: number, max: number): number {
  const t = (value - min) / (max - min);
  return bottom - Math.min(1, Math.max(0, t)) * (bottom - top);
}

/**
 * Marcas "redondas" para un eje: pasos de 1, 2 o 5 × 10^k, entre `min` y `max` (incluidos si caen
 * en un múltiplo). Devuelve entre ~3 y ~6 marcas para `target` = 5.
 */
export function niceTicks(min: number, max: number, target = 5): number[] {
  if (!(max > min) || target < 1) return [min];
  const raw = (max - min) / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const frac = raw / pow;
  const step = (frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10) * pow;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) {
    ticks.push(Math.round(v / step) * step);
  }
  return ticks;
}
