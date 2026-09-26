import { describe, expect, it } from 'vitest';
import {
  ahorroAcumulado,
  construirPuntosGrafica,
  escalaPorArea,
  etapaFrasco,
  MONTO_MENSUAL_DEFECTO,
  MONTOS_MENSUALES,
  opacidadesFrasco,
  poderDeCompra,
  puntoEnGrafica,
  tasaMensualDesdeEA,
  trazoSvg,
  valorFuturoMensual,
} from './crecimiento';

describe('poderDeCompra', () => {
  it('a 0 años, el poder de compra es el mismo monto', () => {
    expect(poderDeCompra(100000, 0.0624, 0)).toBe(100000);
  });
  it('con inflación 0, nunca se encoge sin importar los años', () => {
    expect(poderDeCompra(100000, 0, 10)).toBe(100000);
  });
  it('con inflación real de Colombia, coincide con la fórmula de valor presente', () => {
    expect(poderDeCompra(100000, 0.0624, 10)).toBeCloseTo(54590.79, 1);
  });
  it('a más años, menos poder de compra (monótona decreciente)', () => {
    const a5 = poderDeCompra(100000, 0.0624, 5);
    const a10 = poderDeCompra(100000, 0.0624, 10);
    expect(a10).toBeLessThan(a5);
    expect(a5).toBeLessThan(100000);
  });
});

describe('escalaPorArea', () => {
  it('mismo valor que la base: sin cambio', () => {
    expect(escalaPorArea(100, 100)).toBe(1);
  });
  it('un cuarto del valor da la mitad de escala (el área, no el lado, es proporcional)', () => {
    expect(escalaPorArea(25, 100)).toBeCloseTo(0.5, 10);
  });
  it('valor negativo se recorta a un área de 0', () => {
    expect(escalaPorArea(-50, 100)).toBe(0);
  });
  it('base no positiva no tiene proporción posible: devuelve 1 sin cambio', () => {
    expect(escalaPorArea(50, 0)).toBe(1);
    expect(escalaPorArea(50, -10)).toBe(1);
  });
});

describe('ahorroAcumulado', () => {
  it('0 meses no ha guardado nada', () => {
    expect(ahorroAcumulado(100000, 0)).toBe(0);
  });
  it('es una simple multiplicación, sin interés', () => {
    expect(ahorroAcumulado(100000, 120)).toBe(12_000_000);
  });
});

describe('tasaMensualDesdeEA', () => {
  it('tasa efectiva anual 0 da tasa mensual 0', () => {
    expect(tasaMensualDesdeEA(0)).toBe(0);
  });
  it('10,26% EA (un CDT típico) da la mensual equivalente conocida', () => {
    expect(tasaMensualDesdeEA(0.1026)).toBeCloseTo(0.008172466, 8);
  });
});

describe('valorFuturoMensual', () => {
  it('0 meses no ha crecido nada', () => {
    expect(valorFuturoMensual(100000, 0.008, 0)).toBe(0);
  });
  it('tasa 0 es la misma suma que ahorroAcumulado (nada que componer)', () => {
    expect(valorFuturoMensual(100000, 0, 120)).toBe(ahorroAcumulado(100000, 120));
  });
  it('con la tasa mensual del CDT de hoy, coincide con la fórmula de anualidad', () => {
    const r = tasaMensualDesdeEA(0.1026);
    expect(valorFuturoMensual(100000, r, 120)).toBeCloseTo(20_259_555.7, 0);
  });
  it('con interés compuesto, terminas con más que solo guardando (el punto del capítulo)', () => {
    const r = tasaMensualDesdeEA(0.1026);
    const fv = valorFuturoMensual(100000, r, 120);
    const guardado = ahorroAcumulado(100000, 120);
    expect(fv).toBeGreaterThan(guardado);
    expect(fv - guardado).toBeCloseTo(8_259_555.7, 0);
  });
});

describe('MONTOS_MENSUALES / MONTO_MENSUAL_DEFECTO', () => {
  it('trae las tres píldoras en orden de menos a más', () => {
    expect(MONTOS_MENSUALES).toEqual([50_000, 100_000, 200_000]);
  });
  it('el monto por defecto es una de las opciones', () => {
    expect(MONTOS_MENSUALES).toContain(MONTO_MENSUAL_DEFECTO);
  });
});

describe('construirPuntosGrafica', () => {
  it('el primer punto de cada línea está en el mes 0, sin nada acumulado', () => {
    const { ahorro, cdt } = construirPuntosGrafica(100000, 0.008, 120, 320, 170, 8);
    expect(ahorro[0].y).toBeCloseTo(170 - 8, 5); // altura máxima: 0 pesos
    expect(cdt[0].y).toBeCloseTo(170 - 8, 5);
  });
  it('el CDT (con interés) termina más arriba que lo guardado (menor y = más alto)', () => {
    const r = tasaMensualDesdeEA(0.1026);
    const { ahorro, cdt } = construirPuntosGrafica(100000, r, 120, 320, 170, 8);
    expect(cdt[cdt.length - 1].y).toBeLessThan(ahorro[ahorro.length - 1].y);
  });
  it('tiene un punto por cada mes de 0 a mesesTotal, inclusive', () => {
    const { ahorro } = construirPuntosGrafica(100000, 0.008, 120, 320, 170, 8);
    expect(ahorro).toHaveLength(121);
  });
  it('todos los puntos quedan dentro del viewBox (respetan el padding)', () => {
    const { ahorro, cdt } = construirPuntosGrafica(200000, 0.01, 120, 320, 170, 8);
    for (const p of [...ahorro, ...cdt]) {
      expect(p.x).toBeGreaterThanOrEqual(8);
      expect(p.x).toBeLessThanOrEqual(320 - 8);
      expect(p.y).toBeGreaterThanOrEqual(8);
      expect(p.y).toBeLessThanOrEqual(170 - 8);
    }
  });
});

describe('puntoEnGrafica', () => {
  const puntos = [
    { x: 0, y: 100 },
    { x: 10, y: 80 },
    { x: 20, y: 0 },
  ];
  it('en un mes entero, devuelve exactamente ese punto', () => {
    expect(puntoEnGrafica(puntos, 1)).toEqual({ x: 10, y: 80 });
  });
  it('a mitad de un tramo, interpola entre los dos puntos que lo rodean', () => {
    expect(puntoEnGrafica(puntos, 0.5)).toEqual({ x: 5, y: 90 });
  });
  it('se recorta a los extremos si el mes se sale del rango', () => {
    expect(puntoEnGrafica(puntos, -5)).toEqual({ x: 0, y: 100 });
    expect(puntoEnGrafica(puntos, 50)).toEqual({ x: 20, y: 0 });
  });
});

describe('trazoSvg', () => {
  it('arranca con M y sigue con L, uniendo todos los puntos', () => {
    const puntos = [
      { x: 0, y: 1 },
      { x: 2.5, y: 3 },
    ];
    expect(trazoSvg(puntos)).toBe('M0.00 1.00 L2.50 3.00');
  });
  it('una lista vacía da un trazo vacío', () => {
    expect(trazoSvg([])).toBe('');
  });
});

describe('etapaFrasco', () => {
  it('en el mes 0, etapa 1 (recién empezado)', () => {
    expect(etapaFrasco(0, 120)).toBe(1);
  });
  it('al llegar al total, etapa 4 (la última estampa)', () => {
    expect(etapaFrasco(120, 120)).toBe(4);
  });
  it('a la mitad del camino, a mitad entre la 1 y la 4', () => {
    expect(etapaFrasco(60, 120)).toBeCloseTo(2.5, 10);
  });
  it('se recorta a los extremos si el mes se pasa del total', () => {
    expect(etapaFrasco(200, 120)).toBe(4);
    expect(etapaFrasco(-10, 120)).toBe(1);
  });
  it('mesesTotal no positivo no divide por cero: se queda en la etapa 1', () => {
    expect(etapaFrasco(10, 0)).toBe(1);
  });
});

describe('opacidadesFrasco', () => {
  it('en el mes 0 solo se ve la primera estampa', () => {
    expect(opacidadesFrasco(0, 120)).toEqual([1, 0, 0, 0]);
  });
  it('al final solo se ve la última', () => {
    expect(opacidadesFrasco(120, 120)).toEqual([0, 0, 0, 1]);
  });
  it('a mitad de camino, la 2 y la 3 se funden a partes iguales', () => {
    expect(opacidadesFrasco(60, 120)).toEqual([0, 0.5, 0.5, 0]);
  });
  it('ninguna opacidad es negativa ni pasa de 1', () => {
    for (const m of [0, 15, 30, 45, 60, 75, 90, 105, 120]) {
      for (const o of opacidadesFrasco(m, 120)) {
        expect(o).toBeGreaterThanOrEqual(0);
        expect(o).toBeLessThanOrEqual(1);
      }
    }
  });
});
