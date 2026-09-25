import type { Transition, Variants } from 'framer-motion';

type Bezier = [number, number, number, number];

export const DURATION = {
  micro: 0.15,
  element: 0.25,
  scene: 0.4,
  story: 1.0,
};

/** Bajo prefers-reduced-motion todo se reduce a un cross-fade de esta duración (segundos). */
export const REDUCED_DURATION = 0.1;

export const EASE_OUT_EXPO: Bezier = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUART: Bezier = [0.25, 1, 0.5, 1];
export const EASE_IN_OUT: Bezier = [0.76, 0, 0.24, 1];

export const STAGGER = 0.06;
/** Máximo de elementos que se escalonan (PLAN §4.2). Del octavo en adelante entran juntos. */
export const MAX_STAGGERED = 8;

export const SPRING_DRAG = { type: 'spring', stiffness: 400, damping: 30 } as const satisfies Transition;
export const SPRING_THUMB = { type: 'spring', stiffness: 500, damping: 35 } as const satisfies Transition;
export const SPRING_SOFT = { type: 'spring', stiffness: 120, damping: 25 } as const satisfies Transition;

export const DRAW_PATH_DURATION = 0.9;

export const variants = {
  /**
   * CUÁNDO USARLA: Para entradas de elementos o pantallas nuevas (ej: saludo, cards de lección).
   * CUÁNDO NO: No usar en elementos que el usuario está arrastrando o elementos que requieren urgencia.
   */
  fadeUp: {
    y: [12, 0],
    opacity: [0, 1],
    transition: {
      duration: DURATION.scene,
      ease: EASE_OUT_EXPO,
    },
  },
  /**
   * CUÁNDO USARLA: Para animar el dibujo de una línea SVG progresivamente.
   * CUÁNDO NO: En cualquier propiedad de CSS distinta de pathLength.
   */
  drawPath: {
    pathLength: [0, 1],
    transition: {
      duration: DRAW_PATH_DURATION,
      ease: EASE_OUT_EXPO,
    },
  },
  /**
   * CUÁNDO USARLA: Para feedback de error formativo tras una equivocación del usuario.
   * CUÁNDO NO: No usar en exceso ni como castigo; no usar en hover pasivo.
   */
  shake: {
    x: [0, -5, 5, -4, 4, 0],
    transition: {
      duration: 0.32,
    },
  },
  /**
   * CUÁNDO USARLA: Cuando un personaje (Monedita) reacciona a algo que el usuario acaba de
   * hacer, por ejemplo al comprometer su apuesta. El salto dice "te vi": comunica causa.
   * CUÁNDO NO: Como movimiento en reposo o decoración; si nadie causó la reacción, no se usa.
   */
  hop: {
    y: [0, -16, 0],
    rotate: [0, -4, 0],
    transition: {
      duration: DURATION.scene,
      ease: EASE_OUT_QUART,
    },
  },
  /**
   * CUÁNDO USARLA: Al hacer hover sobre elementos interactivos elevables (ej: cards de lección).
   * CUÁNDO NO: En botones pequeños o elementos de texto simple.
   */
  hoverLift: {
    y: -2,
    transition: {
      duration: DURATION.micro,
      ease: EASE_OUT_QUART,
    },
  },
} satisfies Variants;

/**
 * Retraso de entrada del hijo número `index` (0 = primero) en una serie escalonada.
 *
 * CUÁNDO USARLA: nodos del camino, cards de una lista. Cada hijo lleva su propio
 * `transition={{ delay: staggerDelay(i) }}`; es explícito y no depende de que padre e
 * hijos compartan nombre de variante (por eso ya no existe una variante `staggerChildren`).
 * CUÁNDO NO: en más de MAX_STAGGERED elementos. A partir del octavo el retraso se
 * detiene, para que una lista larga no haga esperar al usuario.
 */
export function staggerDelay(index: number): number {
  if (!Number.isFinite(index) || index <= 0) return 0;
  return Math.min(Math.floor(index), MAX_STAGGERED - 1) * STAGGER;
}

/**
 * Con reduced=false devuelve las variantes tal cual (misma referencia).
 * Con reduced=true devuelve, por cada variante, una versión que SOLO conserva
 * `opacity` (si la tenía) y dura 0.1 s: sin desplazamiento, sin dibujo, sin shake.
 */
export function motionSafe<T extends Record<string, object>>(v: T, reduced: boolean): T {
  if (!reduced) {
    return v;
  }

  const safe: Record<string, Record<string, unknown>> = {};

  for (const key of Object.keys(v)) {
    const variant = v[key] as { opacity?: unknown };
    const safeVariant: Record<string, unknown> = {
      transition: {
        duration: 0.1,
      },
    };

    if (variant.opacity !== undefined) {
      safeVariant.opacity = variant.opacity;
    }

    safe[key] = safeVariant;
  }

  return safe as unknown as T;
}
