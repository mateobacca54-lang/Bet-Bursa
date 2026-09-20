// ============================================================
// landing-data.ts — datos de la página pública.
//
// Los títulos de las tarjetas son los del temario (literales). Ninguna cifra ni
// testimonio se inventa: la página no afirma nada que el producto no cumpla.
// ============================================================

import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import { getLessonContent } from '@/content/modulo-1/lecciones';

export interface LandingCard {
  lesson: number;
  src: string;
  width: number;
  height: number;
  /** Punto de enfoque del recorte (CSS object-position) */
  position: string;
  /** Proporción de la tarjeta (CSS aspect-ratio): las fotos horizontales no se recortan en vertical */
  aspect: string;
  title: string;
  /** ¿La lección ya se puede hacer? Si no, la tarjeta dice "Pronto" */
  available: boolean;
}

function card(lesson: number, src: string, width: number, height: number, position = 'center', aspect = '3 / 4'): LandingCard {
  const entry = TEMARIO_MODULO_1.find((l) => l.number === lesson);
  if (!entry) throw new Error(`Lección ${lesson} no existe en el temario`);
  return { lesson, src, width, height, position, aspect, title: entry.title, available: getLessonContent(lesson) !== null };
}

/** Columna izquierda del héroe: se desplaza hacia arriba al hacer scroll. */
export const HERO_LEFT: readonly LandingCard[] = [
  card(2, '/landing/inflacion-franklin.jpg', 645, 645, 'center', '1 / 1'),
  card(4, '/landing/bolsa-bme.jpg', 1200, 800, '42% 50%', '4 / 3'),
  card(1, '/landing/dinero-100.png', 624, 352, '40% 50%', '16 / 10'),
];

/** Columna derecha: se desplaza en sentido contrario. */
export const HERO_RIGHT: readonly LandingCard[] = [
  card(3, '/landing/interes-papel.jpg', 736, 975, '50% 38%'),
  card(7, '/landing/piso-bolsa-vertical.jpg', 736, 920, 'center', '4 / 5'),
  card(5, '/landing/franklin-ojos.jpg', 558, 314, '50% 50%', '16 / 10'),
];

export interface MarketShot {
  src: string;
  alt: string;
  caption: string;
}

/** Franja "del piso de la bolsa a la pantalla". Los pies de foto describen la imagen, sin fechas ni lugares. */
export const MARKET_SHOTS: readonly MarketShot[] = [
  {
    src: '/landing/piso-bolsa-1960.jpg',
    alt: 'Operadores de traje reunidos alrededor de un puesto en el piso de una bolsa, en blanco y negro',
    caption: 'Antes: papeles, pizarras y gente gritando precios.',
  },
  {
    src: '/landing/celebracion.jpg',
    alt: 'Operadores celebrando con los brazos en alto entre papeles que caen, en blanco y negro',
    caption: 'Los mercados también se celebran… y se sufren.',
  },
  {
    src: '/landing/bolsa-bme.jpg',
    alt: 'Sala de una bolsa con tableros luminosos de cotizaciones bajo un techo decorado',
    caption: 'Hoy: los precios en tableros, y en tu bolsillo.',
  },
];
