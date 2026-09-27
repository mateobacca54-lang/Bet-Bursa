import { describe, it, expect } from 'vitest';
import { originFromRect, shouldOfferReveal } from './widget-feedback';

describe('originFromRect', () => {
  it('centra el origen en el centro del rectángulo, en fracción del viewport', () => {
    const origin = originFromRect(
      { left: 100, top: 200, width: 400, height: 100 },
      { width: 1000, height: 1000 },
    );
    expect(origin).toEqual({ x: 0.3, y: 0.25 });
  });

  it('recorta a [0, 1] si el rectángulo cae fuera del viewport', () => {
    expect(originFromRect({ left: -500, top: -500, width: 10, height: 10 }, { width: 100, height: 100 })).toEqual({
      x: 0,
      y: 0,
    });
    expect(originFromRect({ left: 5000, top: 5000, width: 10, height: 10 }, { width: 100, height: 100 })).toEqual({
      x: 1,
      y: 1,
    });
  });

  it('cae al centro (0.5, 0.5) si el viewport no tiene tamaño válido', () => {
    expect(originFromRect({ left: 0, top: 0, width: 10, height: 10 }, { width: 0, height: 0 })).toEqual({
      x: 0.5,
      y: 0.5,
    });
  });
});

describe('shouldOfferReveal', () => {
  it('ofrece "Ver la respuesta" con un máximo de intentos finito y razonable', () => {
    expect(shouldOfferReveal(3)).toBe(true);
    expect(shouldOfferReveal(1)).toBe(true);
    expect(shouldOfferReveal(10)).toBe(true);
  });

  it('no lo ofrece cuando el widget no tiene tope real de intentos', () => {
    expect(shouldOfferReveal(Infinity)).toBe(false);
    expect(shouldOfferReveal(99)).toBe(false);
    expect(shouldOfferReveal(0)).toBe(false);
  });
});
