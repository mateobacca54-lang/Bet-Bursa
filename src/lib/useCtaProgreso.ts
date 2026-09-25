'use client';

import { MODULO_1 } from '@/content/modulo-1/temario';
import { getNextLesson, type ModuleProgress } from './progress';
import { useProgress } from './useProgress';

// ============================================================
// useCtaProgreso — qué dice y a dónde lleva el botón principal de la landing.
//
// Lo comparten el héroe (HeroMoneda) y la barra de arriba (Landing.tsx): los dos
// necesitan el mismo CTA, así que viven de la misma función pura en vez de que cada
// uno la reinvente. La función (`ctaProgreso`) se prueba sin DOM; el hook solo le
// pasa lo que useProgress ya lee de localStorage.
// ============================================================

export interface CtaProgreso {
  label: string;
  href: string;
}

/** El CTA por defecto: quien todavía no tiene progreso, y el servidor antes de hidratar. */
export const CTA_INICIAL: CtaProgreso = { label: 'Empieza gratis', href: '/inicio' };

/**
 * A partir del progreso guardado, decide la etiqueta y el destino del botón principal.
 *
 * Antes de hidratar (`hydrated` falso, igual que en el servidor) o si todavía no completó
 * ninguna lección, se queda en el CTA por defecto: decirle "sigue con la lección 1" a
 * quien nunca empezó es lo mismo que "empieza gratis", con otras palabras y más fricción.
 * Con todo el módulo terminado, el CTA cambia a ver el progreso en vez de repetir una
 * lección que no existe.
 */
export function ctaProgreso(progress: ModuleProgress, totalLessons: number, hydrated: boolean): CtaProgreso {
  if (!hydrated || progress.completedLessons.length === 0) return CTA_INICIAL;

  const siguiente = getNextLesson(progress, totalLessons);
  if (siguiente === null) return { label: 'Ver tu progreso', href: '/progreso' };

  return { label: `Sigue con la lección ${siguiente}`, href: `/modulo/1/leccion/${siguiente}` };
}

/**
 * El CTA principal de la landing y la barra de arriba. Devuelve siempre `CTA_INICIAL`
 * durante la hidratación (igual que el servidor, sin desajuste) y el real justo después.
 */
export function useCtaProgreso(): CtaProgreso {
  const { progress, hydrated } = useProgress(MODULO_1.id);
  return ctaProgreso(progress, MODULO_1.lessonCount, hydrated);
}
