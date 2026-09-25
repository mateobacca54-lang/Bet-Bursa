// ============================================================
// Lección 06 — Presupuesto personal sin Excel
// Widget: ProportionBuilder (Arquetipo "Repartir")
//
// ⚠ Se aparta del docx en la aplicación práctica: el temario pide "Arma tu
// presupuesto del mes con tus propios ingresos y gastos reales" — texto que
// depende de datos que la persona tendría que escribir, sin una forma de
// corregirlo al instante (regla de evaluabilidad, METODOLOGIA §3.5).
// Aquí se reparte un monto de ejemplo entre las MISMAS tres categorías que pide
// el docx (fijo, variable, ahorro): se practica la mecánica —repartir sin que
// se salga del 100 %— con un caso concreto, no con datos reales todavía.
// Mismo tipo de decisión que en la lección 1 (ver ese archivo); reversible.
//
// El monto ($600.000) y el mínimo de ahorro (10 %) son un ejemplo ilustrativo,
// no una cifra oficial: no necesita fuente porque no se presenta como una
// estadística real (REGLAS §1 exige fuente solo para datos que se afirman como
// verdaderos de Colombia, no para escenarios de práctica).
// ============================================================

import type { ProportionBuilderConfig } from '@/lib/types';

export const leccion06Config: ProportionBuilderConfig = {
  instruction: 'Imagina que este mes tienes $600.000 para repartir. Ajusta cada categoría hasta que el reparto te sirva, y confirma.',
  totalAmount: 600000,
  categories: [
    { id: 'fijo', label: 'Fijo (lo que se repite igual cada mes)', initialPercent: 50, colorToken: '--brand-600' },
    { id: 'variable', label: 'Variable (lo que cambia: salidas, antojos)', initialPercent: 40, colorToken: '--gold-300' },
    { id: 'ahorro', label: 'Ahorro', initialPercent: 10, colorToken: '--brand-200' },
  ],
  savingsMinPercent: 10,
  feedbackPositive: 'Separaste al menos $60.000 para ahorrar antes de gastar el resto. Ese orden es el presupuesto.',
  feedbackNegative: 'Con este reparto el ahorro queda por debajo de $60.000. Sube esa categoría: las otras dos van a ceder espacio solas.',
};

export const leccion06 = {
  explanation:
    'Un presupuesto no es una lista de gastos que ya pasaron: es decidir antes de gastar. Todo lo que entra se puede separar en tres cajones — lo fijo, que se repite igual cada mes; lo variable, que cambia; y el ahorro. Cuando el ahorro se reparte de último, casi siempre queda en cero.',
  example:
    'Si repartes fijo, variable y ahorro al mismo tiempo, el ahorro compite con las ganas del momento — y casi siempre pierde. Por eso el orden importa: primero se aparta el ahorro, como si fuera una cuenta fija más, y con lo que queda se cubre lo variable.',
  summary:
    'Un presupuesto de tres cajones —fijo, variable, ahorro— no necesita Excel. Necesita que el ahorro se separe primero, no de último.',
};
