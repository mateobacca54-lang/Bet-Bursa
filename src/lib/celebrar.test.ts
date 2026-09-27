import { describe, it, expect } from 'vitest';
import { celebrar, configCelebracion } from './celebrar';

describe('configCelebracion (parte pura de celebrar)', () => {
  it("'corta' lanza una sola ráfaga, desde el centro y un poco abajo por defecto", () => {
    const config = configCelebracion('corta');
    expect(config.bursts).toHaveLength(1);
    expect(config.bursts[0].origin).toEqual({ x: 0.5, y: 0.6 });
    expect(config.bursts[0].delayMs).toBe(0);
    expect(config.bursts[0].particleCount).toBeGreaterThan(0);
    expect(config.bursts[0].particleCount).toBeLessThanOrEqual(80);
  });

  it("'corta' respeta un origen personalizado", () => {
    const config = configCelebracion('corta', { x: 0.2, y: 0.9 });
    expect(config.bursts[0].origin).toEqual({ x: 0.2, y: 0.9 });
  });

  it("'grande' lanza dos cañones laterales (izquierda y derecha)", () => {
    const config = configCelebracion('grande');
    const izquierda = config.bursts.filter((b) => b.origin.x === 0);
    const derecha = config.bursts.filter((b) => b.origin.x === 1);
    expect(izquierda.length).toBeGreaterThan(0);
    expect(derecha.length).toBeGreaterThan(0);
    expect(izquierda.length).toBe(derecha.length);
  });

  it("'grande' queda acotado a ~700ms en total", () => {
    const config = configCelebracion('grande');
    const ultimoInicio = Math.max(...config.bursts.map((b) => b.delayMs));
    // La última ráfaga arranca antes de los 700ms; con sus ticks (~250) alcanza a
    // resolverse poco después, sin quedar una cola larga de confeti cayendo.
    expect(ultimoInicio).toBeLessThanOrEqual(700);
  });

  it("'grande' lanza más ráfagas que 'corta' (dos oleadas por cañón)", () => {
    const corta = configCelebracion('corta');
    const grande = configCelebracion('grande');
    expect(grande.bursts.length).toBeGreaterThan(corta.bursts.length);
  });

  it('todas las ráfagas traen valores utilizables por canvas-confetti', () => {
    for (const intensidad of ['corta', 'grande'] as const) {
      for (const rafaga of configCelebracion(intensidad).bursts) {
        expect(rafaga.particleCount).toBeGreaterThan(0);
        expect(rafaga.spread).toBeGreaterThan(0);
        expect(rafaga.startVelocity).toBeGreaterThan(0);
        expect(rafaga.delayMs).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('celebrar', () => {
  it('es SSR-safe: no lanza en un entorno sin window (como este test, en node)', () => {
    expect(() => celebrar('corta')).not.toThrow();
    expect(() => celebrar('grande')).not.toThrow();
  });

  it('con reduced:true no hace nada y no lanza, aunque hubiera window', () => {
    expect(() => celebrar('corta', { reduced: true })).not.toThrow();
    expect(() => celebrar('grande', { reduced: true, origen: { x: 0.1, y: 0.1 } })).not.toThrow();
  });
});
