import { describe, it, expect } from 'vitest';
import {
  precioEnAnio,
  unidadesQueAlcanzan,
  sobrante,
  tiquetesEje,
  dominioPrecios,
  escalaY,
  puntosGrafica,
  GEOMETRIA_DEFAULT,
} from './graficaConectada';

describe('precioEnAnio', () => {
  it('en el año 0 devuelve el precio original', () => {
    expect(precioEnAnio(2500, 6.24, 0)).toBe(2500);
  });

  it('compone la inflación año a año y redondea a $50', () => {
    // 2500 * 1.0624^3 = 2999.9... → redondeado a la moneda más cercana de $50
    const bruto = 2500 * Math.pow(1.0624, 3);
    const esperado = Math.round(bruto / 50) * 50;
    expect(precioEnAnio(2500, 6.24, 3)).toBe(esperado);
    expect(precioEnAnio(2500, 6.24, 3) % 50).toBe(0);
  });

  it('con inflación 0 el precio no cambia en ningún año', () => {
    expect(precioEnAnio(3000, 0, 5)).toBe(3000);
    expect(precioEnAnio(3000, 0, 10)).toBe(3000);
  });

  it('a mayor inflación, mayor precio futuro', () => {
    const bajo = precioEnAnio(2500, 6.24, 10);
    const alto = precioEnAnio(2500, 12, 10);
    expect(alto).toBeGreaterThan(bajo);
  });
});

describe('unidadesQueAlcanzan', () => {
  it('divide y trunca hacia abajo (no hay medias empanadas)', () => {
    expect(unidadesQueAlcanzan(10000, 2500)).toBe(4);
    expect(unidadesQueAlcanzan(10000, 3000)).toBe(3);
    expect(unidadesQueAlcanzan(10000, 3334)).toBe(2);
  });

  it('devuelve 0 si el precio o la plata no son positivos', () => {
    expect(unidadesQueAlcanzan(10000, 0)).toBe(0);
    expect(unidadesQueAlcanzan(10000, -100)).toBe(0);
    expect(unidadesQueAlcanzan(0, 2500)).toBe(0);
  });

  it('nunca devuelve más unidades de las que de verdad alcanzan', () => {
    const unidades = unidadesQueAlcanzan(10000, 2500);
    expect(unidades * 2500).toBeLessThanOrEqual(10000);
  });
});

describe('sobrante', () => {
  it('cuando la plata alcanza justo, no sobra nada', () => {
    expect(sobrante(10000, 2500)).toBe(0);
  });

  it('cuando no alcanza para una empanada más, sobra el resto', () => {
    // Año 6 del escenario por defecto: precio $3.600, 2 empanadas, sobran $2.800.
    expect(sobrante(10000, 3600)).toBe(2800);
  });

  it('sin precio (0 o negativo) no se puede comprar nada: sobra toda la plata', () => {
    expect(sobrante(10000, 0)).toBe(10000);
    expect(sobrante(10000, -50)).toBe(10000);
  });

  it('sin plata no sobra nada', () => {
    expect(sobrante(0, 2500)).toBe(0);
    expect(sobrante(-100, 2500)).toBe(0);
  });

  it('nunca es negativo ni mayor que la plata original', () => {
    for (const precio of [100, 999, 2500, 3333, 10000, 20000]) {
      const s = sobrante(10000, precio);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(10000);
    }
  });
});

describe('tiquetesEje', () => {
  it('devuelve un único tiquete si el rango es cero o inválido', () => {
    expect(tiquetesEje(2500, 2500)).toEqual([2500]);
    expect(tiquetesEje(2500, 2000)).toEqual([2500]);
  });

  it('los tiquetes cubren todo el rango de datos', () => {
    const t = tiquetesEje(2500, 4585);
    expect(t[0]).toBeLessThanOrEqual(2500);
    expect(t.at(-1)!).toBeGreaterThanOrEqual(4585);
  });

  it('están ordenados, sin repetidos, y son 3 a 6 tiquetes para un rango típico', () => {
    const t = tiquetesEje(2500, 4585);
    expect(t.length).toBeGreaterThanOrEqual(3);
    expect(t.length).toBeLessThanOrEqual(6);
    expect(new Set(t).size).toBe(t.length);
    for (let i = 1; i < t.length; i++) {
      expect(t[i]).toBeGreaterThan(t[i - 1]);
    }
  });

  it('el paso entre tiquetes es un múltiplo "lindo" (1, 2, 5 o 10 por potencia de 10)', () => {
    const t = tiquetesEje(2500, 4585);
    const paso = t[1] - t[0];
    const magnitud = Math.pow(10, Math.floor(Math.log10(paso)));
    expect([1, 2, 5, 10]).toContain(Math.round(paso / magnitud));
  });
});

describe('dominioPrecios', () => {
  it('min y max del dominio son el primer y último tiquete', () => {
    const d = dominioPrecios(2500, 6.24, 10);
    expect(d.min).toBe(d.ticks[0]);
    expect(d.max).toBe(d.ticks.at(-1));
  });

  it('el dominio cubre el precio de hoy y el del último año', () => {
    const d = dominioPrecios(2500, 6.24, 10);
    expect(d.min).toBeLessThanOrEqual(precioEnAnio(2500, 6.24, 0));
    expect(d.max).toBeGreaterThanOrEqual(precioEnAnio(2500, 6.24, 10));
  });
});

describe('escalaY', () => {
  it('el precio más bajo del dominio cae en la base del área de la gráfica', () => {
    const { padding, height } = GEOMETRIA_DEFAULT;
    const y = escalaY(1000, { min: 1000, max: 2000 });
    expect(y).toBeCloseTo(height - padding.bottom);
  });

  it('el precio más alto del dominio cae en el tope del área de la gráfica', () => {
    const { padding } = GEOMETRIA_DEFAULT;
    const y = escalaY(2000, { min: 1000, max: 2000 });
    expect(y).toBeCloseTo(padding.top);
  });

  it('es la misma fórmula que usa puntosGrafica para el punto', () => {
    const dominio = dominioPrecios(2500, 6.24, 10);
    const puntos = puntosGrafica(2500, 6.24, 10);
    for (const p of puntos) {
      expect(p.y).toBeCloseTo(escalaY(p.precio, dominio));
    }
  });
});

describe('puntosGrafica', () => {
  it('devuelve un punto por cada año, de 0 a anios inclusive', () => {
    const puntos = puntosGrafica(2500, 6.24, 10);
    expect(puntos).toHaveLength(11);
    expect(puntos[0].anio).toBe(0);
    expect(puntos.at(-1)?.anio).toBe(10);
  });

  it('cada punto trae el mismo precio que precioEnAnio', () => {
    const puntos = puntosGrafica(2500, 6.24, 10);
    for (const p of puntos) {
      expect(p.precio).toBe(precioEnAnio(2500, 6.24, p.anio));
    }
  });

  it('el eje x va de padding.left a width - padding.right', () => {
    const puntos = puntosGrafica(2500, 6.24, 10);
    const { padding, width } = GEOMETRIA_DEFAULT;
    expect(puntos[0].x).toBeCloseTo(padding.left);
    expect(puntos.at(-1)?.x).toBeCloseTo(width - padding.right);
  });

  it('el precio más alto queda arriba (y menor) y el más bajo abajo (y mayor)', () => {
    const puntos = puntosGrafica(2500, 6.24, 10);
    const primero = puntos[0];
    const ultimo = puntos.at(-1)!;
    // con inflación positiva el precio sube con los años → y baja (sube en pantalla)
    expect(ultimo.precio).toBeGreaterThan(primero.precio);
    expect(ultimo.y).toBeLessThan(primero.y);
  });

  it('con anios = 0 no divide por cero y devuelve un único punto', () => {
    const puntos = puntosGrafica(2500, 6.24, 0);
    expect(puntos).toHaveLength(1);
    expect(Number.isFinite(puntos[0].x)).toBe(true);
    expect(Number.isFinite(puntos[0].y)).toBe(true);
  });

  it('respeta una geometría custom', () => {
    const geo = { width: 100, height: 100, padding: { top: 0, right: 0, bottom: 0, left: 0 } };
    const puntos = puntosGrafica(2500, 6.24, 4, geo);
    expect(puntos[0].x).toBe(0);
    expect(puntos.at(-1)?.x).toBe(100);
  });
});
