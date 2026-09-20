import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Transition, Variants } from 'framer-motion';
import {
  DURATION,
  STAGGER,
  MAX_STAGGERED,
  EASE_OUT_EXPO,
  EASE_OUT_QUART,
  EASE_IN_OUT,
  SPRING_DRAG,
  SPRING_THUMB,
  SPRING_SOFT,
  variants,
  motionSafe,
  staggerDelay
} from './motion';

describe('Sistema de Movimiento (Ola 0)', () => {
  it('las constantes de TS reflejan los valores de tokens.css', () => {
    const tokensPath = path.resolve(__dirname, '../styles/tokens.css');
    const css = fs.readFileSync(tokensPath, 'utf8');

    // Extraer duraciones
    const extractMs = (token: string) => {
      const match = css.match(new RegExp(`${token}:\\s*(\\d+)ms`));
      return match ? parseInt(match[1], 10) / 1000 : null;
    };

    expect(extractMs('--duration-micro')).toBe(DURATION.micro);
    expect(extractMs('--duration-element')).toBe(DURATION.element);
    expect(extractMs('--duration-scene')).toBe(DURATION.scene);
    expect(extractMs('--duration-story')).toBe(DURATION.story);
    expect(extractMs('--stagger')).toBe(STAGGER);

    // Extraer cubic-bezier
    const extractBezier = (token: string) => {
      const match = css.match(new RegExp(`${token}:\\s*cubic-bezier\\(([^)]+)\\)`));
      if (!match) return null;
      return match[1].split(',').map(n => parseFloat(n.trim()));
    };

    expect(extractBezier('--ease-out-expo')).toEqual(EASE_OUT_EXPO);
    expect(extractBezier('--ease-out-quart')).toEqual(EASE_OUT_QUART);
    expect(extractBezier('--ease-in-out')).toEqual(EASE_IN_OUT);
  });

  it('ninguna variante anima propiedades prohibidas', () => {
    const allowedKeys = new Set([
      'opacity', 'x', 'y', 'scale', 'scaleX', 'scaleY', 'rotate', 'pathLength', 'transition'
    ]);

    for (const [name, variant] of Object.entries(variants)) {
      for (const key of Object.keys(variant)) {
        expect(allowedKeys.has(key), `La variante '${name}' anima la propiedad prohibida '${key}'`).toBe(true);
      }
    }
  });

  it('motionSafe devuelve una referencia idéntica si reduced=false', () => {
    const original = { ...variants };
    const result = motionSafe(original, false);
    expect(result).toBe(original);
  });

  it('motionSafe(v, true) remueve animaciones pero conserva opacidad en 0.1s', () => {
    const safeVariants = motionSafe(variants, true) as Record<string, Record<string, unknown>>;

    for (const [name, variant] of Object.entries(safeVariants)) {
      // Debe tener transition.duration = 0.1
      expect(variant.transition).toEqual({ duration: 0.1 });

      // Las únicas claves permitidas son transition y opacity
      for (const key of Object.keys(variant)) {
        expect(['transition', 'opacity'].includes(key), `La variante segura '${name}' conservó '${key}'`).toBe(true);
      }

      // Si la variante original tenía opacity, la segura debe tener la misma opacity
      const original = variants[name as keyof typeof variants];
      if ('opacity' in original) {
        expect(variant.opacity).toEqual(original.opacity);
      }
    }
  });

  // Esta prueba es una guarda de TIPOS: la comprueba `tsc`, no vitest. Si alguien
  // vuelve a tipar mal una constante (p. ej. `type: string`, o `number[]` en vez de
  // tupla), `npx tsc --noEmit -p .` falla aquí y no en las tareas que la consumen.
  it('es compatible con los tipos de framer-motion', () => {
    const springs: Transition[] = [SPRING_DRAG, SPRING_THUMB, SPRING_SOFT];
    const eases: Transition[] = [
      { ease: EASE_OUT_EXPO },
      { ease: EASE_OUT_QUART },
      { ease: EASE_IN_OUT },
    ];
    const asVariants: Variants = variants;

    expect(springs).toHaveLength(3);
    expect(eases).toHaveLength(3);
    expect(Object.keys(asVariants)).toEqual(Object.keys(variants));
  });

  it('staggerDelay escalona hasta MAX_STAGGERED y luego se detiene', () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(3)).toBe(3 * STAGGER);
    expect(staggerDelay(MAX_STAGGERED - 1)).toBe((MAX_STAGGERED - 1) * STAGGER);
    expect(staggerDelay(20)).toBe((MAX_STAGGERED - 1) * STAGGER);
    expect(staggerDelay(2.9)).toBe(2 * STAGGER);
    expect(staggerDelay(-2)).toBe(0);
    expect(staggerDelay(NaN)).toBe(0);
  });
});
