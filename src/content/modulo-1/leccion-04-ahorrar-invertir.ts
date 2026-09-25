// ============================================================
// Lección 04 — Ahorrar ≠ invertir
// Widget: DragClassifier (Arquetipo B)
//
// El gancho, el concepto clave y la aplicación práctica salen literales del docx
// (temario.ts). La práctica del docx dice "Clasifica 5 situaciones cotidianas:
// ¿toca ahorrar o invertir?" — se respeta tal cual: cinco situaciones, no seis.
//
// Ninguna cifra nueva: el ejemplo no promete rentabilidades ni nombra tasas.
// ============================================================

import type { DragClassifierConfig } from '@/lib/types';

const AHORRAR = 'ahorrar';
const INVERTIR = 'invertir';

export const leccion04Config: DragClassifierConfig = {
  instruction:
    'Clasifica cada situación: ¿esa plata toca ahorrarla o se puede invertir? Arrastra cada una a su zona, o tócala y luego toca la zona.',
  items: [
    {
      id: 'matricula',
      icon: 'profesor',
      shortLabel: 'Matrícula',
      label: 'La matrícula que tienes que pagar el otro mes',
      explanation: 'Tiene fecha, y es pronto. Si justo ese mes baja, te quedas sin matrícula.',
    },
    {
      id: 'imprevisto',
      icon: 'casa',
      shortLabel: 'Por si acaso',
      label: 'Lo que guardas por si se daña algo en la casa',
      explanation: 'No sabes cuándo va a pasar. Tiene que estar disponible el día que pase.',
    },
    {
      id: 'estudiar',
      icon: 'crecimiento',
      shortLabel: 'Estudiar en 5 años',
      label: 'Lo que juntas para estudiar algo dentro de cinco años',
      explanation: 'Cinco años dan tiempo de aguantar una bajada y recuperarse.',
    },
    {
      id: 'aporte',
      icon: 'billete',
      shortLabel: 'Aporte mensual',
      label: 'Un aporte pequeño cada mes que no piensas tocar en mucho tiempo',
      explanation: 'No lo vas a tocar. El tiempo es justo lo que necesita para crecer.',
    },
    {
      id: 'pasajes',
      icon: 'bus',
      shortLabel: 'Pasajes del mes',
      label: 'Lo que separas cada mes para los pasajes',
      explanation: 'Lo usas este mes. Nada que vayas a gastar ya debería poder bajar.',
    },
  ],
  zones: [
    { id: AHORRAR, label: 'Toca ahorrarla', correctItemIds: ['matricula', 'imprevisto', 'pasajes'] },
    { id: INVERTIR, label: 'Se puede invertir', correctItemIds: ['estudiar', 'aporte'] },
  ],
  explanationCorrect:
    'La pregunta no es cuál rinde más: es cuándo necesitas esa plata. Si la necesitas pronto, o no sabes cuándo, se ahorra. Si tiene años por delante, puede invertirse.',
  explanationWrong:
    'Fíjate en la fecha: ¿cuándo vas a necesitar esa plata? Si es pronto, no puede darse el lujo de bajar.',
};

export const leccion04 = {
  explanation:
    'Ahorrar es guardar plata para tenerla lista cuando la necesites: protege, pero no crece. Y como los precios suben —lo viste en la lección 2—, cada año compra un poco menos. Invertir es ponerla a trabajar para que crezca, a cambio de que pueda bajar antes de subir. No es que una sea mejor: sirven para cosas distintas.',
  example:
    'Guardas $500.000 en una alcancía. Al año siguen siendo $500.000: el mismo número. Pero si los precios subieron, compran menos que antes. Si en cambio los pusieras donde rindan, podrían terminar siendo más — o menos, si el año sale malo. La alcancía no te quita plata: la deja quieta mientras todo lo demás sube.',
  summary:
    'Ahorrar protege lo que ya tienes. Invertir lo hace crecer, con riesgo. La pregunta no es cuál es mejor, sino para cuándo es esa plata.',
};
