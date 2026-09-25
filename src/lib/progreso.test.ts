import { describe, it, expect } from 'vitest';
import { getProgresoView } from './progreso';
import { emptyProgress, type ModuleProgress } from './progress';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';

const SIGUIENTE = { number: 2, title: 'Hacer trabajar la plata' };
const MISION = 'Mira cuánto gastaste esta semana en transporte y almuerzo. Nada más: solo míralo.';

function progress(over: Partial<ModuleProgress>): ModuleProgress {
  return { ...emptyProgress('modulo-1'), ...over };
}

describe('getProgresoView — los módulos', () => {
  it('sin progreso: módulo 1 en "start", el 2 en "soon" sin datos', () => {
    const v = getProgresoView(emptyProgress('modulo-1'), TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE);
    expect(v.modulos).toHaveLength(2);
    expect(v.modulos[0]).toMatchObject({ number: 1, status: 'start', completed: 0, total: 10, href: '/modulo/1' });
    expect(v.modulos[1]).toMatchObject({ number: 2, status: 'soon', completed: null, total: null, href: null });
  });

  it('con lecciones hechas y sin aprobar la prueba: "in-progress", no "complete"', () => {
    const v = getProgresoView(progress({ completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }), TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE);
    expect(v.modulos[0].status).toBe('in-progress');
    expect(v.modulos[0].pruebaAprobada).toBe(false);
  });

  it('las 10 hechas Y la prueba aprobada: "complete"', () => {
    const v = getProgresoView(
      progress({ completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pruebaAprobada: true }),
      TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE
    );
    expect(v.modulos[0].status).toBe('complete');
  });

  it('ignora lecciones fuera de rango: no infla el conteo', () => {
    const v = getProgresoView(progress({ completedLessons: [1, 2, 0, 99, -3] }), TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE);
    expect(v.totalHechas).toBe(2);
  });
});

describe('getProgresoView — llevas X de Y', () => {
  it('cuenta solo lecciones reales, nunca inventa un total mayor (no "de 60")', () => {
    const v = getProgresoView(progress({ completedLessons: [1, 2, 3] }), TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE);
    expect(v.totalLecciones).toBe(10);
    expect(v.totalHechas).toBe(3);
  });
});

describe('getProgresoView — conceptos pendientes de repaso', () => {
  it('sin lecciones hechas, no hay nada que repasar', () => {
    const v = getProgresoView(emptyProgress('modulo-1'), TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE);
    expect(v.conceptosPendientes).toEqual([]);
  });

  it('lecciones hechas y no repasadas: aparecen, más antiguas primero, hasta 3', () => {
    const v = getProgresoView(
      progress({ completedLessons: [1, 2, 3, 4, 5], reviewedConcepts: [] }),
      TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE
    );
    expect(v.conceptosPendientes).toHaveLength(3);
    expect(v.conceptosPendientes.map((c) => c.leccion)).toEqual([1, 2, 3]);
    expect(v.conceptosPendientes[0].concepto).toBe(TEMARIO_MODULO_1[0].keyConcept);
  });

  it('ya repasadas no vuelven a aparecer', () => {
    const v = getProgresoView(
      progress({ completedLessons: [1, 2, 3], reviewedConcepts: [1, 2] }),
      TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE
    );
    expect(v.conceptosPendientes).toEqual([{ leccion: 3, concepto: TEMARIO_MODULO_1[2].keyConcept }]);
  });
});

describe('getProgresoView — la misión', () => {
  it('no aparece si el módulo no está completo', () => {
    const v = getProgresoView(progress({ completedLessons: [1, 2, 3] }), TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE);
    expect(v.mision).toBeNull();
  });

  it('aparece al completar, con su texto y si ya se reconoció', () => {
    const v1 = getProgresoView(
      progress({ completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }),
      TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE
    );
    expect(v1.mision).toEqual({ texto: MISION, hecha: false });

    const v2 = getProgresoView(
      progress({ completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], misionHecha: true }),
      TEMARIO_MODULO_1, 'Fundamentos del Dinero', MISION, SIGUIENTE
    );
    expect(v2.mision).toEqual({ texto: MISION, hecha: true });
  });
});
