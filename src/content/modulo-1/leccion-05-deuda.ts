// ============================================================
// Lección 05 — Deuda buena vs. deuda mala
// Widget: DragClassifier (Arquetipo B)
//
// La práctica del docx es literal: "Evalúa 3 ejemplos (tarjeta de crédito,
// crédito educativo, celular a cuotas)". Se respetan los tres, sin añadir más.
//
// Sin cifras de tasas: el ejemplo dice que los intereses suman, no cuánto.
// Poner un porcentaje exigiría verificarlo y fecharlo (REGLAS §1).
// ============================================================

import type { DragClassifierConfig } from '@/lib/types';

const DEJA = 'deja-algo';
const CUESTA = 'solo-cuesta';

export const leccion05Config: DragClassifierConfig = {
  instruction:
    'Mira qué te queda cuando termines de pagar cada una. Arrastra cada deuda a su zona, o tócala y luego toca la zona.',
  items: [
    {
      id: 'tarjeta',
      icon: 'almuerzo',
      shortLabel: 'Salida con tarjeta',
      label: 'Pagar la salida del fin de semana con la tarjeta de crédito, y quedar debiéndola en cuotas',
      explanation: 'La salida terminó el domingo. La deuda sigue meses, y con intereses: pagas más por algo que ya se acabó.',
    },
    {
      id: 'educativo',
      icon: 'profesor',
      shortLabel: 'Crédito educativo',
      label: 'Un crédito para estudiar algo que después te deja ganar más cada mes',
      explanation: 'Si al terminar ganas más de lo que costó el crédito, la deuda te dejó algo. Eso es lo que la hace buena.',
    },
    {
      id: 'celular',
      icon: 'billete',
      shortLabel: 'Celular a cuotas',
      label: 'Cambiar un celular que funciona bien por uno nuevo, a 24 cuotas',
      explanation: 'El que tienes ya hace lo mismo. Los intereses los estás pagando por la diferencia entre «funciona» y «es nuevo».',
    },
  ],
  zones: [
    { id: DEJA, label: 'Te deja algo que vale más', correctItemIds: ['educativo'] },
    { id: CUESTA, label: 'Solo te cuesta', correctItemIds: ['tarjeta', 'celular'] },
  ],
  explanationCorrect:
    'Una deuda es buena si lo que te deja vale más que lo que cuesta. Estudiar puede dejarte un sueldo mayor. Una salida o un celular nuevo no dejan nada que crezca: solo la cuota.',
  explanationWrong:
    'Pregúntate qué te queda cuando termines de pagar. Si no queda nada que valga más que la deuda, la deuda solo costó.',
};

export const leccion05 = {
  explanation:
    'Una deuda no es buena ni mala por sí sola: depende de qué te deja cuando termines de pagarla. Si te deja algo que vale más de lo que costó —un sueldo mayor, una herramienta con la que produces—, fue buena. Si no te deja nada, pagaste de más por tener algo antes.',
  example:
    'Un celular de $1.200.000 a 24 cuotas termina costando más de $1.200.000: esa diferencia son los intereses. Si el que tienes ya funciona, esa diferencia no te dejó nada. Si en cambio esas mismas cuotas fueran un curso y al terminarlo ganaras más cada mes, lo que te deja puede superar lo que costó.',
  summary:
    'Una deuda es buena si lo que te deja vale más que lo que cuesta. Pregúntate siempre qué te queda cuando termines de pagar.',
};
