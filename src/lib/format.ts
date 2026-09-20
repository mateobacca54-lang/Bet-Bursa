// ============================================================
// format.ts — Utilidades de formateo para Bursa
// ============================================================

/**
 * Formatea un número como pesos colombianos (COP).
 * Usa punto como separador de miles, sin decimales.
 *
 * @example formatCOP(1250000) → "$1.250.000"
 * @example formatCOP(8000)    → "$8.000"
 */
export const formatCOP = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Calcula el precio con inflación acumulada.
 *
 * @param basePrice    — precio original
 * @param rate         — tasa anual (decimal, ej. 0.065)
 * @param years        — número de años transcurridos
 * @returns precio ajustado por inflación, redondeado a entero
 */
export const calculateInflatedPrice = (
  basePrice: number,
  rate: number,
  years: number
): number => Math.round(basePrice * Math.pow(1 + rate, years));
