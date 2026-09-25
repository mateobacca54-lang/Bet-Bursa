import { describe, expect, it } from 'vitest';
import { emptyProgress, type ModuleProgress } from './progress';
import { getInicioView, resolveWarmUp, lessonHref, PATH_HREF } from './inicio';
import { WARM_UP } from '@/content/inicio';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';

const TOTAL = 10;
const NOW = new Date(2026, 8, 21, 10, 0, 0); // 21 sep 2026

function progress(over: Partial<ModuleProgress>): ModuleProgress {
  return { ...emptyProgress('modulo-1'), ...over };
}

describe('getInicioView — modo', () => {
  it('sin lecciones completadas es primera visita', () => {
    expect(getInicioView(emptyProgress('modulo-1'), NOW, TOTAL).mode).toBe('first-visit');
  });

  it('con una lección completada ya es "volviste"', () => {
    const v = getInicioView(progress({ completedLessons: [1], lastActiveDate: '2026-09-21' }), NOW, TOTAL);
    expect(v.mode).toBe('returning');
  });

  it('ignora lecciones fuera de rango (progreso corrupto no rompe el modo)', () => {
    const v = getInicioView(progress({ completedLessons: [0, 99, -3] }), NOW, TOTAL);
    expect(v.mode).toBe('first-visit');
  });
});

describe('getInicioView — destino del botón', () => {
  it('primera vez: al camino, no directo a una lección', () => {
    expect(getInicioView(emptyProgress('modulo-1'), NOW, TOTAL).ctaHref).toBe(PATH_HREF);
  });

  it('al día: salta a la lección que sigue', () => {
    const v = getInicioView(progress({ completedLessons: [1, 2], lastActiveDate: '2026-09-21' }), NOW, TOTAL);
    expect(v.greeting.state).toBe('in-progress');
    expect(v.ctaHref).toBe(lessonHref(3));
  });

  it('volvió tarde (3+ días): al camino, donde vive el repaso', () => {
    const v = getInicioView(progress({ completedLessons: [1, 2], lastActiveDate: '2026-09-15' }), NOW, TOTAL);
    expect(v.greeting.state).toBe('returning-late');
    expect(v.ctaHref).toBe(PATH_HREF);
  });

  it('a exactamente 2 días todavía va al día; a 3 ya es tarde', () => {
    const dosDias = getInicioView(progress({ completedLessons: [1], lastActiveDate: '2026-09-19' }), NOW, TOTAL);
    const tresDias = getInicioView(progress({ completedLessons: [1], lastActiveDate: '2026-09-18' }), NOW, TOTAL);
    expect(dosDias.greeting.state).toBe('in-progress');
    expect(tresDias.greeting.state).toBe('returning-late');
  });

  it('10 lecciones sin aprobar la prueba: awaiting-test, y sigue yendo al camino', () => {
    const v = getInicioView(
      progress({ completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], lastActiveDate: '2026-09-21' }),
      NOW,
      TOTAL
    );
    expect(v.greeting.state).toBe('awaiting-test');
    expect(v.ctaHref).toBe(PATH_HREF); // ahí vive la tarjeta que lleva a la prueba
  });

  it('módulo completo (prueba aprobada): vuelve al camino (no existe /modulo/2)', () => {
    const v = getInicioView(
      progress({ completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], lastActiveDate: '2026-09-21', pruebaAprobada: true }),
      NOW,
      TOTAL
    );
    expect(v.greeting.state).toBe('complete');
    expect(v.ctaHref).toBe(PATH_HREF);
  });
});

describe('getInicioView — tarjetas de módulo', () => {
  it('siempre hay dos: el Módulo 1 y el 2 por abrir, sin enlace', () => {
    const { modules } = getInicioView(emptyProgress('modulo-1'), NOW, TOTAL);
    expect(modules).toHaveLength(2);
    expect(modules[1]).toMatchObject({ number: 2, status: 'soon', href: null, completed: null, total: null });
  });

  it('el Módulo 1 pasa de start → in-progress → complete (complete solo tras la prueba)', () => {
    const status = (done: number[], pruebaAprobada = false) =>
      getInicioView(progress({ completedLessons: done, lastActiveDate: '2026-09-21', pruebaAprobada }), NOW, TOTAL)
        .modules[0].status;
    expect(status([])).toBe('start');
    expect(status([1])).toBe('in-progress');
    expect(status([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe('in-progress');
    // las 10 hechas sin la prueba: sigue "en curso", no "completo"
    expect(status([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe('in-progress');
    expect(status([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], true)).toBe('complete');
  });

  it('cuenta el progreso como logro: completadas de total', () => {
    const m1 = getInicioView(progress({ completedLessons: [1, 2] }), NOW, TOTAL).modules[0];
    expect(m1).toMatchObject({ completed: 2, total: 10, href: PATH_HREF });
  });
});

describe('resolveWarmUp', () => {
  it('devuelve el texto de la opción elegida', () => {
    for (const opt of WARM_UP.options) {
      expect(resolveWarmUp(WARM_UP, opt.id).reveal).toBe(WARM_UP.reveal[opt.id]);
    }
  });

  it('marca cuál apunta a lo que enseña el módulo, solo para el tono', () => {
    expect(resolveWarmUp(WARM_UP, WARM_UP.intendedId).matchedIntended).toBe(true);
    const otras = WARM_UP.options.filter((o) => o.id !== WARM_UP.intendedId);
    expect(otras.length).toBeGreaterThan(0);
    for (const o of otras) expect(resolveWarmUp(WARM_UP, o.id).matchedIntended).toBe(false);
  });
});

describe('WARM_UP — contenido', () => {
  it('la pregunta es literal el gancho de la lección 3 del temario', () => {
    const gancho = TEMARIO_MODULO_1.find((l) => l.number === 3)!.hook;
    expect(gancho).not.toBe('');
    expect(WARM_UP.question).toBe(gancho);
  });

  it('todas las opciones tienen texto de revelación y la intencionada existe', () => {
    for (const o of WARM_UP.options) expect(WARM_UP.reveal[o.id].length).toBeGreaterThan(20);
    expect(WARM_UP.options.map((o) => o.id)).toContain(WARM_UP.intendedId);
  });

  it('cumple el tono: sin urgencia, sin deuda, sin veredicto de error', () => {
    const todo = [WARM_UP.hint, WARM_UP.outro, ...Object.values(WARM_UP.reveal)].join(' ').toLowerCase();
    for (const prohibida of ['te faltan', 'no te quedes', 'transforma', 'incorrecto', 'error', 'perdiste', 'fallaste']) {
      expect(todo).not.toContain(prohibida);
    }
  });

  it('cada revelación empieza reconociendo la apuesta', () => {
    for (const o of WARM_UP.options) expect(WARM_UP.reveal[o.id].startsWith('Apostaste')).toBe(true);
  });
});
