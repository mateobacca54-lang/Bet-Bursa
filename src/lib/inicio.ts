import { getGreetingState, type GreetingData } from './greeting';
import type { ModuleProgress } from './progress';
import type { WarmUpConfig, WarmUpOptionId } from '@/content/inicio';

// ============================================================
// inicio.ts — Lógica pura de /inicio (sin DOM, con test).
//
// /inicio es adaptable: quien no ha completado ninguna lección ve a Monedita con una
// apuesta de calentamiento; quien ya empezó ve su progreso y los módulos.
// Reutiliza getGreetingState, así el corte de 3 días y el progreso saneado son los mismos
// que en /modulo/1: no hay una segunda definición de "quién volvió".
// ============================================================

export type InicioMode = 'first-visit' | 'returning';

export type ModuleCardStatus = 'start' | 'in-progress' | 'complete' | 'soon';

export interface InicioModuleCard {
  number: number;
  status: ModuleCardStatus;
  /** Lecciones completadas; null si el módulo aún no existe */
  completed: number | null;
  total: number | null;
  /** null = no se puede entrar (módulo por abrir) */
  href: string | null;
}

export interface InicioView {
  mode: InicioMode;
  greeting: GreetingData;
  /** Destino del botón principal del héroe. El texto lo pone el componente según el estado. */
  ctaHref: string;
  modules: InicioModuleCard[];
}

export const PATH_HREF = '/modulo/1';
export const lessonHref = (lesson: number): string => `/modulo/1/leccion/${lesson}`;

export function getInicioView(progress: ModuleProgress, now: Date, totalLessons: number): InicioView {
  const greeting = getGreetingState(progress, now, totalLessons);
  const { state, completedCount, nextLesson } = greeting;

  const mode: InicioMode = state === 'first-time' ? 'first-visit' : 'returning';

  // Solo quien va al día salta directo a su lección. Los demás pasan por el camino:
  // primera vez (ahí empieza la secuencia saludo → línea → nodos, PLAN §5.5), quien volvió
  // tarde (el repaso de 10 segundos vive en el saludo de /modulo/1, no se duplica aquí)
  // y quien terminó (el Módulo 2 aún no existe).
  const ctaHref = state === 'in-progress' && nextLesson ? lessonHref(nextLesson) : PATH_HREF;

  // "complete" es solo tras aprobar la prueba de paso (se avanza demostrando, no asistiendo:
  // ARQUITECTURA §2). Con las 10 lecciones hechas y la prueba pendiente, la tarjeta sigue
  // diciendo "en curso" — porque todavía lo está.
  const m1Status: ModuleCardStatus = state === 'complete' ? 'complete' : completedCount > 0 ? 'in-progress' : 'start';

  return {
    mode,
    greeting,
    ctaHref,
    modules: [
      { number: 1, status: m1Status, completed: completedCount, total: totalLessons, href: PATH_HREF },
      { number: 2, status: 'soon', completed: null, total: null, href: null },
    ],
  };
}

export interface WarmUpResult {
  pickedId: WarmUpOptionId;
  /** ¿Apuntó a lo que enseña el módulo? Solo para decidir el tono; nunca se muestra como "acierto". */
  matchedIntended: boolean;
  reveal: string;
}

export function resolveWarmUp(config: WarmUpConfig, pickedId: WarmUpOptionId): WarmUpResult {
  return {
    pickedId,
    matchedIntended: pickedId === config.intendedId,
    reveal: config.reveal[pickedId],
  };
}
