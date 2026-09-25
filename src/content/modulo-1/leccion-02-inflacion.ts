// ============================================================
// Lección 02 — La inflación y el precio de tu almuerzo
// Módulo 1: Fundamentos del Dinero
//
// Tipo de widget: ConsequenceSlider (Arquetipo A)
// Concepto: la inflación erosiona el poder adquisitivo.
// ============================================================

import type { ConsequenceSliderConfig } from '@/lib/types';
import { calculateInflatedPrice } from '@/lib/format';

// Tasa de inflación promedio anual en Colombia 2015-2025
// Fuente: datos simplificados del DANE (~6.5% promedio)
const INFLATION_RATE = 0.065;
const BASE_YEAR = 2015;
const END_YEAR = 2025;
const BASE_PRICE = 8000; // COP — precio de un almuerzo corriente en 2015

// Pre-calcular precios por año
const generateDataPoints = () => {
  const points = [];
  for (let year = BASE_YEAR; year <= END_YEAR; year++) {
    const yearsElapsed = year - BASE_YEAR;
    const price = calculateInflatedPrice(BASE_PRICE, INFLATION_RATE, yearsElapsed);
    points.push({ x: year, y: price });
  }
  return points;
};

const dataPoints = generateDataPoints();

// Encontrar el año en que el almuerzo supera $15.000
const targetYear = dataPoints.find((p) => p.y >= 15000)?.x ?? END_YEAR;

export const leccion02Config: ConsequenceSliderConfig = {
  label: 'Año',
  unit: 'COP',
  startValue: BASE_YEAR,
  endValue: END_YEAR,
  step: 1,
  basePrice: BASE_PRICE,
  inflationRate: INFLATION_RATE,
  targetPrice: 15000,
  tolerance: 1, // ±1 año de tolerancia
  dataPoints,
  hookText: 'El precio de tu almuerzo en 10 años',
  visual: 'almuerzo',
  instruction:
    'Mueve el slider hasta encontrar el año en que tu almuerzo pasa de $15.000. En 2015 costaba $8.000.',
  explanationCorrect:
    `¡Exacto! Con una inflación promedio del 6,5% anual, tu almuerzo de $8.000 en 2015 supera los $15.000 alrededor de ${targetYear}. La inflación no se siente día a día, pero acumula un impacto enorme con los años.`,
  explanationWrong:
    'No exactamente. Fíjate en cómo el precio sube cada año un poco más que el anterior — eso es el efecto acumulativo de la inflación. Intenta de nuevo.',
};

// Datos de la lección completa (para el contenedor de lección)
export const leccion02 = {
  id: 'leccion-02',
  moduleId: 'modulo-1',
  lessonNumber: 2,
  title: 'La inflación: el ladrón invisible',
  hook: '¿Sabías que un almuerzo que costaba $8.000 en 2015 hoy puede costar más de $15.000? El dinero que tienes hoy no comprará lo mismo mañana.',
  concept:
    'La inflación es el aumento generalizado de los precios con el tiempo. Cuando los precios suben, cada peso que tienes compra menos cosas. Es como si tu dinero se encogiera un poco cada año.',
  example:
    'Piensa en el almuerzo que comes todos los días. En 2015, un corrientazo promedio costaba $8.000 en Colombia. Con una inflación promedio del 6,5% anual, ese mismo almuerzo sube de precio cada año sin que nadie le cambie los ingredientes.',
  widgetType: 'ConsequenceSlider' as const,
  widgetConfig: leccion02Config,
  summary:
    'La inflación hace que tu dinero pierda valor con el tiempo. Por eso es importante que tu dinero crezca al menos al ritmo de la inflación.',
};
