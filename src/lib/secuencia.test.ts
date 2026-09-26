import { describe, it, expect } from 'vitest';
import { acercar, cuadroParaProgreso } from './secuencia';

describe('cuadroParaProgreso', () => {
  it('progreso 0 → primer cuadro', () => {
    expect(cuadroParaProgreso(0, 185)).toBe(0);
  });

  it('progreso 1 → último cuadro', () => {
    expect(cuadroParaProgreso(1, 185)).toBe(184);
  });

  it('progreso a la mitad → cuadro a la mitad, redondeado', () => {
    expect(cuadroParaProgreso(0.5, 185)).toBe(92);
  });

  it('progreso negativo se recorta a 0', () => {
    expect(cuadroParaProgreso(-0.4, 185)).toBe(0);
  });

  it('progreso mayor que 1 se recorta al último cuadro', () => {
    expect(cuadroParaProgreso(1.7, 185)).toBe(184);
  });

  it('NaN → 0', () => {
    expect(cuadroParaProgreso(NaN, 185)).toBe(0);
  });

  it('total <= 0 → 0, sin importar el progreso', () => {
    expect(cuadroParaProgreso(0.5, 0)).toBe(0);
    expect(cuadroParaProgreso(0.5, -3)).toBe(0);
  });

  it('total de 1 cuadro: siempre el cuadro 0', () => {
    expect(cuadroParaProgreso(0, 1)).toBe(0);
    expect(cuadroParaProgreso(1, 1)).toBe(0);
  });
});

describe('acercar', () => {
  it('se acerca al objetivo sin llegar de un salto (factor intermedio)', () => {
    const siguiente = acercar(0, 1, 0.18);
    expect(siguiente).toBeCloseTo(0.18);
    expect(siguiente).toBeLessThan(1);
  });

  it('converge al objetivo tras varias llamadas', () => {
    let actual = 0;
    for (let i = 0; i < 200; i++) actual = acercar(actual, 1, 0.18);
    expect(actual).toBe(1);
  });

  it('se ajusta exactamente al objetivo cuando la diferencia es menor que epsilon', () => {
    expect(acercar(0.999, 1, 0.18, 0.01)).toBe(1);
    expect(acercar(1.0, 0.995, 0.18, 0.01)).toBe(0.995);
  });

  it('factor 0: no se mueve', () => {
    expect(acercar(0.2, 0.9, 0)).toBe(0.2);
  });

  it('factor 1: salta directo al objetivo', () => {
    expect(acercar(0.2, 0.9, 1)).toBeCloseTo(0.9);
  });

  it('factor fuera de [0,1] se recorta', () => {
    expect(acercar(0, 1, -5)).toBe(0);
    expect(acercar(0, 1, 5)).toBe(1);
  });

  it('objetivo o actual no finito: devuelve el objetivo', () => {
    expect(acercar(NaN, 0.5, 0.18)).toBe(0.5);
  });
});
