import type { DropZone } from '@/lib/types';

// ============================================================
// landing-lectura.ts — lógica pura de las piezas interactivas de la landing (B):
// LeeLaLetra (simulación de crédito, lección 9) y MetodoDemo (clasificar sin ver
// la respuesta antes de predecir, lección 1). Todo se prueba sin DOM (npm test).
// ============================================================

/**
 * deudaTrasGracia — cuánto se debe al terminar un período de gracia que capitaliza
 * intereses: el interés de cada mes se suma al saldo y el mes siguiente se calcula
 * sobre ese saldo más grande (lección 9: "el interés no pagado se suma al saldo").
 *
 * @param monto        — monto solicitado
 * @param tasaMensual  — tasa de interés mensual (decimal, ej. 0.018 = 1,8 %)
 * @param meses        — meses del período de gracia
 * @returns la deuda al cabo de esos meses, redondeada al peso
 *
 * @example deudaTrasGracia(3_000_000, 0.018, 6) → 3_338_935
 */
export function deudaTrasGracia(monto: number, tasaMensual: number, meses: number): number {
  return Math.round(monto * Math.pow(1 + tasaMensual, meses));
}

/**
 * pasoActivo — de cuál de los `pasos` pasos (0-based) está cerca el usuario, según
 * el progreso de scroll de un contenedor (0 a 1) repartido en partes iguales.
 * La usa LeeLaLetra para saber qué resaltador mostrar mientras el usuario baja.
 */
export function pasoActivo(progreso: number, pasos: number): number {
  if (!Number.isFinite(progreso) || pasos <= 0) return 0;
  const acotado = Math.min(Math.max(progreso, 0), 1);
  const indice = Math.floor(acotado * pasos);
  return Math.min(indice, pasos - 1);
}

// ─── LeeLaLetra v2 — "El papel sobre la mesa" (docs/archivo/SPEC-LANDING-V2.md §10) ───

/** Qué ids de `leccion09Config.zones` resalta cada uno de los 3 pasos, en orden. */
export const ZONAS_POR_PASO: readonly (readonly string[])[] = [
  ['cuota'],
  ['monto', 'plazo', 'tasa'],
  ['gracia'],
];

export type EstadoFila = 'actual' | 'leida' | 'pendiente';

/**
 * estadoFila — cómo se marca una fila del papel (por el id de su zona) dado el paso
 * en el que está el usuario ahora mismo: la del paso actual va fuerte (`--gold-300`
 * en el componente), las de pasos ya pasados quedan tenues (`--gold-100`), y las de
 * pasos futuros no llevan marca. Se recalcula con el paso actual (no es un trinquete):
 * si el usuario sube de nuevo, una fila "leída" puede volver a quedar sin marca.
 */
export function estadoFila(zonaId: string, paso: number): EstadoFila {
  const indice = ZONAS_POR_PASO.findIndex((zonas) => zonas.includes(zonaId));
  if (indice === -1 || indice > paso) return 'pendiente';
  return indice === paso ? 'actual' : 'leida';
}

/**
 * splitEtiquetaValor — parte el `label` de una zona de `leccion09Config` (pensado
 * para el lector de pantalla del arquetipo "Señalar", ej. "Plazo: 24 meses") en
 * etiqueta y valor para las dos columnas del papel. Nunca se escriben esas cifras a
 * mano en el componente: siempre salen de aquí.
 */
export function splitEtiquetaValor(label: string): { etiqueta: string; valor: string } {
  const i = label.indexOf(': ');
  if (i === -1) return { etiqueta: label, valor: '' };
  return { etiqueta: label.slice(0, i), valor: label.slice(i + 2) };
}

/**
 * cifraContador — el contador de la deuda nunca debe retroceder (SPEC §10: "se
 * queda en la cifra final; no vuelve atrás al subir"). Toma el mayor entre el valor
 * ya mostrado y el nuevo valor propuesto por la animación.
 */
export function cifraContador(actual: number, propuesta: number): number {
  return Math.max(actual, propuesta);
}

// ─── MetodoDemo: clasificar sin ver la respuesta antes de predecir ───

export type EleccionTrueque = 'trueque' | 'dinero';

/** La zona (id de `leccion01Config.zones`) a la que de verdad pertenece un ítem. */
export function zonaCorrectaDe(itemId: string, zones: readonly DropZone[]): string | undefined {
  return zones.find((zona) => zona.correctItemIds.includes(itemId))?.id;
}

/** ¿La elección del usuario para `itemId` coincide con su zona correcta? */
export function esClasificacionCorrecta(itemId: string, eleccion: EleccionTrueque, zones: readonly DropZone[]): boolean {
  return zonaCorrectaDe(itemId, zones) === eleccion;
}

/** Cuántas de las respuestas dadas son correctas (para "Leíste bien N de 4"). */
export function contarAciertos(respuestas: Record<string, EleccionTrueque>, zones: readonly DropZone[]): number {
  return Object.keys(respuestas).filter((id) => esClasificacionCorrecta(id, respuestas[id], zones)).length;
}
