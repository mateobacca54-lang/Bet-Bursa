// ============================================================
// parse.ts — Lógica pura para leer la respuesta de BanRep.
//
// Nada aquí toca la red: recibe el JSON ya descargado (o un fixture de prueba) y
// devuelve datos limpios, o `null` cuando algo no cuadra. `banrep.ts` es el único
// archivo que sabe hacer la petición HTTP.
// ============================================================

import type { Indicador, IndicadorId, RespuestaBanRep, SerieBanRep } from './types';
import { formatearPeriodo } from './formato';

const MS_POR_DIA = 86_400_000;

/**
 * Recupera el día calendario de un timestamp de BanRep.
 *
 * Los timestamps son medianoche hora de Bogotá (UTC-5) expresada en epoch ms. Al
 * dividir entre un día completo y truncar, el desfase de -5 horas desaparece y queda
 * el número de días desde 1970-01-01 que sí corresponde al día que BanRep quiso decir
 * (ver `.limpiar_serie` en banrepstats — es la misma cuenta).
 */
export function fechaDesdeEpoch(epochMs: number): string {
  const dias = Math.floor(epochMs / MS_POR_DIA);
  const fecha = new Date(dias * MS_POR_DIA);
  return fecha.toISOString().slice(0, 10);
}

/** Valida y normaliza el `SERIES` de una respuesta de BanRep. `null` si no es la forma esperada. */
export function extraerSeries(json: unknown): SerieBanRep[] | null {
  if (!json || typeof json !== 'object') return null;
  const series = (json as { SERIES?: unknown }).SERIES;
  if (!Array.isArray(series)) return null;
  return series.filter((s): s is SerieBanRep => esSerieValida(s));
}

function esSerieValida(s: unknown): s is SerieBanRep {
  if (!s || typeof s !== 'object') return false;
  const serie = s as Record<string, unknown>;
  return typeof serie.nombre === 'string' && Array.isArray(serie.data);
}

/**
 * El punto más reciente de una serie con un valor numérico usable. Ignora puntos con
 * `valor: null` (dato faltante) o con fecha inválida; no asume que `data` viene ordenado.
 */
export function obtenerUltimoPunto(
  serie: SerieBanRep | null | undefined,
  hastaMs: number = Number.POSITIVE_INFINITY
): { epochMs: number; valor: number } | null {
  if (!serie || !Array.isArray(serie.data)) return null;
  let mejor: { epochMs: number; valor: number } | null = null;
  for (const punto of serie.data) {
    if (!Array.isArray(punto) || punto.length < 2) continue;
    const [epochMs, valor] = punto;
    if (typeof epochMs !== 'number' || !Number.isFinite(epochMs)) continue;
    if (typeof valor !== 'number' || !Number.isFinite(valor)) continue;
    // BanRep publica puntos con fecha futura (la tasa diaria de los próximos días, la DTF
    // de la semana siguiente). Se muestra lo vigente hoy, no lo programado.
    if (epochMs > hastaMs) continue;
    if (!mejor || epochMs > mejor.epochMs) mejor = { epochMs, valor };
  }
  return mejor;
}

// ─── Selección de series por idMenu ──────────────────────────
//
// Nombres verificados contra respuestas reales de BanRep el 2026-09-25:
//   100001 → "Meta de inflación", "Inflación total anual"
//   59     → "Tasa de política monetaria" (diaria)
//   220003 → "Tasa de Depósitos a Término Fijo (DTF) a 90 días, semanal", más CDT 180 y 360
//   1      → "Tasa Representativa del Mercado (TRM)"
// Cada selector sigue siendo defensivo: si BanRep renombra una serie, devuelve `null` y
// quien llama cae al respaldo en vez de mostrar el número equivocado.

const RE_INFLACION = /inflaci[oó]n/i;
const RE_EXCLUIR_INFLACION = /meta|rango|l[ií]mite|b[aá]sica/i;
const RE_META = /meta/i;
const RE_DTF = /dtf/i;

/**
 * idMenu 100001 — "Inflación y meta". Primera serie que habla de inflación y que NO es
 * la meta, el rango o el núcleo (inflación básica).
 */
export function seleccionarSerieInflacion(series: SerieBanRep[]): SerieBanRep | null {
  return series.find((s) => RE_INFLACION.test(s.nombre) && !RE_EXCLUIR_INFLACION.test(s.nombre)) ?? null;
}

/**
 * idMenu 100001 — la meta de inflación, si la misma respuesta la trae como serie aparte.
 */
export function seleccionarSerieMeta(series: SerieBanRep[]): SerieBanRep | null {
  return series.find((s) => RE_META.test(s.nombre)) ?? null;
}

/**
 * idMenu 59 ("Tasa de interés de política monetaria") e idMenu 1 ("TRM dólar hoy"): en
 * ambos casos tomamos la primera serie de la respuesta.
 */
export function seleccionarPrimeraSerie(series: SerieBanRep[]): SerieBanRep | null {
  return series[0] ?? null;
}

/**
 * idMenu 220003 ("CDT's a 90, 180 y 360 días"). La DTF (promedio de los CDT a 90 días) es
 * el dato que nombra la lección; las series de 180 y 360 días se ignoran.
 */
export function seleccionarSerieCDT(series: SerieBanRep[]): SerieBanRep | null {
  return series.find((s) => RE_DTF.test(s.nombre)) ?? null;
}

interface MetaFuente {
  id: IndicadorId;
  fuente: string;
  url: string;
}

/**
 * Convierte una respuesta cruda de BanRep en un `Indicador` "en vivo", aplicando el
 * selector de serie que corresponda al idMenu consultado. `null` si la respuesta está
 * vacía, mal formada, o si el selector no encuentra ninguna serie que le sirva.
 */
export function parsearIndicador(
  json: unknown,
  seleccionar: (series: SerieBanRep[]) => SerieBanRep | null,
  meta: MetaFuente,
  ahoraMs: number = Date.now()
): Indicador | null {
  const series = extraerSeries(json);
  if (!series || series.length === 0) return null;

  const serie = seleccionar(series);
  const punto = obtenerUltimoPunto(serie, ahoraMs);
  if (!serie || !punto) return null;

  const fecha = fechaDesdeEpoch(punto.epochMs);
  const indicador: Indicador = {
    id: meta.id,
    valor: punto.valor,
    fecha,
    periodo: formatearPeriodo(fecha, serie.descripcionPeriodicidad),
    fuente: meta.fuente,
    url: meta.url,
    origen: 'en-vivo',
  };

  if (meta.id === 'inflacion') {
    const metaSerie = seleccionarSerieMeta(series);
    const metaPunto = obtenerUltimoPunto(metaSerie, ahoraMs);
    if (metaPunto) indicador.metaInflacion = metaPunto.valor;
  }

  return indicador;
}

/** Atajo tipado para leer `RespuestaBanRep` ya validada (uso en `banrep.ts`). */
export function esRespuestaBanRep(json: unknown): json is RespuestaBanRep {
  return extraerSeries(json) !== null;
}

/**
 * El valor en vivo gana si es un número usable; si no (fetch falló, serie no
 * encontrada, valor `null`), se usa el respaldo tal cual.
 */
export function combinarConRespaldo(vivo: Indicador | null, respaldo: Indicador): Indicador {
  if (vivo && typeof vivo.valor === 'number' && Number.isFinite(vivo.valor)) {
    return vivo;
  }
  return respaldo;
}
