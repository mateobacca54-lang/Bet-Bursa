// ============================================================
// inicio.ts — Textos de la pantalla /inicio (entre la landing y el camino)
//
// La PREGUNTA de la apuesta sale literal del gancho de la lección 3 en temario.ts
// (no se copia a mano: si el temario cambia, esto cambia con él).
// Todo lo demás lo redactó el equipo siguiendo las reglas de tono de AGENTS.md:
// tutear, sin épica ni urgencia, ninguna palabra técnica sin explicar,
// y el error no castiga (no hay respuesta "mala": todas reciben una explicación).
// PENDIENTE de visto bueno del dueño: las 3 opciones y los textos de `reveal`.
// ============================================================

import { TEMARIO_MODULO_1 } from './modulo-1/temario';

const HOOK_LECCION_3 = TEMARIO_MODULO_1.find((l) => l.number === 3)?.hook ?? '';

export type WarmUpOptionId = 'same' | 'now' | 'later';

export interface WarmUpOption {
  id: WarmUpOptionId;
  label: string;
}

export interface WarmUpConfig {
  eyebrow: string;
  /** Literal del temario (gancho de la lección 3) */
  question: string;
  hint: string;
  options: readonly WarmUpOption[];
  /** La opción que apunta a lo que enseña el módulo. Nunca se marca como "correcta" en pantalla. */
  intendedId: WarmUpOptionId;
  /** Qué dice Monedita según lo que el usuario apostó. Siempre empieza reconociendo la apuesta. */
  reveal: Record<WarmUpOptionId, string>;
  outro: string;
  cta: string;
}

export const WARM_UP: WarmUpConfig = {
  eyebrow: 'Antes de empezar, una apuesta',
  question: HOOK_LECCION_3,
  hint: 'Elige lo que creas. Aquí nadie te califica.',
  options: [
    { id: 'same', label: 'Es lo mismo: son $100.000' },
    { id: 'now', label: 'Hoy vale más' },
    { id: 'later', label: 'En 10 años vale más' },
  ],
  intendedId: 'now',
  reveal: {
    same: 'Apostaste que es lo mismo. Mucha gente piensa así porque el número no cambia. Lo que cambia es lo que alcanzas a comprar: con el tiempo, los precios suben.',
    now: 'Apostaste que hoy vale más. Vas por buen camino: hoy la puedes gastar o hacer crecer, y dentro de 10 años los precios ya habrán subido.',
    later:
      'Apostaste que en 10 años vale más. Puede pasar si esa plata crece, pero guardada tal cual, con el tiempo compra menos porque los precios suben.',
  },
  outro: 'De eso trata el Módulo 1: por qué los precios suben y cómo hacer que el tiempo juegue a tu favor.',
  cta: 'Ver el camino',
};

/** Presentación de Monedita en la primera visita (redactado por el equipo, pendiente de visto bueno). */
export const MONEDITA_INTRO = {
  before: 'Hola, soy ',
  name: 'Monedita',
  after: '.',
  lead: 'Te acompaño mientras entiendes cómo funciona la plata.',
} as const;

/** Descripción del Módulo 1 en su tarjeta: la misma que ya usa /modulo/1 en su metadata. */
export const MODULO_1_BLURB =
  'Diez lecciones de menos de cinco minutos para entender cómo funciona el dinero en la vida real.';

/** Módulo 2: solo se sabe que trata de "hacer trabajar la plata" (greeting-copy.ts, estado completo). */
export const MODULO_2_PREVIEW = {
  number: 2,
  /** Título provisional: sale de "El Módulo 2 es sobre hacerla trabajar". Cambiarlo cuando exista el temario. */
  title: 'Hacer trabajar la plata',
  blurb: 'Lo que sigue cuando ya entiendes cómo funciona el dinero.',
} as const;

/** Texto del botón del héroe cuando el Módulo 1 está completo (el Módulo 2 aún no existe). */
export const COMPLETE_CTA = 'Volver al camino';
