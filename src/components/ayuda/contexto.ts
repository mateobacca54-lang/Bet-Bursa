// ============================================================
// contexto.ts — qué acompaña a un reporte, y qué NO.
//
// Un reporte que solo dice "no me funciona" no sirve para nada. Se manda con el contexto
// mínimo para poder reproducirlo, y con NADA que identifique a una persona.
//
// El progreso va a propósito: varios defectos del camino solo aparecen con cierto número de
// lecciones hechas (07-PLAN.md, ola 1). Sin ese dato no se pueden reproducir.
// ============================================================

export type MotivoReporte = 'se-ve-mal' | 'no-funciona' | 'no-entendi' | 'otra';

export const MOTIVOS: readonly { id: MotivoReporte; texto: string }[] = [
  { id: 'se-ve-mal', texto: 'Algo se ve mal' },
  { id: 'no-funciona', texto: 'Algo no funciona' },
  { id: 'no-entendi', texto: 'No entendí esta lección' },
  { id: 'otra', texto: 'Otra cosa' },
];

export interface ContextoReporte {
  /** Ruta donde estaba, sin nada más de la URL */
  ruta: string;
  /** Módulo y lección, si la ruta es de una lección */
  modulo: number | null;
  leccion: number | null;
  /** Tamaño de la ventana: la mitad de los defectos dependen del ancho */
  ancho: number;
  alto: number;
  /** Un camino entero de defectos vive aquí */
  movimientoReducido: boolean;
  /** Cuántas lecciones lleva hechas en ese módulo */
  leccionesHechas: number | null;
  navegador: string;
}

/** Saca el módulo y la lección de una ruta como /modulo/1/leccion/3. */
export function leerRuta(ruta: string): { modulo: number | null; leccion: number | null } {
  const m = /^\/modulo\/(\d+)(?:\/leccion\/(\d+))?/.exec(ruta);
  if (!m) return { modulo: null, leccion: null };
  return { modulo: Number(m[1]), leccion: m[2] ? Number(m[2]) : null };
}

/**
 * Deja el texto del navegador en algo corto y legible. No sirve para identificar a nadie:
 * solo dice de qué navegador y sistema se trata.
 */
export function resumirNavegador(ua: string): string {
  const motor =
    /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : 'otro';
  const sistema =
    /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'Mac'
    : /Linux/.test(ua) ? 'Linux'
    : 'otro';
  return `${motor} · ${sistema}`;
}

/** Lee cuántas lecciones lleva hechas, sin romper si no se puede leer el almacenamiento. */
export function leerLeccionesHechas(modulo: number | null): number | null {
  if (modulo === null) return null;
  try {
    const raw = localStorage.getItem(`bursa:progress:v1:modulo-${modulo}`);
    if (!raw) return 0;
    const p = JSON.parse(raw) as { completedLessons?: unknown };
    return Array.isArray(p.completedLessons) ? p.completedLessons.length : 0;
  } catch {
    return null;
  }
}

/** Reúne el contexto en el navegador. Nunca lanza. */
export function reunirContexto(): ContextoReporte {
  const ruta = typeof location === 'undefined' ? '' : location.pathname;
  const { modulo, leccion } = leerRuta(ruta);
  let movimientoReducido = false;
  try {
    movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    // algunos navegadores viejos no lo soportan
  }
  return {
    ruta,
    modulo,
    leccion,
    ancho: typeof innerWidth === 'number' ? innerWidth : 0,
    alto: typeof innerHeight === 'number' ? innerHeight : 0,
    movimientoReducido,
    leccionesHechas: leerLeccionesHechas(modulo),
    navegador: typeof navigator === 'undefined' ? '' : resumirNavegador(navigator.userAgent),
  };
}

/** La línea que se le muestra ANTES de enviar, para que sepa qué se manda. */
export function resumirContexto(c: ContextoReporte): string {
  const donde = c.leccion ? `la lección ${c.leccion} del módulo ${c.modulo}` : `la página ${c.ruta || '/'}`;
  return `Se envía desde dónde estás (${donde}), el tamaño de tu pantalla y tu avance en el módulo. Nada más.`;
}
