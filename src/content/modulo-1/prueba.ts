// ============================================================
// prueba.ts — las 6 situaciones de la prueba de paso del Módulo 1.
//
// METODOLOGIA.md §5 y TEMARIO.md §3: nunca preguntan una definición, siempre una decisión
// real. Cada una pone a prueba UNA lección (por su `keyConcept`, ya cerrado en temario.ts).
//
// Cubre las lecciones 1, 2, 3, 4, 5 y 6. Las lecciones 7-10 todavía no tienen contenido
// jugable (ver PLAN §Ola 4): cuando lo tengan, se añaden aquí sus propias situaciones y el
// umbral sigue siendo "como mucho una mal" sobre el total (src/lib/prueba.ts, umbralAprobar).
//
// Las cifras usadas ya estaban en el docx o en el contenido ya construido de L1-L3; no se
// inventa ninguna nueva.
// ============================================================

import type { SituacionPrueba } from '@/lib/prueba';
import { TEMARIO_MODULO_1 } from './temario';

/** El concepto clave sale literal de temario.ts: nunca se duplica a mano, para que no diverja. */
function conceptoDe(leccion: number): string {
  const entry = TEMARIO_MODULO_1.find((l) => l.number === leccion);
  if (!entry) throw new Error(`prueba.ts: no existe la lección ${leccion} en el temario`);
  return entry.keyConcept;
}

export const PRUEBA_MODULO_1: readonly SituacionPrueba[] = [
  {
    id: 'm1-oferta-sin-respaldo',
    leccion: 1,
    tema: 'qué es el dinero',
    concepto: conceptoDe(1),
    situacion:
      'Un conocido te dice: "préstame $500.000 y en 3 meses te devuelvo $600.000, de forma segura." No hay ningún papel de por medio, solo su palabra.',
    opciones: [
      { id: 'confiar', texto: 'Prestárselos: si es de confianza, no hace falta más' },
      { id: 'preguntar', texto: 'Preguntarle en qué va a poner esa plata para devolverte tanto de más' },
      { id: 'negarse', texto: 'No prestarle: nadie garantiza un 20 % en 3 meses sin decir de dónde sale' },
    ],
    correctaId: 'negarse',
  },
  {
    id: 'm1-precio-que-subio',
    leccion: 2,
    tema: 'la inflación',
    concepto: conceptoDe(2),
    situacion: 'Ese almuerzo que hace 5 años costaba $10.000 hoy cuesta $18.000. Tu sueldo, en ese tiempo, no cambió.',
    opciones: [
      { id: 'culpa-vendedor', texto: 'El que vende almuerzos está cobrando de más' },
      { id: 'inflacion', texto: 'Con el tiempo, el mismo dinero compra menos: es lo normal, no un abuso puntual' },
      { id: 'ignorar', texto: 'No cambia nada: son solo $8.000 más' },
    ],
    correctaId: 'inflacion',
  },
  {
    id: 'm1-donde-crece-mas',
    leccion: 3,
    tema: 'el interés compuesto',
    concepto: conceptoDe(3),
    situacion: 'Vas a dejar $500.000 quietos 5 años. Un banco te ofrece interés simple; otro, compuesto, a la misma tasa.',
    opciones: [
      { id: 'igual', texto: 'Da igual: a la misma tasa, terminan en el mismo número' },
      { id: 'simple', texto: 'El interés simple, porque paga cada año sin esperar' },
      { id: 'compuesto', texto: 'El compuesto: cada año gana sobre lo que ya había ganado antes' },
    ],
    correctaId: 'compuesto',
  },
  {
    id: 'm1-guardar-o-hacer-crecer',
    leccion: 4,
    tema: 'la diferencia entre ahorrar e invertir',
    concepto: conceptoDe(4),
    situacion: 'Tienes $500.000 que no vas a necesitar en 3 años y quieres que valgan más para entonces.',
    opciones: [
      { id: 'alcancia', texto: 'Guardarlos en una alcancía: ahí están seguros y quietos' },
      { id: 'hacerlos-trabajar', texto: 'Ponerlos en algo que pueda hacerlos crecer, aceptando algo de riesgo' },
      { id: 'gastarlos', texto: 'Gastarlos ahora: en 3 años van a valer menos igual' },
    ],
    correctaId: 'hacerlos-trabajar',
  },
  {
    id: 'm1-celular-a-cuotas',
    leccion: 5,
    tema: 'cuándo una deuda te sirve y cuándo no',
    concepto: conceptoDe(5),
    situacion: 'Tu celular funciona bien. Uno nuevo te sale a 24 cuotas. Un curso que te puede conseguir trabajo también sale a cuotas.',
    opciones: [
      { id: 'ninguna', texto: 'Ninguna de las dos: toda deuda es mala' },
      { id: 'celular', texto: 'El celular: se disfruta ya, y la deuda es la misma' },
      { id: 'curso', texto: 'El curso: genera algo que vale más que lo que cuesta la deuda' },
    ],
    correctaId: 'curso',
  },
  {
    id: 'm1-mes-no-cuadra',
    leccion: 6,
    tema: 'cómo armar tu presupuesto',
    concepto: conceptoDe(6),
    situacion: 'Se te volvió a acabar la plata antes de que terminara el mes, y no sabes bien en qué se fue.',
    opciones: [
      { id: 'ganar-mas', texto: 'Lo único que sirve es conseguir más ingresos' },
      { id: 'anotar', texto: 'Separar en qué es fijo, qué es variable y qué es ahorro, y mirar los tres' },
      { id: 'nada', texto: 'No hay mucho que hacer: siempre pasa' },
    ],
    correctaId: 'anotar',
  },
];
