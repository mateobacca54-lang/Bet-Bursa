import { describe, it, expect } from 'vitest';
import { cubicBezier } from 'framer-motion';
import { timeForProgress } from './motion-math';
import { EASE_OUT_EXPO, EASE_OUT_QUART, EASE_IN_OUT } from './motion';

const easeOf = ([a, b, c, d]: readonly [number, number, number, number]) => cubicBezier(a, b, c, d);

describe('timeForProgress', () => {
  it('con una curva lineal es la identidad', () => {
    const linear = (t: number) => t;
    for (const p of [0.1, 0.25, 0.5, 0.9]) {
      expect(timeForProgress(linear, p)).toBeCloseTo(p, 6);
    }
  });

  it('extremos: 0 → 0, 1 → 1, y fuera de rango se acota', () => {
    const linear = (t: number) => t;
    expect(timeForProgress(linear, 0)).toBe(0);
    expect(timeForProgress(linear, 1)).toBe(1);
    expect(timeForProgress(linear, -3)).toBe(0);
    expect(timeForProgress(linear, 7)).toBe(1);
    expect(timeForProgress(linear, NaN)).toBe(0);
  });

  it('es la inversa de la curva: ease(timeForProgress(p)) ≈ p', () => {
    // Tolerancia de 0,005 (2 decimales) y no más fina: el cubicBezier de framer-motion
    // resuelve la curva de forma aproximada y, en tramos muy empinados como el arranque de
    // EASE_OUT_EXPO, deja errores del orden de 0,0004. La bisección en sí es exacta.
    for (const curve of [EASE_OUT_EXPO, EASE_OUT_QUART, EASE_IN_OUT]) {
      const ease = easeOf(curve);
      for (const p of [0.05, 0.3, 0.5, 0.75, 0.95]) {
        expect(ease(timeForProgress(ease, p))).toBeCloseTo(p, 2);
      }
    }
  });

  it('EASE_OUT_EXPO llega al 50 % mucho antes de la mitad del tiempo (por eso no se reparte lineal)', () => {
    const t = timeForProgress(easeOf(EASE_OUT_EXPO), 0.5);
    expect(t).toBeLessThan(0.25);
  });

  it('es monótona: más progreso nunca llega antes', () => {
    const ease = easeOf(EASE_OUT_EXPO);
    let prev = 0;
    for (let p = 0.05; p < 1; p += 0.05) {
      const t = timeForProgress(ease, p);
      expect(t).toBeGreaterThanOrEqual(prev);
      prev = t;
    }
  });
});
