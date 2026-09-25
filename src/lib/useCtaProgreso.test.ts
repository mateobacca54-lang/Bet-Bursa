import { describe, expect, it } from 'vitest';
import { emptyProgress } from './progress';
import { CTA_INICIAL, ctaProgreso } from './useCtaProgreso';

const TOTAL = 10;

describe('ctaProgreso', () => {
  it('antes de hidratar, siempre el CTA por defecto (así lo ve el servidor)', () => {
    const conProgreso = { ...emptyProgress('modulo-1'), completedLessons: [1, 2, 3] };
    expect(ctaProgreso(conProgreso, TOTAL, false)).toEqual(CTA_INICIAL);
  });

  it('sin lecciones completadas, el CTA por defecto (nunca empezó)', () => {
    expect(ctaProgreso(emptyProgress('modulo-1'), TOTAL, true)).toEqual(CTA_INICIAL);
  });

  it('con progreso, lleva a la siguiente lección sin completar', () => {
    const progreso = { ...emptyProgress('modulo-1'), completedLessons: [1, 2, 3] };
    expect(ctaProgreso(progreso, TOTAL, true)).toEqual({
      label: 'Sigue con la lección 4',
      href: '/modulo/1/leccion/4',
    });
  });

  it('con huecos en las completadas, ofrece la primera que falta, no la última', () => {
    const progreso = { ...emptyProgress('modulo-1'), completedLessons: [1, 3, 4] };
    expect(ctaProgreso(progreso, TOTAL, true)).toEqual({
      label: 'Sigue con la lección 2',
      href: '/modulo/1/leccion/2',
    });
  });

  it('con todo el módulo terminado, lleva a ver el progreso', () => {
    const progreso = {
      ...emptyProgress('modulo-1'),
      completedLessons: Array.from({ length: TOTAL }, (_, i) => i + 1),
    };
    expect(ctaProgreso(progreso, TOTAL, true)).toEqual({
      label: 'Ver tu progreso',
      href: '/progreso',
    });
  });
});
