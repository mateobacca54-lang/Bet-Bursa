import { describe, expect, it } from 'vitest';
import { MODULOS } from '@/content/modulos';
import { agruparPorTramo } from './ruta';

describe('agruparPorTramo', () => {
  it('divide el catálogo completo en tronco (4), trabajo (3) e inversión (3)', () => {
    const tramos = agruparPorTramo(MODULOS);
    expect(tramos.map((t) => t.modulos.length)).toEqual([4, 3, 3]);
  });

  it('el tronco común empieza en el módulo 1 y termina en el 4', () => {
    const [tronco] = agruparPorTramo(MODULOS);
    expect(tronco.modulos.map((m) => m.numero)).toEqual([1, 2, 3, 4]);
  });

  it('la rama "si ya trabajas" es 5-7 y la de inversión es 8-10', () => {
    const [, trabajo, inversion] = agruparPorTramo(MODULOS);
    expect(trabajo.modulos.map((m) => m.numero)).toEqual([5, 6, 7]);
    expect(inversion.modulos.map((m) => m.numero)).toEqual([8, 9, 10]);
  });

  it('cada tramo trae su etiqueta y su id, y no se pierde ni se repite ningún módulo', () => {
    const tramos = agruparPorTramo(MODULOS);
    expect(tramos.map((t) => t.id)).toEqual(['tronco', 'trabajo', 'inversion']);
    expect(tramos.every((t) => typeof t.etiqueta === 'string' && t.etiqueta.length > 0)).toBe(true);
    const total = tramos.reduce((acc, t) => acc + t.modulos.length, 0);
    expect(total).toBe(MODULOS.length);
  });

  it('con un catálogo más corto, los tramos vacíos quedan con longitud 0 (sin explotar)', () => {
    const tramos = agruparPorTramo(MODULOS.slice(0, 2));
    expect(tramos.map((t) => t.modulos.length)).toEqual([2, 0, 0]);
  });
});
