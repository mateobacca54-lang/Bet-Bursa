/**
 * Qué paso (0 a `total - 1`) toca mostrar con el `progreso` (0 a 1) de un tramo anclado
 * dividido en `total` partes iguales. El final exacto (1) cuenta como el último paso.
 */
export function pasoActivo(progreso: number, total: number): number {
  if (!(total > 0)) return 0;
  const p = Math.min(1, Math.max(0, Number.isFinite(progreso) ? progreso : 0));
  return Math.min(total - 1, Math.floor(p * total));
}
