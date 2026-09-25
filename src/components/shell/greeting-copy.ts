// ============================================================
// greeting-copy.ts — Textos del saludo (PLAN-MODULO-1.md §5.5)
//
// Función pura: dado el estado del saludo, devuelve los textos.
// Los textos están copiados literalmente del plan; no se reescriben.
// Reglas de tono que cumple (y que greeting-copy.test.ts vigila):
//   - el progreso es logro ("llevas 2 de 10"), nunca deuda ("te faltan 8")
//   - sin urgencia ni reproche
//   - sin nombre, el saludo es OTRA frase, no una frase con un hueco
// ============================================================

import type { GreetingData } from '@/lib/greeting';
import type { TemarioEntry } from '@/content/modulo-1/temario';

export type CopySegment =
  | { kind: 'text'; text: string }
  /** "2 de 10" en negrita; el 2 rueda cuando cambia */
  | { kind: 'progress'; value: number; total: number };

export interface GreetingCopy {
  title: { before: string; name: string | null; after: string };
  sub: CopySegment[];
  cta: string;
  /** Concepto a repasar (solo en 'returning-late') */
  review: { lesson: number; concept: string } | null;
}

function totalInWords(total: number): string {
  return total === 10 ? 'Diez' : String(total);
}

export function getGreetingCopy(
  data: GreetingData,
  lessons: readonly TemarioEntry[],
  moduleNumber = 1
): GreetingCopy {
  const lesson = (n: number | null) => lessons.find((l) => l.number === n) ?? null;
  const next = lesson(data.nextLesson);
  const name = data.userName;

  switch (data.state) {
    case 'first-time':
      return {
        title: {
          before: 'Todo esto empieza con un billete que ya tienes en el bolsillo.',
          name: null,
          after: '',
        },
        sub: [
          {
            kind: 'text',
            text: `${totalInWords(data.totalLessons)} lecciones. Ninguna pasa de cinco minutos.`,
          },
        ],
        cta: 'Empezar por el principio',
        review: null,
      };

    case 'in-progress':
      return {
        title: name
          ? { before: 'Hola, ', name, after: '.' }
          : { before: 'Bienvenido de vuelta.', name: null, after: '' },
        sub: [
          { kind: 'text', text: 'Llevas ' },
          { kind: 'progress', value: data.completedCount, total: data.totalLessons },
          { kind: 'text', text: next ? `. La que sigue es sobre ${next.topic}.` : '.' },
        ],
        cta: next ? `Seguir: ${next.title}` : 'Seguir',
        review: null,
      };

    case 'returning-late': {
      const review = lesson(data.reviewLesson);
      return {
        title: name
          ? { before: 'Hola de nuevo, ', name, after: '.' }
          : { before: 'Hola de nuevo.', name: null, after: '' },
        sub: [
          {
            kind: 'text',
            text: `Te quedaste en la lección ${data.nextLesson}. Antes de seguir, diez segundos de repaso.`,
          },
        ],
        cta: 'Repasar y seguir',
        review: review ? { lesson: review.number, concept: review.keyConcept } : null,
      };
    }

    case 'awaiting-test':
      return {
        title: name
          ? { before: 'Hola, ', name, after: '.' }
          : { before: 'Hola.', name: null, after: '' },
        sub: [
          {
            kind: 'text',
            text: `Ya viste las ${totalInWords(data.totalLessons).toLowerCase()} lecciones. Antes de seguir, comprueba qué tanto quedó.`,
          },
        ],
        cta: `Hacer la prueba del Módulo ${moduleNumber}`,
        review: null,
      };

    case 'complete':
      return {
        title: name
          ? { before: `Terminaste el Módulo ${moduleNumber}, `, name, after: '.' }
          : { before: `Terminaste el Módulo ${moduleNumber}.`, name: null, after: '' },
        sub: [
          {
            kind: 'text',
            text: `Ya entiendes cómo funciona la plata. El Módulo ${moduleNumber + 1} es sobre hacerla trabajar.`,
          },
        ],
        cta: `Ver el Módulo ${moduleNumber + 1}`,
        review: null,
      };
  }
}
