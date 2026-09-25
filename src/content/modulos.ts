// ============================================================
// modulos.ts — catálogo de los módulos de Bursa (docs/RUTA-DE-APRENDIZAJE.md §1 y §3)
//
// Los módulos se muestran por NOMBRE, nunca por número (RUTA-DE-APRENDIZAJE.md §1). El
// número solo existe por dentro: en la ruta de la URL (/modulo/1) y en los ids de progreso
// (modulo-1). Ningún texto que vea el usuario interpola `numero`.
//
// El nombre y la pregunta del Módulo 1 vienen literales de `modulo-1/temario.ts` (que a su
// vez viene del docx: no se reescribe). `MODULO_1.title` está en Título de cada palabra
// ("Fundamentos del Dinero"); `aOracion` lo pasa a cómo se muestra en pantalla, en formato
// oración ("Fundamentos del dinero").
//
// Los módulos 2 a 4 salen de la tabla "Tronco común" en RUTA-DE-APRENDIZAJE.md §3. Todavía
// no tienen temario propio, así que `disponible` es false.
// ============================================================

import { MODULO_1 } from './modulo-1/temario';

export interface ModuloCatalogo {
  /** Solo para la URL (/modulo/{numero}) y los ids de progreso. Nunca se muestra en pantalla. */
  numero: number;
  /** Id interno (progreso, base de datos), ej. "modulo-1". Nunca se muestra en pantalla. */
  id: string;
  /** El nombre del módulo, en formato oración. Esto es lo que ve el usuario. */
  nombre: string;
  /** La pregunta que resuelve el módulo (RUTA-DE-APRENDIZAJE.md §1 y §3). */
  pregunta: string;
  /** Si ya tiene temario y se puede empezar. */
  disponible: boolean;
}

/**
 * Pasa un texto a formato oración: primera letra en mayúscula, el resto en minúscula.
 * "Fundamentos del Dinero" → "Fundamentos del dinero".
 */
export function aOracion(texto: string): string {
  if (texto.length === 0) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export const MODULOS: readonly ModuloCatalogo[] = [
  {
    numero: 1,
    id: MODULO_1.id,
    nombre: aOracion(MODULO_1.title),
    pregunta: '¿Por qué la plata vale menos cada año?',
    disponible: true,
  },
  {
    numero: 2,
    id: 'modulo-2',
    nombre: 'Tu plata en el día a día',
    pregunta: '¿A dónde se va la plata del mes?',
    disponible: false,
  },
  {
    numero: 3,
    id: 'modulo-3',
    nombre: 'Cómo funciona la deuda',
    pregunta: '¿Cuánto termina costando esa compra a 24 cuotas?',
    disponible: false,
  },
  {
    numero: 4,
    id: 'modulo-4',
    nombre: 'Ahorrar con metas',
    pregunta: '¿Dónde guardo la plata para que no se derrita?',
    disponible: false,
  },
] as const;

/**
 * El nombre del módulo `numero`, para texto de pantalla ("Prueba de {nombreModulo(1)}").
 * Si el número no existe en el catálogo (no debería pasar: es un error de programación,
 * no un estado de usuario), devuelve un texto de emergencia en vez de lanzar, para no
 * tumbar una pantalla completa por un dato que no se muestra normalmente.
 */
export function nombreModulo(numero: number): string {
  return MODULOS.find((m) => m.numero === numero)?.nombre ?? `Módulo ${numero}`;
}

/** El módulo que sigue después de `numero`, o null si `numero` es el último del catálogo. */
export function siguienteModulo(numero: number): ModuloCatalogo | null {
  return MODULOS.find((m) => m.numero === numero + 1) ?? null;
}
