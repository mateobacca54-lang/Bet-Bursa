import { describe, it, expect } from 'vitest';
import { aOracion, MODULOS, nombreModulo, siguienteModulo } from './modulos';

describe('aOracion', () => {
  it('pasa un título en Título de cada palabra a formato oración', () => {
    expect(aOracion('Fundamentos del Dinero')).toBe('Fundamentos del dinero');
  });

  it('deja intacta una palabra ya en formato oración', () => {
    expect(aOracion('Ahorrar con metas')).toBe('Ahorrar con metas');
  });

  it('pasa a mayúscula la primera letra si venía en minúscula', () => {
    expect(aOracion('cómo funciona la deuda')).toBe('Cómo funciona la deuda');
  });

  it('no revienta con una cadena vacía', () => {
    expect(aOracion('')).toBe('');
  });
});

describe('MODULOS', () => {
  it('el Módulo 1 usa el nombre del temario, en formato oración', () => {
    const m1 = MODULOS.find((m) => m.numero === 1);
    expect(m1?.nombre).toBe('Fundamentos del dinero');
    expect(m1?.id).toBe('modulo-1');
    expect(m1?.disponible).toBe(true);
  });

  it('los módulos 2 a 4 todavía no están disponibles', () => {
    for (const numero of [2, 3, 4]) {
      const m = MODULOS.find((mod) => mod.numero === numero);
      expect(m?.disponible).toBe(false);
    }
  });

  it('ningún nombre ni pregunta menciona la palabra "Módulo" seguida de un número', () => {
    for (const m of MODULOS) {
      expect(m.nombre).not.toMatch(/m[oó]dulo\s*\d/i);
      expect(m.pregunta).not.toMatch(/m[oó]dulo\s*\d/i);
    }
  });
});

describe('nombreModulo', () => {
  it('devuelve el nombre del módulo por su número', () => {
    expect(nombreModulo(1)).toBe('Fundamentos del dinero');
    expect(nombreModulo(2)).toBe('Tu plata en el día a día');
  });
});

describe('siguienteModulo', () => {
  it('el siguiente del Módulo 1 es el Módulo 2', () => {
    expect(siguienteModulo(1)?.nombre).toBe('Tu plata en el día a día');
  });

  it('no hay siguiente después del último módulo del catálogo', () => {
    expect(siguienteModulo(4)).toBeNull();
  });
});
