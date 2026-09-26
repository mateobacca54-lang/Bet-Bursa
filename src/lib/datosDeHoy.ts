// ============================================================
// datosDeHoy.ts — lógica pura de la banda "Datos de hoy" de la landing v3
// (docs/PLAN-LANDING-V3.md §3, fila 2). Sin DOM: el orden, las etiquetas y las
// frases que explican cada indicador viven aquí, con su test en
// datosDeHoy.test.ts. El componente solo lee esto y lo pinta.
// ============================================================

import type { Indicador, IndicadorId } from '@/lib/indicadores/types';
import { formatearValorIndicador } from '@/lib/indicadores/formato';

/** Orden fijo en que se muestran los cinco indicadores (izquierda a derecha / arriba a abajo). */
export const ORDEN_DATOS_DE_HOY: IndicadorId[] = ['inflacion', 'tasaPolitica', 'cdt', 'trm', 'usura'];

/** Nombre corto, en mayúscula sostenida en pantalla, arriba de cada valor. */
export const NOMBRE_CORTO: Record<IndicadorId, string> = {
  inflacion: 'Inflación',
  tasaPolitica: 'Tasa del Banco de la República',
  cdt: 'CDT',
  trm: 'Dólar (TRM)',
  usura: 'Tasa de usura',
};

/**
 * La frase que explica el indicador, en español llano y en la misma frase (regla de
 * tono de AGENTS.md). No repite el valor: el componente ya lo muestra grande arriba.
 */
export const EXPLICACION: Record<IndicadorId, string> = {
  inflacion: 'Cuánto subieron los precios en el último año.',
  tasaPolitica: 'La tasa que usa el Banco de la República para frenar o empujar los precios.',
  cdt: 'Lo que te paga un banco al año por dejar tu plata quieta en un CDT.',
  trm: 'Lo que cuesta un dólar en pesos.',
  usura: 'Lo máximo que te pueden cobrar de interés por un crédito.',
};

/** Texto cuando el indicador no trae un número confiable. El error no castiga: no es rojo ni alarma. */
export const SIN_DATO = 'Sin dato por ahora';

export interface DatoDeHoy {
  id: IndicadorId;
  nombreCorto: string;
  /** El valor ya formateado ("6,24 %", "$3.329,61") o `null` si no hay dato. */
  valorFormateado: string | null;
  explicacion: string;
  periodo: string;
  fuente: string;
  url: string;
}

/**
 * Arma la lista de tarjetas, en el orden fijo de `ORDEN_DATOS_DE_HOY`, a partir del
 * mapa que entrega `useIndicadores()`. Nunca oculta un indicador: si falta el valor,
 * la tarjeta igual aparece con `valorFormateado: null` para que la UI muestre
 * "Sin dato por ahora" sin romper la fila de cinco columnas.
 */
export function construirDatosDeHoy(indicadores: Record<IndicadorId, Indicador>): DatoDeHoy[] {
  return ORDEN_DATOS_DE_HOY.map((id) => {
    const ind = indicadores[id];
    const tieneValor = typeof ind.valor === 'number';
    return {
      id,
      nombreCorto: NOMBRE_CORTO[id],
      valorFormateado: tieneValor ? formatearValorIndicador(id, ind.valor as number) : null,
      explicacion: EXPLICACION[id],
      periodo: ind.periodo,
      fuente: ind.fuente,
      url: ind.url,
    };
  });
}
