import confetti from 'canvas-confetti';

export type Intensidad = 'corta' | 'grande';

export interface CelebrarOpciones {
  /** Si es `true` no lanza nada: el movimiento se quita, nunca la información. */
  reduced?: boolean;
  /** Punto de origen (0–1, 0–1). Solo aplica a 'corta'; 'grande' usa cañones fijos a los lados. */
  origen?: { x: number; y: number };
}

export interface RafagaConfeti {
  particleCount: number;
  spread: number;
  startVelocity: number;
  origin: { x: number; y: number };
  angle?: number;
  ticks?: number;
  scalar?: number;
  /** Milisegundos desde el inicio de la celebración en que se lanza esta ráfaga. */
  delayMs: number;
}

export interface ConfigCelebracion {
  bursts: RafagaConfeti[];
}

const ORIGEN_CORTA_POR_DEFECTO = { x: 0.5, y: 0.6 };

/**
 * configCelebracion — la parte PURA de celebrar(): cuántas ráfagas lanzar, con qué forma
 * y en qué momento, según la intensidad. No toca `document`, `window` ni canvas-confetti,
 * así que se prueba sin navegador (ver celebrar.test.ts).
 *
 * 'corta'  → una ráfaga (~60 partículas) desde `origen` (por defecto, centrada y algo abajo).
 * 'grande' → dos cañones laterales, cada uno con dos oleadas, acotado a ~700ms en total.
 */
export function configCelebracion(
  intensidad: Intensidad,
  origen: { x: number; y: number } = ORIGEN_CORTA_POR_DEFECTO
): ConfigCelebracion {
  if (intensidad === 'corta') {
    return {
      bursts: [
        {
          particleCount: 60,
          spread: 70,
          startVelocity: 35,
          ticks: 200,
          origin: origen,
          delayMs: 0,
        },
      ],
    };
  }

  const izquierda = { x: 0, y: 0.7 };
  const derecha = { x: 1, y: 0.7 };

  return {
    bursts: [
      { particleCount: 45, spread: 55, startVelocity: 55, angle: 60, ticks: 250, origin: izquierda, delayMs: 0 },
      { particleCount: 45, spread: 55, startVelocity: 55, angle: 120, ticks: 250, origin: derecha, delayMs: 0 },
      { particleCount: 30, spread: 60, startVelocity: 45, angle: 70, ticks: 250, origin: izquierda, delayMs: 350 },
      { particleCount: 30, spread: 60, startVelocity: 45, angle: 110, ticks: 250, origin: derecha, delayMs: 350 },
    ],
  };
}

interface PaletaColores {
  brand600: string;
  brand300: string;
  gold300: string;
  gold500: string;
  paper: string;
}

/**
 * Última instancia, solo si `getComputedStyle` no devuelve nada (por ejemplo, tokens.css
 * no cargó todavía). Deben coincidir SIEMPRE con src/styles/tokens.css — es la única
 * excepción de color crudo que permite DESIGN.md, y solo dentro de esta función.
 */
const PALETA_RESPALDO: PaletaColores = {
  brand600: '#F4501B',
  brand300: '#FFAD84',
  gold300: '#FFD466',
  gold500: '#F2A81D',
  paper: '#FBF7F1',
};

function leerPaleta(): PaletaColores {
  if (typeof document === 'undefined') {
    return PALETA_RESPALDO;
  }

  const estilos = getComputedStyle(document.documentElement);
  const leerToken = (token: string, respaldo: string): string => {
    const valor = estilos.getPropertyValue(token).trim();
    return valor || respaldo;
  };

  return {
    brand600: leerToken('--brand-600', PALETA_RESPALDO.brand600),
    brand300: leerToken('--brand-300', PALETA_RESPALDO.brand300),
    gold300: leerToken('--gold-300', PALETA_RESPALDO.gold300),
    gold500: leerToken('--gold-500', PALETA_RESPALDO.gold500),
    paper: leerToken('--paper', PALETA_RESPALDO.paper),
  };
}

/**
 * celebrar — envoltorio sobre canvas-confetti (DESIGN.md §7.2, "Celebración al acertar o
 * terminar"). Colores de marca y oro, leídos de tokens.css en el momento de llamarse.
 *
 * Con `reduced: true` no hace nada y devuelve de inmediato: el confeti no sale, pero el
 * "¡Lo lograste!" sí (AGENTS.md § Movimiento). SSR-safe: no toca `window` durante el import,
 * solo dentro de esta función y solo si el entorno lo tiene.
 */
export function celebrar(intensidad: Intensidad, opciones: CelebrarOpciones = {}): void {
  if (opciones.reduced) return;
  if (typeof window === 'undefined') return;

  const paleta = leerPaleta();
  const colors = [paleta.brand600, paleta.brand300, paleta.gold300, paleta.gold500, paleta.paper];
  const config = configCelebracion(intensidad, opciones.origen);

  for (const rafaga of config.bursts) {
    const lanzar = () => {
      confetti({
        particleCount: rafaga.particleCount,
        spread: rafaga.spread,
        startVelocity: rafaga.startVelocity,
        origin: rafaga.origin,
        angle: rafaga.angle,
        ticks: rafaga.ticks,
        scalar: rafaga.scalar,
        colors,
        disableForReducedMotion: true,
      });
    };

    if (rafaga.delayMs > 0) {
      window.setTimeout(lanzar, rafaga.delayMs);
    } else {
      lanzar();
    }
  }
}
