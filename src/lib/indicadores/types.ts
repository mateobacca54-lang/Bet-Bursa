// ============================================================
// types.ts — Contratos de los indicadores económicos reales de Bursa
// ============================================================

/** Los cinco indicadores que las lecciones pueden mostrar. */
export type IndicadorId = 'inflacion' | 'tasaPolitica' | 'cdt' | 'trm' | 'usura';

/**
 * Un indicador ya resuelto, listo para mostrarse: o vino en vivo del Banco de la
 * República o es el respaldo (snapshot) guardado en el repo.
 */
export interface Indicador {
  id: IndicadorId;
  /** El número. `null` cuando no hay dato confiable — la UI no debe inventar un texto para esto. */
  valor: number | null;
  /** Fecha ISO (aaaa-mm-dd) del periodo que describe el dato. Cadena vacía si `valor` es `null`. */
  fecha: string;
  /** Etiqueta legible del periodo, ej. "agosto de 2026". Cadena vacía si `valor` es `null`. */
  periodo: string;
  /** Nombre de la institución que certifica el dato (DANE, Banco de la República, ...). */
  fuente: string;
  /** Página fuente, para el enlace "Fuente: ...". */
  url: string;
  /** De dónde salió este valor concreto. */
  origen: 'en-vivo' | 'respaldo';
  /**
   * Solo tiene sentido en un respaldo: `false` significa que el número se tomó de una
   * búsqueda y no se confirmó todavía contra la página oficial (ver AGENTS.md).
   */
  verificado?: boolean;
  /**
   * Solo para `id: 'inflacion'`: la meta de inflación del Banco de la República, cuando
   * la misma respuesta de BanRep trae una serie que la nombra. No sustituye la meta fija
   * (3 %) que usa la copia de la tarjeta; queda disponible para verificarla más adelante.
   */
  metaInflacion?: number;
}

/** Una serie tal como la entrega la respuesta de BanRep. */
export interface SerieBanRep {
  nombre: string;
  unidad: string;
  descripcionPeriodicidad: string;
  /** Pares [epochMs, valor]. `valor` puede venir `null` cuando falta el dato de ese punto. */
  data: Array<[number, number | null]>;
}

/** La forma completa de la respuesta de `consultaMenuXId`. */
export interface RespuestaBanRep {
  SERIES: SerieBanRep[];
}
