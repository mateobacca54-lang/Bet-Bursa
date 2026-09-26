import { describe, expect, it } from 'vitest';
import { ESCALAS_VIDEO_ENCOGE, FPS_VIDEO_ENCOGE, tiempoParaEscala } from './videoEncoge';

describe('ESCALAS_VIDEO_ENCOGE', () => {
  it('empieza en 1 y nunca crece', () => {
    expect(ESCALAS_VIDEO_ENCOGE[0]).toBe(1);
    for (let i = 1; i < ESCALAS_VIDEO_ENCOGE.length; i++) {
      expect(ESCALAS_VIDEO_ENCOGE[i]).toBeLessThanOrEqual(ESCALAS_VIDEO_ENCOGE[i - 1]);
    }
  });
});

describe('tiempoParaEscala', () => {
  it('la escala 1 es el primer cuadro', () => {
    expect(tiempoParaEscala(1)).toBe(0);
  });

  it('una escala más chica que el video se queda en el último cuadro', () => {
    expect(tiempoParaEscala(0.1)).toBe((ESCALAS_VIDEO_ENCOGE.length - 1) / FPS_VIDEO_ENCOGE);
  });

  it('busca el primer cuadro igual o más chico', () => {
    expect(tiempoParaEscala(0.9, [1, 0.95, 0.9, 0.85], 10)).toBeCloseTo(0.2);
    expect(tiempoParaEscala(0.92, [1, 0.95, 0.9, 0.85], 10)).toBeCloseTo(0.2);
  });

  it('una tabla vacía o fps inválido devuelven 0', () => {
    expect(tiempoParaEscala(0.5, [], 10)).toBe(0);
    expect(tiempoParaEscala(0.5, [1, 0.5], 0)).toBe(0);
  });
});
