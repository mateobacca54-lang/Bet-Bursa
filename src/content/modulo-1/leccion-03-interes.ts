// ============================================================
// Lección 03 — Interés simple vs. interés compuesto
// Widget: AnimatedComparator con modo predicción (Arquetipo D)
//
// Se guardan $100.000 al 20 % anual durante 5 años.
//   Simple:    $100.000 + $20.000 por año           → $200.000
//   Compuesto: cada año se gana sobre lo ya ganado  → $248.832
// ============================================================

import type { AnimatedComparatorConfig } from '@/lib/types';
import { compoundValue, simpleValue } from '@/lib/widget-math';

const PRINCIPAL = 100_000;
const RATE = 0.2;
const YEARS = 5;

// Cada cuarto de año: la curva del compuesto se ve curva y no quebrada (los años enteros siguen estando).
const years = Array.from({ length: YEARS * 4 + 1 }, (_, i) => i / 4);

export const leccion03Config: AnimatedComparatorConfig = {
  title: 'Tus $100.000 al 20 % anual',
  description:
    'Esta línea muestra cómo crecen $100.000 con interés simple: ganas $20.000 cada año. Arrastra el punto hasta donde crees que estarán a los 5 años si el interés es compuesto.',
  series: [
    {
      id: 'simple',
      label: 'Interés simple',
      colorToken: 'var(--ink-secondary)',
      dataPoints: years.map((x) => ({ x, y: Math.round(simpleValue(PRINCIPAL, RATE, x)) })),
    },
    {
      id: 'compuesto',
      label: 'Interés compuesto',
      colorToken: 'var(--brand-600)',
      dataPoints: years.map((x) => ({ x, y: Math.round(compoundValue(PRINCIPAL, RATE, x)) })),
    },
  ],
  xAxisLabel: 'Años',
  yAxisLabel: 'Dinero acumulado',
  valueUnit: 'COP',
  predictionMode: {
    seriesId: 'compuesto',
    atX: YEARS,
    tolerancePercent: 5,
    feedbackClose:
      'Muy cerca. El compuesto va por encima del simple porque cada año ganas también sobre lo que ya ganaste.',
    feedbackFar:
      'Ahí está la sorpresa: el segundo año ya no ganas $20.000 sino $24.000, porque el 20 % se aplica también a lo que ya ganaste. Esa bola de nieve es lo que separa las dos líneas.',
  },
};

export const leccion03 = {
  explanation:
    'Con interés simple, cada año ganas un porcentaje solo de lo que pusiste al principio. Con interés compuesto, ganas un porcentaje de lo que pusiste más lo que ya ganaste. Por eso, con el mismo porcentaje y el mismo tiempo, el compuesto termina más arriba.',
  example:
    'Guardas $100.000 con una tasa del 20 % anual. Con interés simple ganas $20.000 cada año, y a los 5 años tienes $200.000. Con interés compuesto, el segundo año ganas el 20 % de $120.000, o sea $24.000, y así sigue creciendo: a los 5 años tienes $248.832.',
  summary:
    'Con el mismo porcentaje, el interés compuesto crece más porque también ganas sobre lo que ya ganaste. El tiempo es lo que más lo alimenta.',
};
