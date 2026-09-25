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

import type { AnimatedComparatorConfig, ConsequenceSliderConfig, DocumentHotspotConfig, DragClassifierConfig, ElegirConfig, ProportionBuilderConfig } from '@/lib/types';
import { leccion01, leccion01Config } from './leccion-01-dinero';
import { leccion02, leccion02Config } from './leccion-02-inflacion';
import { leccion03, leccion03Config } from './leccion-03-interes';
import { leccion04, leccion04Config } from './leccion-04-ahorrar-invertir';
import { leccion05, leccion05Config } from './leccion-05-deuda';
import { leccion06, leccion06Config } from './leccion-06-presupuesto';
import { leccion07, leccion07Config } from './leccion-07-tasa-interes';
import { leccion08, leccion08Config } from './leccion-08-sistema-financiero';
import { leccion09, leccion09Config } from './leccion-09-letra-pequena';
import { leccion10, leccion10Config } from './leccion-10-puente';

export type PracticeSpec =
  | { kind: 'ProportionBuilder'; config: ProportionBuilderConfig }
  | { kind: 'DragClassifier'; config: DragClassifierConfig }
  | { kind: 'ConsequenceSlider'; config: ConsequenceSliderConfig }
  | { kind: 'AnimatedComparator'; config: AnimatedComparatorConfig }
  | { kind: 'Elegir'; config: ElegirConfig }
  | { kind: 'DocumentHotspot'; config: DocumentHotspotConfig };

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
  {
    number: 4,
    explanation: leccion04.explanation,
    example: leccion04.example,
    summary: leccion04.summary,
    practice: { kind: 'DragClassifier', config: leccion04Config },
  },
  {
    number: 5,
    explanation: leccion05.explanation,
    example: leccion05.example,
    summary: leccion05.summary,
    practice: { kind: 'DragClassifier', config: leccion05Config },
  },
  {
    number: 6,
    explanation: leccion06.explanation,
    example: leccion06.example,
    summary: leccion06.summary,
    practice: { kind: 'ProportionBuilder', config: leccion06Config },
  },
  {
    number: 7,
    explanation: leccion07.explanation,
    example: leccion07.example,
    summary: leccion07.summary,
    practice: { kind: 'DocumentHotspot', config: leccion07Config },
  },
  {
    number: 8,
    explanation: leccion08.explanation,
    example: leccion08.example,
    summary: leccion08.summary,
    practice: { kind: 'DragClassifier', config: leccion08Config },
  },
  {
    number: 9,
    explanation: leccion09.explanation,
    example: leccion09.example,
    summary: leccion09.summary,
    practice: { kind: 'DocumentHotspot', config: leccion09Config },
  },
  {
    number: 10,
    explanation: leccion10.explanation,
    example: leccion10.example,
    summary: leccion10.summary,
    practice: { kind: 'Elegir', config: leccion10Config },
  },
];

export function getLessonContent(number: number): LessonContent | null {
  return LECCIONES.find((l) => l.number === number) ?? null;
}
