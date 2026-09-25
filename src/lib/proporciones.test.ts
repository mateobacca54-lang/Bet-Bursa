import { describe, expect, it } from 'vitest';
import type { ProportionCategory } from './types';
import { initialProportions, proportionLimits, redistributeProportions, savingsIndex } from './proporciones';

const categories: ProportionCategory[] = [60, 30, 10].map((initialPercent, i) => ({ id: ['fijo', 'variable', 'ahorro'][i], label: String(i), colorToken: '--brand-600', initialPercent }));
const total = (values: number[]) => values.reduce((a, b) => a + b, 0);

describe('reparto proporcional', () => {
  it('subir una categoría baja las demás proporcionalmente sin mutar el original', () => {
    const values = [60, 30, 10];
    expect(redistributeProportions(categories, values, 2, 40)).toEqual([40, 20, 40]);
    expect(values).toEqual([60, 30, 10]);
  });
  it('redistribuye lo que no puede recibir una categoría al alcanzar su máximo', () => {
    const limited = categories.map((c, i) => ({ ...c, maxPercent: i === 1 ? 35 : 100 }));
    expect(redistributeProportions(limited, [60, 30, 10], 0, 0)).toEqual([0, 35, 65]);
  });
  it('no permite empujar otras por debajo de su mínimo', () => {
    const limited = categories.map((c, i) => ({ ...c, minPercent: i === 2 ? 10 : 0 }));
    expect(redistributeProportions(limited, [60, 30, 10], 0, 100)).toEqual([90, 0, 10]);
    expect(proportionLimits(limited, 0)).toEqual({ min: 0, max: 90 });
  });
  it('compensa redondeos al repartir entre tres', () => {
    expect(initialProportions(categories.map((c) => ({ ...c, initialPercent: 100 / 3 })))).toEqual([34, 33, 33]);
    expect(total(redistributeProportions(categories, [34, 33, 33], 0, 35))).toBe(100);
  });
  it('permite 100/0/0 y salir de ese extremo aunque los receptores tengan cero', () => {
    expect(redistributeProportions(categories, [60, 30, 10], 0, 100)).toEqual([100, 0, 0]);
    expect(redistributeProportions(categories, [100, 0, 0], 0, 0)).toEqual([0, 50, 50]);
  });
  it('normaliza estados iniciales respetando límites', () => {
    const limited = categories.map((c) => ({ ...c, initialPercent: 0, minPercent: 10, maxPercent: 40 }));
    expect(initialProportions(limited)).toEqual([34, 33, 33]);
  });
  it('conserva exactamente 100 y los límites tras movimientos sucesivos', () => {
    const limited = categories.map((c, i) => ({ ...c, minPercent: [10, 5, 10][i], maxPercent: [70, 60, 40][i] }));
    let values = initialProportions(limited);
    for (let target = -10; target <= 110; target++) {
      for (let i = 0; i < limited.length; i++) {
        values = redistributeProportions(limited, values, i, target);
        expect(total(values)).toBe(100);
        values.forEach((v, j) => {
          expect(Number.isInteger(v)).toBe(true);
          expect(v).toBeGreaterThanOrEqual(limited[j].minPercent!);
          expect(v).toBeLessThanOrEqual(limited[j].maxPercent!);
        });
      }
    }
  });
  it('rechaza configuraciones imposibles y números no finitos', () => {
    expect(() => initialProportions([])).toThrow(RangeError);
    expect(() => initialProportions(categories.map((c) => ({ ...c, minPercent: 40 })))).toThrow(RangeError);
    expect(() => initialProportions(categories.map((c) => ({ ...c, maxPercent: 30 })))).toThrow(RangeError);
    expect(() => redistributeProportions(categories, [60, 30, 10], 0, NaN)).toThrow(RangeError);
  });
  it('redondea límites fraccionarios hacia dentro', () => {
    expect(proportionLimits(categories.map((c) => ({ ...c, minPercent: 9.5, maxPercent: 80.5 })), 0)).toEqual({ min: 10, max: 80 });
  });
  it('identifica el ahorro por id y rechaza identificaciones ambiguas', () => {
    expect(savingsIndex(categories)).toBe(2);
    expect(() => savingsIndex(categories.slice(0, 2))).toThrow(RangeError);
    expect(() => savingsIndex([...categories, { ...categories[2], id: 'savings' }])).toThrow(RangeError);
  });
});
