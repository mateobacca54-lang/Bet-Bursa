// ============================================================
// landing-data.ts — datos de la página pública.
//
// Los títulos de las tarjetas son los del temario (literales). Ninguna cifra ni
// testimonio se inventa: la página no afirma nada que el producto no cumpla.
// ============================================================

import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import { getLessonContent } from '@/content/modulo-1/lecciones';
import type { EstampaScene } from '@/components/illus';

export interface LandingCard {
  lesson: number;
  /** Qué ilustración le toca (ver components/illus/Estampa.tsx) */
  scene: EstampaScene;
  title: string;
  /** La pregunta con la que arranca la lección (temario, literal). Va en el panel que se abre. */
  hook: string;
  /** La idea central de la lección (temario, literal). Va en el panel que se abre. */
  keyConcept: string;
  /** ¿La lección ya se puede hacer? Si no, la tarjeta dice "Pronto" */
  available: boolean;
}

function card(lesson: number, scene: EstampaScene): LandingCard {
  const entry = TEMARIO_MODULO_1.find((l) => l.number === lesson);
  if (!entry) throw new Error(`Lección ${lesson} no existe en el temario`);
  return {
    lesson,
    scene,
    title: entry.title,
    hook: entry.hook,
    keyConcept: entry.keyConcept,
    available: getLessonContent(lesson) !== null,
  };
}

/** Columna izquierda del héroe: se desplaza hacia arriba al hacer scroll. */
export const HERO_LEFT: readonly LandingCard[] = [
  card(2, 'empanada'),
  card(4, 'alcancia'),
  card(1, 'billete'),
];

/** Columna derecha: se desplaza en sentido contrario. */
export const HERO_RIGHT: readonly LandingCard[] = [
  card(3, 'monedas'),
  card(7, 'porcentaje'),
  card(5, 'tarjeta'),
];

export interface MarketShot {
  scene: EstampaScene;
  caption: string;
}

/**
 * Franja "el mercado que ya conoces": los tres son el mismo trato, a distinta escala.
 * Sustituye a las fotos de pisos de bolsa de los años 60: a alguien de 17 en Colombia,
 * señores de traje gritando en Nueva York le dicen "esto no es para ti", que es justo
 * la creencia que Bursa existe para romper.
 */
export const MARKET_SHOTS: readonly MarketShot[] = [
  { scene: 'plaza', caption: 'En la plaza el precio se negocia de frente.' },
  { scene: 'tienda', caption: 'En la tienda de la esquina ya viene puesto.' },
  { scene: 'pantalla', caption: 'En la bolsa es el mismo trato, en una pantalla.' },
];

// ─── "Aprendes haciendo": las escenas que cambian con el scroll ───
//
// Cada escena explica una parte de cómo funciona Bursa, y TODO lo que dice ya existe en el
// producto (por eso no hay promesas): una idea por pantalla y predecir antes de ver son los
// cinco pasos de cada lección; arrastrar, tocar o usar el teclado es el DragClassifier; el
// repaso de diez segundos es SpacedReview; "menos de cinco minutos" es el temario; el tramo
// que se dibuja al completar es el camino; y el progreso vive en localStorage (NamePrompt:
// "Se queda en este dispositivo"). Redactado por el equipo: pendiente de visto bueno.

export type HowTone = 'brand' | 'ink' | 'white';

export interface HowTile {
  pill: string;
  text: string;
  tone: HowTone;
}

export interface HowScene {
  id: string;
  /** Rótulo corto de la escena (botón del indicador) */
  label: string;
  /** Dos tarjetas a la izquierda del dispositivo */
  left: readonly [HowTile, HowTile];
  /** Una tarjeta alta a la derecha, con el texto centrado */
  right: HowTile;
}

export const HOW_SCENES: readonly HowScene[] = [
  {
    id: 'como-es',
    label: 'Cómo es',
    left: [
      { pill: 'Simple', text: 'Una idea por pantalla.', tone: 'brand' },
      { pill: 'Interactivo', text: 'Predices antes de ver la respuesta.', tone: 'ink' },
    ],
    right: { pill: 'Tuyo', text: 'Con tu vida: la empanada, el bus, el arriendo.', tone: 'white' },
  },
  {
    id: 'como-practicas',
    label: 'Cómo practicas',
    left: [
      { pill: 'Práctica', text: 'Arrastras, tocas o usas el teclado.', tone: 'brand' },
      { pill: 'Sin castigo', text: 'Si te equivocas, te explicamos por qué.', tone: 'ink' },
    ],
    right: { pill: 'Repaso', text: 'Si vuelves tras unos días, diez segundos para recordar.', tone: 'white' },
  },
  {
    id: 'como-avanzas',
    label: 'Cómo avanzas',
    left: [
      { pill: 'Corto', text: 'Menos de cinco minutos por lección.', tone: 'brand' },
      { pill: 'Tu gráfica', text: 'Cada lección que terminas dibuja un tramo más.', tone: 'ink' },
    ],
    right: { pill: 'Privado', text: 'Tu progreso se queda en tu dispositivo.', tone: 'white' },
  },
];
