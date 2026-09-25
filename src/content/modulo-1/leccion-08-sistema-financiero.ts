// ============================================================
// Lección 08 — El sistema financiero colombiano en 5 minutos
// Widget: DragClassifier (Arquetipo B), con 3 zonas en vez de 2
//
// La práctica del docx es "Empareja cada producto con la situación en la que
// lo usarías": aquí se resuelve como una clasificación de 6 situaciones en 3
// productos (cuenta de ahorros, CDT, tarjeta de crédito), que es la versión
// evaluable al instante de "emparejar" con el widget que ya existe.
//
// Lo que se explica de cada producto es su FUNCIONAMIENTO (qué tan disponible
// está la plata, si paga o cobra interés), no una tasa ni una cifra: eso no
// necesita fuente porque no se presenta como un dato de mercado (REGLAS §1
// exige fuente para cifras, no para qué es un producto).
// ============================================================

import type { DragClassifierConfig } from '@/lib/types';

const AHORROS = 'cuenta-ahorros';
const CDT = 'cdt';
const TARJETA = 'tarjeta-credito';

export const leccion08Config: DragClassifierConfig = {
  instruction: 'Cada situación necesita un producto distinto. Arrastra cada una al que le sirve, o tócala y luego toca el producto.',
  items: [
    {
      id: 'imprevisto',
      icon: 'casa',
      shortLabel: 'Por si acaso',
      label: 'Guardar la plata del imprevisto: la necesitas disponible en cualquier momento',
      explanation: 'La cuenta de ahorros no te compromete a un plazo: sacas cuando quieras.',
    },
    {
      id: 'pasajes',
      icon: 'bus',
      shortLabel: 'Gasto del día a día',
      label: 'Tener la plata de los pasajes y el almuerzo de la semana',
      explanation: 'Otra vez: disponibilidad. Un CDT no te sirve para esto, te toca esperar el plazo.',
    },
    {
      id: 'quieta-un-año',
      icon: 'billete',
      shortLabel: 'Plata quieta un año',
      label: 'Tienes $2.000.000 que no vas a tocar en un año y quieres que rindan',
      explanation: 'Un CDT te paga más que una cuenta de ahorros justamente porque te comprometes a no tocarla.',
    },
    {
      id: 'meta-fija',
      icon: 'crecimiento',
      shortLabel: 'Meta con fecha',
      label: 'Vas a juntar para algo con fecha fija dentro de 6 meses, y ya sabes que no la vas a necesitar antes',
      explanation: 'Ese plazo conocido es justo lo que un CDT premia: paga más por saber que la plata se queda quieta.',
    },
    {
      id: 'compra-sin-plata',
      icon: 'empanada',
      shortLabel: 'Pagar sin tener la plata hoy',
      label: 'Necesitas pagar algo hoy y vas a tener la plata para cubrirlo antes de que te cobren interés',
      explanation: 'Una tarjeta de crédito es un préstamo de corto plazo: si pagas antes de la fecha de corte, no paga interés.',
    },
    {
      id: 'compra-sin-plan',
      icon: 'almuerzo',
      shortLabel: 'Comprar sin plan de pago',
      label: 'Comprar algo hoy sin tener claro cuándo vas a poder pagarlo',
      explanation: 'Esa es la trampa de la tarjeta: sin fecha para pagar, el interés se acumula y crece.',
    },
  ],
  zones: [
    { id: AHORROS, label: 'Cuenta de ahorros', correctItemIds: ['imprevisto', 'pasajes'] },
    { id: CDT, label: 'CDT (plazo fijo)', correctItemIds: ['quieta-un-año', 'meta-fija'] },
    { id: TARJETA, label: 'Tarjeta de crédito', correctItemIds: ['compra-sin-plata', 'compra-sin-plan'] },
  ],
  explanationCorrect:
    'Cada producto responde una pregunta distinta: ¿la necesitas ya (cuenta de ahorros), te sobra por un tiempo fijo (CDT), o necesitas pagar antes de tener la plata (tarjeta)?',
  explanationWrong:
    'Pregúntate: ¿cuándo necesitas esa plata? Esa respuesta, más que el nombre del producto, dice cuál te sirve.',
};

export const leccion08 = {
  explanation:
    'Detrás de nombres como CDT, cuenta de ahorros o tarjeta de crédito hay una sola pregunta que los distingue: ¿la plata está disponible ya, o te comprometes a un plazo? Una cuenta de ahorros la deja disponible siempre. Un CDT paga más, a cambio de que no la toques por un tiempo fijo. Una tarjeta de crédito es al revés: te presta antes de que tengas la plata, y por eso cobra si no pagas a tiempo.',
  example:
    'Con $500.000 disponibles todo el mes, una cuenta de ahorros tiene sentido: puedes sacar cuando quieras. Si en cambio sabes que esos $500.000 no los vas a necesitar en seis meses, un CDT te paga más por esa certeza. Y si necesitas pagar algo hoy sin tener la plata todavía, ahí entra la tarjeta — con la condición de pagarla antes de que empiece a cobrar interés.',
  summary:
    'Cada producto financiero responde una pregunta de plazo: ¿la plata está disponible ya, sobra por un tiempo fijo, o la necesitas antes de tenerla?',
};
