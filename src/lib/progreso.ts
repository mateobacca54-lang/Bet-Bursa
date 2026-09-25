import type { ModuleProgress } from './progress';
import type { TemarioEntry } from '@/content/modulo-1/temario';

// ============================================================
// progreso.ts — lógica pura de /progreso: el territorio recorrido, no un tablero.
//
// 06-PRODUCTO.md §3.3 dibuja un camino de 6 módulos (M1...M6). Hoy solo el Módulo 1
// es real; los demás no tienen temario aprobado. Mostrar 6 nombres inventados sería
// presentar como hecho algo que sigue siendo 🔶 Propuesta (TEMARIO.md). Por eso esta
// vista se limita a lo que YA existe: el Módulo 1 con sus datos reales, y el Módulo 2
// como "próximamente" — exactamente lo mismo que ya hace /inicio (getInicioView),
// para no inventar una segunda verdad sobre cuántos módulos hay.
//
// Lo que esta pantalla NO muestra, a propósito (METODOLOGIA §9): tiempo en pantalla,
// sesiones, velocidad, comparación con otras personas. Son métricas de asistencia.
// ============================================================

export type ModuloEstado = 'start' | 'in-progress' | 'complete' | 'soon';

export interface ModuloResumen {
  number: number;
  title: string;
  status: ModuloEstado;
  /** null si el módulo es "soon" (todavía no existe contenido) */
  completed: number | null;
  total: number | null;
  /** null si "soon", o si el módulo no tiene todavía prueba de paso que aprobar */
  pruebaAprobada: boolean | null;
  href: string | null;
}

export interface ConceptoPendiente {
  leccion: number;
  concepto: string;
}

export interface ProgresoView {
  modulos: ModuloResumen[];
  /** Lecciones hechas, sumando solo módulos con contenido real (hoy: solo el 1) */
  totalHechas: number;
  totalLecciones: number;
  /** Hasta 3 conceptos de lecciones ya hechas que aún no se repasaron, más antiguos primero */
  conceptosPendientes: readonly ConceptoPendiente[];
  /** null si el módulo no está completo todavía: no hay misión que mostrar */
  mision: { texto: string; hecha: boolean } | null;
}

const MAX_CONCEPTOS = 3;

export function getProgresoView(
  progress: ModuleProgress,
  lessons: readonly TemarioEntry[],
  moduloTitle: string,
  misionTexto: string,
  proximoModulo: { number: number; title: string }
): ProgresoView {
  const total = lessons.length;
  const validCompleted = new Set(progress.completedLessons.filter((l) => l >= 1 && l <= total));
  const completedCount = validCompleted.size;
  const completo = completedCount >= total && progress.pruebaAprobada;

  const modulo1: ModuloResumen = {
    number: 1,
    title: moduloTitle,
    status: completo ? 'complete' : completedCount > 0 ? 'in-progress' : 'start',
    completed: completedCount,
    total,
    pruebaAprobada: progress.pruebaAprobada,
    href: '/modulo/1',
  };

  const siguiente: ModuloResumen = {
    number: proximoModulo.number,
    title: proximoModulo.title,
    status: 'soon',
    completed: null,
    total: null,
    pruebaAprobada: null,
    href: null,
  };

  // Se repasa lo más antiguo primero: lo que lleva más tiempo esperando es lo que más
  // riesgo tiene de haberse olvidado (METODOLOGIA §3.7, repetición espaciada).
  const conceptosPendientes = lessons
    .filter((l) => validCompleted.has(l.number) && !progress.reviewedConcepts.includes(l.number))
    .slice(0, MAX_CONCEPTOS)
    .map((l) => ({ leccion: l.number, concepto: l.keyConcept }));

  return {
    modulos: [modulo1, siguiente],
    totalHechas: completedCount,
    totalLecciones: total,
    conceptosPendientes,
    mision: completedCount >= total ? { texto: misionTexto, hecha: progress.misionHecha } : null,
  };
}
