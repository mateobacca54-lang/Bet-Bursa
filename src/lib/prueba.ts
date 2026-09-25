// ============================================================
// prueba.ts — la lógica de la prueba de paso (funciones puras, sin DOM).
//
// METODOLOGIA.md §5: 5 o 6 situaciones reales, en desorden, nunca preguntas de definición.
// Se aprueba con "como mucho una mal". Si falla, se dice QUÉ TEMA falló (no el número de
// la pregunta) para que el repaso apunte a la lección correcta.
//
// A diferencia de los otros arquetipos, aquí SÍ hay una decisión correcta: no es "Elegir"
// (que no corrige, ver types.ts). Es su propio widget porque necesita agrupar los fallos
// por lección, no por pregunta.
// ============================================================

export interface OpcionPrueba {
  id: string;
  texto: string;
}

export interface SituacionPrueba {
  id: string;
  /** Qué lección de temario.ts pone a prueba esta situación */
  leccion: number;
  /** Frase corta del tema, para agrupar el resumen de fallos ("la diferencia entre ahorrar e invertir") */
  tema: string;
  /** El planteamiento: una decisión real, nunca "¿qué es...?" */
  situacion: string;
  opciones: readonly OpcionPrueba[];
  correctaId: string;
  /**
   * El concepto clave de esa lección (literal de temario.ts), para el repaso de 30 s si
   * falla. Vive aquí y no se busca en TEMARIO_MODULO_1 al mostrarlo: así PruebaDePaso no
   * depende de un módulo concreto y sirve para cualquier camino.
   */
  concepto: string;
}

export interface RespuestaPrueba {
  situacionId: string;
  elegidaId: string;
}

export interface FalloPrueba {
  leccion: number;
  tema: string;
}

export interface ResultadoPrueba {
  aciertos: number;
  total: number;
  aprobado: boolean;
  /** Solo las que falló, en el orden de las situaciones. Sin duplicar temas repetidos */
  fallos: FalloPrueba[];
}

/** Como mucho una mal, sobre cualquier cantidad de situaciones (METODOLOGIA §5: "5 de 6"). */
export function umbralAprobar(total: number): number {
  return Math.max(1, total - 1);
}

/**
 * Corrige la prueba. Una respuesta ausente (no llegó a contestar esa situación) cuenta
 * como fallo: no se puede aprobar sin haber decidido las seis.
 */
export function evaluarPrueba(
  situaciones: readonly SituacionPrueba[],
  respuestas: readonly RespuestaPrueba[]
): ResultadoPrueba {
  const porSituacion = new Map(respuestas.map((r) => [r.situacionId, r.elegidaId]));
  const fallos: FalloPrueba[] = [];
  let aciertos = 0;

  for (const s of situaciones) {
    if (porSituacion.get(s.id) === s.correctaId) {
      aciertos++;
    } else {
      fallos.push({ leccion: s.leccion, tema: s.tema });
    }
  }

  const total = situaciones.length;
  return { aciertos, total, aprobado: aciertos >= umbralAprobar(total), fallos };
}

/**
 * Fisher–Yates. `random` es inyectable para que el orden sea reproducible en pruebas;
 * en el navegador se usa Math.random. Nunca muta el arreglo que recibe.
 */
export function barajar<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
