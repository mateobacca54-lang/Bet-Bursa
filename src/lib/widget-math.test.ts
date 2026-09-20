import { describe, expect, it } from 'vitest';
import {
  compoundValue,
  correctZoneId,
  niceTicks,
  percentOff,
  pickZoneAt,
  simpleValue,
  snapToStep,
  valueToY,
  yToValue,
  type ZoneRect,
} from './widget-math';

const ZONES = [
  { id: 'trueque', label: 'Trueque', correctItemIds: ['bici', 'cromos'] },
  { id: 'dinero', label: 'Dinero', correctItemIds: ['bus'] },
];

describe('correctZoneId', () => {
  it('devuelve la zona que lista al ítem', () => {
    expect(correctZoneId(ZONES, 'bici')).toBe('trueque');
    expect(correctZoneId(ZONES, 'bus')).toBe('dinero');
  });
  it('devuelve null si el ítem no está en ninguna zona', () => {
    expect(correctZoneId(ZONES, 'fantasma')).toBeNull();
  });
});

describe('pickZoneAt', () => {
  const rects: ZoneRect[] = [
    { id: 'a', left: 0, top: 0, right: 100, bottom: 100 },
    { id: 'b', left: 120, top: 0, right: 220, bottom: 100 },
  ];
  it('detecta la zona bajo el punto', () => {
    expect(pickZoneAt(rects, 50, 50)).toBe('a');
    expect(pickZoneAt(rects, 170, 50)).toBe('b');
  });
  it('acepta soltar un poco fuera (margen para el dedo)', () => {
    expect(pickZoneAt(rects, 105, 50, 24)).toBe('a');
  });
  it('en el hueco entre zonas gana la de centro más cercano', () => {
    expect(pickZoneAt(rects, 108, 50, 24)).toBe('a');
    expect(pickZoneAt(rects, 113, 50, 24)).toBe('b');
  });
  it('devuelve null si se suelta lejos de todas', () => {
    expect(pickZoneAt(rects, 400, 400)).toBeNull();
  });
});

describe('interés simple y compuesto', () => {
  it('a 0 años ambos valen el capital', () => {
    expect(simpleValue(100000, 0.2, 0)).toBe(100000);
    expect(compoundValue(100000, 0.2, 0)).toBe(100000);
  });
  it('simple: 20 % anual sobre $100.000 durante 5 años → $200.000', () => {
    expect(simpleValue(100000, 0.2, 5)).toBeCloseTo(200000, 6);
  });
  it('compuesto: 20 % anual sobre $100.000 durante 5 años → $248.832', () => {
    expect(compoundValue(100000, 0.2, 5)).toBeCloseTo(248832, 4);
  });
  it('el segundo año del compuesto gana $24.000, no $20.000', () => {
    expect(compoundValue(100000, 0.2, 2) - compoundValue(100000, 0.2, 1)).toBeCloseTo(24000, 6);
  });
  it('con el mismo porcentaje, el compuesto nunca queda por debajo del simple', () => {
    for (let y = 0; y <= 10; y++) {
      expect(compoundValue(100000, 0.2, y)).toBeGreaterThanOrEqual(simpleValue(100000, 0.2, y));
    }
  });
});

describe('percentOff', () => {
  it('mide la diferencia como % del valor real', () => {
    expect(percentOff(220000, 200000)).toBeCloseTo(10, 10);
    expect(percentOff(180000, 200000)).toBeCloseTo(10, 10);
    expect(percentOff(200000, 200000)).toBe(0);
  });
  it('no divide entre cero', () => {
    expect(percentOff(0, 0)).toBe(0);
    expect(percentOff(5, 0)).toBe(Infinity);
  });
});

describe('snapToStep', () => {
  it('redondea al múltiplo más cercano y respeta los límites', () => {
    expect(snapToStep(103200, 100000, 260000, 5000)).toBe(105000);
    expect(snapToStep(50, 100000, 260000, 5000)).toBe(100000);
    expect(snapToStep(9e9, 100000, 260000, 5000)).toBe(260000);
  });
});

describe('yToValue / valueToY', () => {
  it('son inversas entre sí', () => {
    for (const v of [100000, 150000, 199999, 260000]) {
      const y = valueToY(v, 20, 320, 100000, 260000);
      expect(yToValue(y, 20, 320, 100000, 260000)).toBeCloseTo(v, 6);
    }
  });
  it('arriba es el máximo y abajo el mínimo, y recorta fuera de rango', () => {
    expect(yToValue(20, 20, 320, 100000, 260000)).toBe(260000);
    expect(yToValue(320, 20, 320, 100000, 260000)).toBe(100000);
    expect(yToValue(-999, 20, 320, 100000, 260000)).toBe(260000);
    expect(yToValue(999, 20, 320, 100000, 260000)).toBe(100000);
  });
});

describe('niceTicks', () => {
  it('da marcas redondas dentro del rango', () => {
    // raw = 200000/5 = 40000 → paso 5 × 10^4 = 50000
    expect(niceTicks(80000, 280000, 5)).toEqual([100000, 150000, 200000, 250000]);
  });
  it('los pasos son uniformes', () => {
    const t = niceTicks(0, 1000, 5);
    const deltas = t.slice(1).map((v, i) => v - t[i]);
    expect(new Set(deltas).size).toBe(1);
  });
  it('rango inválido no rompe', () => {
    expect(niceTicks(5, 5)).toEqual([5]);
  });
});
