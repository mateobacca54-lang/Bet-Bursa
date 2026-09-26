import { describe, expect, it } from 'vitest';
import { poseCelulares, separacionCelulares } from './celularesFlotantes';

describe('poseCelulares — extremos', () => {
  it('en p=0 los celulares están casi juntos, A adelante e inclinado a la izquierda', () => {
    const pose = poseCelulares(0);
    expect(pose.a.rotacion).toBeCloseTo(-3, 5);
    expect(pose.b.rotacion).toBeCloseTo(4, 5);
    // A a la izquierda del centro, B a la derecha.
    expect(pose.a.x).toBeLessThan(-50);
    expect(pose.b.x).toBeGreaterThan(-50);
    // B empieza más abajo que A (detrás, tapado en parte).
    expect(pose.b.y).toBeGreaterThan(pose.a.y);
  });

  it('en p=1 los celulares quedan apartados, con la inclinación final', () => {
    const pose = poseCelulares(1);
    expect(pose.a.rotacion).toBeCloseTo(-10, 5);
    expect(pose.b.rotacion).toBeCloseTo(8, 5);
  });

  it('la opacidad del pie es 0 en p=0 y 1 en p=1', () => {
    expect(poseCelulares(0).opacidadPie).toBe(0);
    expect(poseCelulares(1).opacidadPie).toBe(1);
  });
});

describe('poseCelulares — recorte de p fuera de [0, 1]', () => {
  it('p negativo se recorta a la pose de p=0', () => {
    expect(poseCelulares(-0.5)).toEqual(poseCelulares(0));
  });

  it('p mayor que 1 se recorta a la pose de p=1', () => {
    expect(poseCelulares(1.8)).toEqual(poseCelulares(1));
  });

  it('NaN u otro valor no finito no rompe: cualquier valor no finito se trata como p=0', () => {
    expect(poseCelulares(Number.NaN)).toEqual(poseCelulares(0));
    expect(poseCelulares(Number.POSITIVE_INFINITY)).toEqual(poseCelulares(0));
    expect(poseCelulares(Number.NEGATIVE_INFINITY)).toEqual(poseCelulares(0));
  });
});

describe('separacionCelulares', () => {
  it('crece de forma monótona entre p=0 y p=1', () => {
    const muestras = [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map(separacionCelulares);
    for (let i = 1; i < muestras.length; i++) {
      expect(muestras[i]).toBeGreaterThan(muestras[i - 1]);
    }
  });

  it('en p=0 los celulares casi se tocan; en p=1 quedan bien separados', () => {
    expect(separacionCelulares(0)).toBeLessThan(15);
    expect(separacionCelulares(1)).toBeGreaterThan(140);
  });
});

describe('poseCelulares — opacidad del pie entre los extremos', () => {
  it('es 0 antes de 0.55 y 1 después de 0.85', () => {
    expect(poseCelulares(0.3).opacidadPie).toBe(0);
    expect(poseCelulares(0.9).opacidadPie).toBe(1);
  });

  it('sube de forma monótona en la rampa central', () => {
    const rampa = [0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85].map((p) => poseCelulares(p).opacidadPie);
    for (let i = 1; i < rampa.length; i++) {
      expect(rampa[i]).toBeGreaterThanOrEqual(rampa[i - 1]);
    }
    expect(rampa[0]).toBe(0);
    expect(rampa[rampa.length - 1]).toBe(1);
  });
});
