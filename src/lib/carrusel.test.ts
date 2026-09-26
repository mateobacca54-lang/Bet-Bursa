import { describe, expect, it } from 'vitest';
import {
  anteriorIndice,
  clampIndice,
  debeAvanzarAuto,
  indiceDesdeScroll,
  siguienteIndice,
} from './carrusel';

describe('clampIndice', () => {
  it('recorta dentro de rango', () => {
    expect(clampIndice(1, 3)).toBe(1);
    expect(clampIndice(-2, 3)).toBe(0);
    expect(clampIndice(9, 3)).toBe(2);
  });

  it('redondea hacia abajo y trata datos inválidos como 0', () => {
    expect(clampIndice(1.9, 3)).toBe(1);
    expect(clampIndice(Number.NaN, 3)).toBe(0);
    expect(clampIndice(1, 0)).toBe(0);
  });
});

describe('siguienteIndice / anteriorIndice', () => {
  it('avanza y retrocede dentro del carrusel', () => {
    expect(siguienteIndice(0, 3)).toBe(1);
    expect(anteriorIndice(2, 3)).toBe(1);
  });

  it('no da vueltas: se detiene en los extremos', () => {
    expect(siguienteIndice(2, 3)).toBe(2);
    expect(anteriorIndice(0, 3)).toBe(0);
  });
});

describe('indiceDesdeScroll', () => {
  it('redondea a la tarjeta más cercana', () => {
    expect(indiceDesdeScroll(0, 500, 3)).toBe(0);
    expect(indiceDesdeScroll(240, 500, 3)).toBe(0);
    expect(indiceDesdeScroll(260, 500, 3)).toBe(1);
    expect(indiceDesdeScroll(1000, 500, 3)).toBe(2);
  });

  it('recorta fuera de rango y paso inválido', () => {
    expect(indiceDesdeScroll(5000, 500, 3)).toBe(2);
    expect(indiceDesdeScroll(-500, 500, 3)).toBe(0);
    expect(indiceDesdeScroll(100, 0, 3)).toBe(0);
  });
});

describe('debeAvanzarAuto', () => {
  it('avanza mientras no sea el último paso', () => {
    expect(debeAvanzarAuto(0, 3)).toBe(true);
    expect(debeAvanzarAuto(1, 3)).toBe(true);
  });

  it('se detiene en el último: no vuelve en bucle', () => {
    expect(debeAvanzarAuto(2, 3)).toBe(false);
  });
});
