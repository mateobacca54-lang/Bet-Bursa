// ============================================================
// ruta.ts — agrupar el catálogo de módulos por tramo (docs/RUTA-DE-APRENDIZAJE.md §3)
//
// Tres tramos fijos: el tronco común (módulos 1-4, todos lo ven) y dos ramas que
// nacen después (5-7 "si ya trabajas", 8-10 "si quieres que tu plata crezca"). Es
// lógica pura -sin DOM- para poder probarla con vitest (AGENTS.md, sección Código).
// ============================================================

import type { ModuloCatalogo } from '@/content/modulos';

export type TramoId = 'tronco' | 'trabajo' | 'inversion';

export interface Tramo {
  id: TramoId;
  /** Etiqueta corta en mayúscula sostenida, para mostrar sobre la fila de pedestales. */
  etiqueta: string;
  modulos: readonly ModuloCatalogo[];
}

/**
 * Agrupa `modulos` (se asume ordenado por `numero`, como MODULOS) en los tres tramos
 * de la ruta. Corta por posición, no por número, para no depender de que los números
 * del catálogo empiecen siempre en 1.
 */
export function agruparPorTramo(modulos: readonly ModuloCatalogo[]): Tramo[] {
  return [
    { id: 'tronco', etiqueta: 'Tronco común', modulos: modulos.slice(0, 4) },
    { id: 'trabajo', etiqueta: 'Si ya estás trabajando', modulos: modulos.slice(4, 7) },
    { id: 'inversion', etiqueta: 'Si quieres que tu plata crezca', modulos: modulos.slice(7, 10) },
  ];
}
