// ============================================================
// motion-math.ts — matemática pura de animación (sin React ni DOM)
// ============================================================

/**
 * Instante normalizado t ∈ [0, 1] en el que una curva de easing alcanza `progress`.
 *
 * Sirve para sincronizar elementos con una animación que NO es lineal: si una línea se
 * dibuja con EASE_OUT_EXPO, pasa por el 50 % de su recorrido mucho antes de la mitad del
 * tiempo. Para que un nodo aparezca justo cuando el trazo lo alcanza hay que invertir la
 * curva, no repartir los retrasos linealmente.
 *
 * Requiere que `ease` sea monótona creciente con ease(0) = 0 y ease(1) = 1 (las curvas
 * de easing de tokens.css lo son). Se resuelve por bisección.
 */
export function timeForProgress(ease: (t: number) => number, progress: number): number {
  if (!(progress > 0)) return 0;
  if (progress >= 1) return 1;

  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < progress) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
