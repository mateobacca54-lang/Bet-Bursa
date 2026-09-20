// ============================================================
// lecciones.ts — contenido jugable del Módulo 1.
//
// El gancho, el concepto clave y la aplicación práctica NO viven aquí:
// salen literales de `temario.ts` (que viene del docx). Aquí solo está lo
// que el temario no trae: la explicación, el ejemplo local, el resumen y
// la configuración del ejercicio.
//
// Una lección sin entrada aquí se muestra como "se está preparando".
// ============================================================

import type { AnimatedComparatorConfig, ConsequenceSliderConfig, DragClassifierConfig } from '@/lib/types';
import { leccion01, leccion01Config } from './leccion-01-dinero';
import { leccion02, leccion02Config } from './leccion-02-inflacion';
import { leccion03, leccion03Config } from './leccion-03-interes';

export type PracticeSpec =
  | { kind: 'DragClassifier'; config: DragClassifierConfig }
  | { kind: 'ConsequenceSlider'; config: ConsequenceSliderConfig }
  | { kind: 'AnimatedComparator'; config: AnimatedComparatorConfig };

export interface LessonContent {
  number: number;
  /** Desarrolla el concepto clave del temario en 2–3 frases */
  explanation: string;
  /** Ejemplo cotidiano en pesos */
  example: string;
  /** Una línea: lo que se lleva la persona */
  summary: string;
  practice: PracticeSpec;
}

const LECCIONES: readonly LessonContent[] = [
  {
    number: 1,
    explanation: leccion01.explanation,
    example: leccion01.example,
    summary: leccion01.summary,
    practice: { kind: 'DragClassifier', config: leccion01Config },
  },
  {
    number: 2,
    explanation: leccion02.concept,
    example: leccion02.example,
    summary: leccion02.summary,
    practice: { kind: 'ConsequenceSlider', config: leccion02Config },
  },
  {
    number: 3,
    explanation: leccion03.explanation,
    example: leccion03.example,
    summary: leccion03.summary,
    practice: { kind: 'AnimatedComparator', config: leccion03Config },
  },
];

export function getLessonContent(number: number): LessonContent | null {
  return LECCIONES.find((l) => l.number === number) ?? null;
}
