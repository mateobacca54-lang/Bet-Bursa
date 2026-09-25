import { describe, it, expect } from 'vitest';
import { evaluarPrueba, umbralAprobar, barajar, type SituacionPrueba } from './prueba';

const SEIS: SituacionPrueba[] = Array.from({ length: 6 }, (_, i) => ({
  id: `s${i + 1}`,
  leccion: i + 1,
  tema: `tema ${i + 1}`,
  situacion: `situación ${i + 1}`,
  concepto: `concepto ${i + 1}`,
  opciones: [
    { id: 'a', texto: 'a' },
    { id: 'b', texto: 'b' },
    { id: 'c', texto: 'c' },
  ],
  correctaId: 'b',
}));

describe('umbralAprobar', () => {
  it('permite como mucho una mal: 5 de 6, 4 de 5', () => {
    expect(umbralAprobar(6)).toBe(5);
    expect(umbralAprobar(5)).toBe(4);
  });

  it('nunca baja de 1, ni con muy pocas situaciones', () => {
    expect(umbralAprobar(1)).toBe(1);
    expect(umbralAprobar(0)).toBe(1);
  });
});

describe('evaluarPrueba', () => {
  it('las 6 bien: aprueba con 6/6', () => {
    const respuestas = SEIS.map((s) => ({ situacionId: s.id, elegidaId: 'b' }));
    const r = evaluarPrueba(SEIS, respuestas);
    expect(r).toEqual({ aciertos: 6, total: 6, aprobado: true, fallos: [] });
  });

  it('una mal: sigue aprobando (5 de 6)', () => {
    const respuestas = SEIS.map((s, i) => ({ situacionId: s.id, elegidaId: i === 2 ? 'a' : 'b' }));
    const r = evaluarPrueba(SEIS, respuestas);
    expect(r.aciertos).toBe(5);
    expect(r.aprobado).toBe(true);
    expect(r.fallos).toEqual([{ leccion: 3, tema: 'tema 3' }]);
  });

  it('dos mal: no aprueba, y trae las dos con su lección y tema', () => {
    const respuestas = SEIS.map((s, i) => ({ situacionId: s.id, elegidaId: i === 1 || i === 4 ? 'c' : 'b' }));
    const r = evaluarPrueba(SEIS, respuestas);
    expect(r.aciertos).toBe(4);
    expect(r.aprobado).toBe(false);
    expect(r.fallos).toEqual([
      { leccion: 2, tema: 'tema 2' },
      { leccion: 5, tema: 'tema 5' },
    ]);
  });

  it('una situación sin responder cuenta como fallo, no como excepción', () => {
    const respuestas = SEIS.slice(0, 5).map((s) => ({ situacionId: s.id, elegidaId: 'b' }));
    const r = evaluarPrueba(SEIS, respuestas);
    expect(r.aciertos).toBe(5);
    expect(r.fallos).toEqual([{ leccion: 6, tema: 'tema 6' }]);
  });

  it('el orden de las situaciones se respeta en los fallos, no el de las respuestas', () => {
    const respuestas = [
      { situacionId: 's6', elegidaId: 'x' },
      { situacionId: 's1', elegidaId: 'x' },
      ...SEIS.slice(1, 5).map((s) => ({ situacionId: s.id, elegidaId: 'b' })),
    ];
    const r = evaluarPrueba(SEIS, respuestas);
    expect(r.fallos.map((f) => f.leccion)).toEqual([1, 6]);
  });
});

describe('barajar', () => {
  it('no muta el original y conserva todos los elementos', () => {
    const original = [1, 2, 3, 4, 5];
    const copia = [...original];
    const salida = barajar(original, () => 0.5);
    expect(original).toEqual(copia);
    expect([...salida].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('es determinista con un generador fijo', () => {
    const a = barajar([1, 2, 3, 4, 5], () => 0.3);
    const b = barajar([1, 2, 3, 4, 5], () => 0.3);
    expect(a).toEqual(b);
  });

  it('con random() = 0 siempre, no cambia el orden (Fisher–Yates con j=0 cada vez)', () => {
    // random()=0 -> j = floor(0*(i+1)) = 0 en cada paso: cada elemento se intercambia con
    // el primero. Es un caso borde útil para verificar que no se rompe ni se repite nada.
    const salida = barajar([1, 2, 3, 4], () => 0);
    expect([...salida].sort()).toEqual([1, 2, 3, 4]);
    expect(salida).toHaveLength(4);
  });

  it('arreglo vacío o de un elemento no falla', () => {
    expect(barajar([])).toEqual([]);
    expect(barajar([1])).toEqual([1]);
  });
});
