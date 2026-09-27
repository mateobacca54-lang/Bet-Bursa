import { describe, expect, it } from 'vitest';
import { APUESTAS_MODULO_1, apuestaDeLeccion } from './apuestas';
import { calculateInflatedPrice } from '@/lib/format';

describe('apuestas del Módulo 1', () => {
  it('hay una apuesta por cada una de las 10 lecciones', () => {
    expect(APUESTAS_MODULO_1.map((a) => a.leccion)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('el acierto de cada apuesta es una de sus opciones, y los ids no se repiten', () => {
    for (const a of APUESTAS_MODULO_1) {
      const ids = a.opciones.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(a.acierto);
      expect(a.opciones.length).toBeGreaterThanOrEqual(2);
      expect(a.opciones.length).toBeLessThanOrEqual(3);
    }
  });

  it('las cifras de la lección 2 salen de la misma fórmula que el ejercicio', () => {
    // 8.000 con 6,5 % anual durante 10 años ≈ 15.000
    expect(Math.round(calculateInflatedPrice(8000, 0.065, 10) / 1000)).toBe(15);
  });

  it('las cifras de la lección 3 cuadran con el ejemplo', () => {
    expect(Math.round(100000 * 1.2 ** 5)).toBe(248832);
  });

  it('apuestaDeLeccion devuelve null fuera del módulo', () => {
    expect(apuestaDeLeccion(11)).toBeNull();
    expect(apuestaDeLeccion(3)?.acierto).toBe('compuesto');
  });
});
