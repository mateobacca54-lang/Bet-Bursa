// ============================================================
// Lección 09 — Créditos estudiantiles: la letra pequeña
// Widget: DocumentHotspot (Arquetipo "Señalar")
//
// La práctica del docx es literal: "Revisa una simulación de crédito y detecta la
// trampa escondida". La trampa combina dos cosas del keyConcept del docx —período
// de gracia y capitalización—: durante el período de gracia el interés no
// desaparece, se suma al saldo. Es la fila de letra chica, a propósito, para que
// se sienta exactamente como se siente en la vida real: fácil de pasar por alto.
//
// La fila "destacada" (la cuota grande y llamativa) es un distractor a propósito:
// enseña que lo más visible no siempre es lo que hay que mirar.
// ============================================================

import type { DocumentHotspotConfig } from '@/lib/types';

const FILA = { width: 1, height: 0.1375 };

export const leccion09Config: DocumentHotspotConfig = {
  instruction: 'Esta es una simulación de crédito real. Toca dónde está la trampa escondida.',
  documento: 'simulacion-credito',
  zones: [
    { id: 'cuota', x: 0, y: 0.1875, ...FILA, label: 'Tu cuota: desde $120.000 al mes' },
    { id: 'monto', x: 0, y: 0.325, ...FILA, label: 'Monto solicitado: $3.000.000' },
    { id: 'plazo', x: 0, y: 0.4625, ...FILA, label: 'Plazo: 24 meses' },
    { id: 'tasa', x: 0, y: 0.6, ...FILA, label: 'Tasa de interés: 1,8 % mensual' },
    { id: 'gracia', x: 0, y: 0.7375, ...FILA, label: 'Período de gracia: 6 meses. El interés no pagado se suma al saldo.' },
  ],
  correctZoneId: 'gracia',
  explanationCorrect: 'Ahí está: 6 meses "de gracia" sin pagar cuota, pero el interés sigue corriendo y se suma a lo que debes. Cuando empiezas a pagar, debes más que al firmar.',
  hintText: 'No es la cuota llamativa de arriba. Busca la letra más chica, al final.',
  explanationWrong: 'Esa fila no esconde nada raro. La trampa está en la letra más chica, al final del todo.',
};

export const leccion09 = {
  explanation:
    'Antes de firmar un crédito hay cuatro cosas que mirar: la tasa, el plazo, si hay un período de gracia, y si ese período capitaliza. "Capitalizar" quiere decir que el interés que no pagas se suma al saldo, y el siguiente interés se calcula sobre ese saldo más grande. Un período de gracia sin capitalización te da respiro; uno que capitaliza te cobra ese respiro después, con intereses.',
  example:
    'Un crédito anuncia "6 meses sin pagar cuota" como un beneficio. Y lo es, si el interés de esos 6 meses no se te suma. Pero si se suma —que es lo más común—, el día que empiezas a pagar debes más de lo que pediste, aunque no hayas gastado un peso más. Esa letra pequeña cambia el crédito completo.',
  summary: 'Antes de firmar, mira la tasa, el plazo, y si el período de gracia capitaliza intereses: ahí está casi siempre la trampa.',
};
