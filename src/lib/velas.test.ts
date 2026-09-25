import { describe, expect, it } from 'vitest';
import { calcularGeometriaVelas, crearGeneradorSeed, distancia, generarVelas, intensidadPorProximidad } from './velas';

describe('crearGeneradorSeed', () => {
  it('la misma seed produce siempre la misma secuencia', () => {
    const a = crearGeneradorSeed(42);
    const b = crearGeneradorSeed(42);
    const serieA = Array.from({ length: 10 }, () => a());
    const serieB = Array.from({ length: 10 }, () => b());
    expect(serieA).toEqual(serieB);
  });

  it('seeds distintas producen series distintas', () => {
    const a = crearGeneradorSeed(1);
    const b = crearGeneradorSeed(2);
    expect(a()).not.toBe(b());
  });

  it('siempre da números en [0, 1)', () => {
    const random = crearGeneradorSeed(7);
    for (let i = 0; i < 200; i++) {
      const n = random();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe('generarVelas', () => {
  it('genera exactamente `count` velas', () => {
    expect(generarVelas({ count: 50, seed: 1 })).toHaveLength(50);
  });

  it('count 0 da una lista vacía, no lanza', () => {
    expect(generarVelas({ count: 0, seed: 1 })).toEqual([]);
  });

  it('es determinista: misma seed, misma serie completa', () => {
    const opciones = { count: 40, seed: 123, startValue: 100, volatility: 0.05 };
    expect(generarVelas(opciones)).toEqual(generarVelas(opciones));
  });

  it('seeds distintas dan series distintas', () => {
    const a = generarVelas({ count: 40, seed: 1 });
    const b = generarVelas({ count: 40, seed: 2 });
    expect(a).not.toEqual(b);
  });

  it('cada vela es un OHLC válido: high es el máximo, low es el mínimo', () => {
    const velas = generarVelas({ count: 60, seed: 9, volatility: 0.08 });
    for (const v of velas) {
      expect(v.high).toBeGreaterThanOrEqual(Math.max(v.open, v.close));
      expect(v.low).toBeLessThanOrEqual(Math.min(v.open, v.close));
      expect(v.low).toBeGreaterThan(0);
    }
  });

  it('es una caminata: el open de una vela es el close de la anterior', () => {
    const velas = generarVelas({ count: 20, seed: 5 });
    for (let i = 1; i < velas.length; i++) {
      expect(velas[i].open).toBe(velas[i - 1].close);
    }
  });

  it('nunca cae a valores no positivos aunque la volatilidad sea alta', () => {
    const velas = generarVelas({ count: 200, seed: 3, startValue: 1, volatility: 0.9 });
    for (const v of velas) {
      expect(v.open).toBeGreaterThan(0);
      expect(v.close).toBeGreaterThan(0);
      expect(v.low).toBeGreaterThan(0);
    }
  });
});

describe('calcularGeometriaVelas', () => {
  const velas = generarVelas({ count: 10, seed: 1 });

  it('lista vacía si no hay velas, o si el lienzo no tiene tamaño', () => {
    expect(calcularGeometriaVelas([], { width: 300, height: 100 })).toEqual([]);
    expect(calcularGeometriaVelas(velas, { width: 0, height: 100 })).toEqual([]);
    expect(calcularGeometriaVelas(velas, { width: 300, height: 0 })).toEqual([]);
  });

  it('devuelve una geometría por cada vela', () => {
    expect(calcularGeometriaVelas(velas, { width: 300, height: 100 })).toHaveLength(velas.length);
  });

  it('todo queda dentro del lienzo (respeta el padding vertical)', () => {
    const height = 100;
    const paddingY = 0.1;
    const geometrias = calcularGeometriaVelas(velas, { width: 300, height, paddingY });
    for (const g of geometrias) {
      expect(g.mechaY1).toBeGreaterThanOrEqual(height * paddingY - 0.01);
      expect(g.mechaY2).toBeLessThanOrEqual(height * (1 - paddingY) + 0.01);
      expect(g.x).toBeGreaterThanOrEqual(0);
      expect(g.x + g.ancho).toBeLessThanOrEqual(300 + 0.01);
    }
  });

  it('las columnas van en orden, de izquierda a derecha', () => {
    const geometrias = calcularGeometriaVelas(velas, { width: 300, height: 100 });
    for (let i = 1; i < geometrias.length; i++) {
      expect(geometrias[i].centroX).toBeGreaterThan(geometrias[i - 1].centroX);
    }
  });

  it('la mecha siempre envuelve al cuerpo (high por encima, low por debajo)', () => {
    const geometrias = calcularGeometriaVelas(velas, { width: 300, height: 100 });
    for (const g of geometrias) {
      expect(g.mechaY1).toBeLessThanOrEqual(g.cuerpoY + 0.01);
      expect(g.mechaY2).toBeGreaterThanOrEqual(g.cuerpoY + g.cuerpoAlto - 0.01);
    }
  });

  it('marca `sube` según close vs. open, no según arriba/abajo en pantalla', () => {
    const geometrias = calcularGeometriaVelas(velas, { width: 300, height: 100 });
    velas.forEach((v, i) => {
      expect(geometrias[i].sube).toBe(v.close >= v.open);
    });
  });

  it('una vela doji (open === close) sigue teniendo un cuerpo visible', () => {
    const doji = [{ open: 100, high: 101, low: 99, close: 100 }];
    const [g] = calcularGeometriaVelas(doji, { width: 100, height: 100 });
    expect(g.cuerpoAlto).toBeGreaterThan(0);
  });
});

describe('distancia', () => {
  it('la distancia de un punto a sí mismo es 0', () => {
    expect(distancia(10, 10, 10, 10)).toBe(0);
  });

  it('calcula la distancia euclidiana (3-4-5)', () => {
    expect(distancia(0, 0, 3, 4)).toBe(5);
  });
});

describe('intensidadPorProximidad', () => {
  it('a distancia 0 es máxima (1)', () => {
    expect(intensidadPorProximidad(0, 100)).toBe(1);
  });

  it('en el borde del radio (o más allá) es 0', () => {
    expect(intensidadPorProximidad(100, 100)).toBe(0);
    expect(intensidadPorProximidad(500, 100)).toBe(0);
  });

  it('radio 0 o negativo siempre da 0 (nunca divide por 0)', () => {
    expect(intensidadPorProximidad(0, 0)).toBe(0);
    expect(intensidadPorProximidad(10, -5)).toBe(0);
  });

  it('decrece a medida que la distancia crece', () => {
    const cerca = intensidadPorProximidad(10, 100);
    const lejos = intensidadPorProximidad(60, 100);
    expect(cerca).toBeGreaterThan(lejos);
  });

  it('nunca sale del rango [0, 1]', () => {
    for (const d of [-10, 0, 25, 50, 75, 100, 200]) {
      const valor = intensidadPorProximidad(d, 100);
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThanOrEqual(1);
    }
  });
});
