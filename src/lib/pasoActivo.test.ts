import { describe, expect, it } from 'vitest';
import { pasoActivo } from './pasoActivo';

describe('pasoActivo', () => {
  it('reparte el tramo en partes iguales', () => {
    expect(pasoActivo(0, 3)).toBe(0);
    expect(pasoActivo(0.32, 3)).toBe(0);
    expect(pasoActivo(0.34, 3)).toBe(1);
    expect(pasoActivo(0.7, 3)).toBe(2);
  });

  it('el final exacto es el último paso, no uno de más', () => {
    expect(pasoActivo(1, 3)).toBe(2);
  });

  it('recorta fuera de rango y datos inválidos', () => {
    expect(pasoActivo(-0.5, 3)).toBe(0);
    expect(pasoActivo(4, 3)).toBe(2);
    expect(pasoActivo(Number.NaN, 3)).toBe(0);
    expect(pasoActivo(0.5, 0)).toBe(0);
  });
});
