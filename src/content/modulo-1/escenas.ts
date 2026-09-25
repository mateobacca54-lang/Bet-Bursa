// ============================================================
// escenas.ts — qué estampa (components/illus/Estampa.tsx) ilustra cada lección del Módulo 1.
// Una sola fuente: la usan la landing, el camino y el reproductor de lecciones, para que
// "la lección del interés compuesto" tenga siempre la misma cara en todas partes.
// La escena de cada lección se eligió por el TEMA (título del temario), no por decoración.
// ============================================================

import type { EstampaScene } from '@/components/illus';

export const ESCENA_POR_LECCION: Readonly<Record<number, EstampaScene>> = {
  1: 'billete', // ¿Qué es el dinero y por qué existe?
  2: 'empanada', // ¿Por qué tu plata vale menos cada año?
  3: 'monedas', // Interés simple vs. interés compuesto
  4: 'alcancia', // Ahorrar ≠ invertir
  5: 'tarjeta', // Deuda buena vs. deuda mala
  6: 'presupuesto', // Presupuesto personal sin Excel
  7: 'porcentaje', // ¿Qué es una tasa de interés?
  8: 'banco', // El sistema financiero colombiano en 5 minutos
  9: 'birrete', // Créditos estudiantiles: la letra pequeña
  10: 'semilla', // Ahora que entiendes la plata, ¿la haces trabajar para ti?
};

export const escenaDeLeccion = (lesson: number): EstampaScene | null => ESCENA_POR_LECCION[lesson] ?? null;
