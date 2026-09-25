// ============================================================
// formato.ts — Cómo se ven los indicadores en pantalla (es-CO).
// ============================================================

import type { IndicadorId } from './types';
import { formatCOP } from '@/lib/format';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;

/**
 * "agosto de 2026" para un dato mensual (o de menor frecuencia); "25 de septiembre de
 * 2026" cuando `descripcionPeriodicidad` dice que el dato es diario (la TRM, por
 * ejemplo). Cadena vacía si la fecha no es válida.
 */
export function formatearPeriodo(fechaISO: string, periodicidad?: string): string {
  const fecha = new Date(`${fechaISO}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime())) return '';

  const mes = MESES[fecha.getUTCMonth()];
  const anio = fecha.getUTCFullYear();
  const esDiaria = /diari/i.test(periodicidad ?? '');

  return esDiaria ? `${fecha.getUTCDate()} de ${mes} de ${anio}` : `${mes} de ${anio}`;
}

/** "6,24 %" — dos decimales, coma como separador (es-CO). */
export function formatearPorcentaje(valor: number): string {
  const numero = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
  return `${numero}\u00a0%`;
}

/** El valor de un indicador, en el formato que le toca: pesos para la TRM, porcentaje para el resto. */
export function formatearValorIndicador(id: IndicadorId, valor: number): string {
  return id === 'trm' ? formatCOP(valor) : formatearPorcentaje(valor);
}
