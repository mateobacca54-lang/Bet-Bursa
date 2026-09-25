// ============================================================
// respaldo.ts — Snapshot de los indicadores económicos.
//
// Esta es la red de seguridad: si BanRep no responde (o la serie que buscamos no está
// donde la esperamos), la lección igual muestra un dato real, con su fecha y su fuente.
//
// Inflación, tasa de política, DTF y TRM se leyeron de la API del Banco de la República
// el 2026-09-25 (`verificado: true`). La usura salió de la certificación publicada en
// noticias (Resolución 1260 de 2026) y falta confirmarla en la página de la Superfinanciera.
// La tasa de usura no tiene serie en BanRep — la certifica mensualmente la
// Superintendencia Financiera — así que para ese indicador este snapshot ES la única
// fuente posible; solo se actualiza a mano, una vez al mes.
// ============================================================

import type { Indicador, IndicadorId } from './types';

/** Meta de inflación anual del Banco de la República. Fija, no viene de una serie. */
export const META_INFLACION = 3;

export const RESPALDO: Record<IndicadorId, Indicador> = {
  inflacion: {
    id: 'inflacion',
    valor: 6.24,
    fecha: '2026-08-31',
    periodo: 'agosto de 2026',
    fuente: 'Banco de la República, con datos del DANE',
    url: 'https://suameca.banrep.gov.co/estadisticas-economicas/informacionSerie/100001/inflacion_y_meta',
    origen: 'respaldo',
    verificado: true,
    metaInflacion: 3,
  },
  tasaPolitica: {
    id: 'tasaPolitica',
    valor: 12.0,
    fecha: '2026-09-25',
    periodo: '25 de septiembre de 2026',
    fuente: 'Banco de la República',
    url: 'https://www.banrep.gov.co/es/glosario/tasa-interes-politica-monetaria',
    origen: 'respaldo',
    verificado: true,
  },
  usura: {
    id: 'usura',
    valor: 29.24,
    fecha: '2026-09-01',
    periodo: 'septiembre de 2026',
    fuente: 'Superintendencia Financiera',
    url: 'https://www.superfinanciera.gov.co/publicaciones/10829/sala-de-prensacomunicados-de-prensa-interes-bancario-corriente-10829/',
    origen: 'respaldo',
    verificado: false,
  },
  cdt: {
    id: 'cdt',
    valor: 10.26,
    fecha: '2026-09-25',
    periodo: 'septiembre de 2026',
    fuente: 'Banco de la República',
    url: 'https://suameca.banrep.gov.co/estadisticas-economicas/',
    origen: 'respaldo',
    verificado: true,
  },
  trm: {
    id: 'trm',
    valor: 3329.61,
    fecha: '2026-09-25',
    periodo: '25 de septiembre de 2026',
    fuente: 'Banco de la República',
    url: 'https://suameca.banrep.gov.co/estadisticas-economicas/',
    origen: 'respaldo',
    verificado: true,
  },
};
