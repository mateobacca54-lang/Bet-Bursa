import { describe, it, expect } from 'vitest';
import {
  emptyProgress,
  parseProgress,
  toDateKey,
  daysBetween,
  completeLesson,
  getCurrentStreak,
  loadProgress,
  saveProgress,
  passPrueba,
  marcarMisionHecha
} from './progress';

describe('Progress (Ola 0)', () => {
  it('toDateKey a las 23:30 locales sigue siendo el mismo día', () => {
    const d1 = new Date(2026, 8, 17, 0, 5); // Sep 17
    const d2 = new Date(2026, 8, 17, 23, 30); // Sep 17
    expect(toDateKey(d1)).toBe('2026-09-17');
    expect(toDateKey(d2)).toBe('2026-09-17');
  });

  it('calendario, no horas: cruce de días da 3 días, cruce de mes y año', () => {
    const d1 = new Date(2026, 8, 17, 23, 50);
    const d2 = new Date(2026, 8, 20, 0, 5);
    expect(daysBetween(toDateKey(d1), toDateKey(d2))).toBe(3);

    const endOfMonth = new Date(2026, 8, 30, 23, 50);
    const nextMonth = new Date(2026, 9, 2, 1, 0);
    expect(daysBetween(toDateKey(endOfMonth), toDateKey(nextMonth))).toBe(2);

    const endOfYear = new Date(2026, 11, 31);
    const nextYear = new Date(2027, 0, 1);
    expect(daysBetween(toDateKey(endOfYear), toDateKey(nextYear))).toBe(1);
  });

  it('completeLesson inmutable, idempotente, orden de finalización, ramas de la racha', () => {
    const empty = emptyProgress('m1');
    const day1 = new Date(2026, 0, 1);
    const day2 = new Date(2026, 0, 2);
    const day4 = new Date(2026, 0, 4);

    // Primera vez
    const p1 = completeLesson(empty, 1, day1);
    expect(p1).not.toBe(empty);
    expect(p1.completedLessons).toEqual([1]);
    expect(p1.streakDays).toBe(1);
    expect(p1.lastActiveDate).toBe('2026-01-01');

    // Idempotente mismo día
    const p1_again = completeLesson(p1, 1, day1);
    expect(p1_again.completedLessons).toEqual([1]);
    expect(p1_again.streakDays).toBe(1);
    
    // Otra lección mismo día (streakDays era 1, se queda 1)
    const p2 = completeLesson(p1, 2, day1);
    expect(p2.completedLessons).toEqual([1, 2]);
    expect(p2.streakDays).toBe(1);

    // Día siguiente -> +1
    const p3 = completeLesson(p2, 3, day2);
    expect(p3.completedLessons).toEqual([1, 2, 3]);
    expect(p3.streakDays).toBe(2);

    // Hueco > 1 día -> 1
    const p4 = completeLesson(p3, 4, day4);
    expect(p4.streakDays).toBe(1);
  });

  it('getCurrentStreak vencida -> 0', () => {
    let p = emptyProgress('m1');
    const day1 = new Date(2026, 0, 1);
    p = completeLesson(p, 1, day1);
    
    // Mismo día
    expect(getCurrentStreak(p, day1)).toBe(1);
    
    // Día siguiente
    const day2 = new Date(2026, 0, 2);
    expect(getCurrentStreak(p, day2)).toBe(1);
    
    // Dos días después
    const day3 = new Date(2026, 0, 3);
    expect(getCurrentStreak(p, day3)).toBe(0);
  });

  it('loadProgress / saveProgress resiliencia', () => {
    // Falso storage que lanza
    const throwStorage = {
      getItem: () => { throw new Error('Private mode'); },
      setItem: () => { throw new Error('Private mode'); }
    };
    
    expect(loadProgress('m1', throwStorage)).toEqual(emptyProgress('m1'));
    expect(saveProgress(emptyProgress('m1'), throwStorage)).toBe(false);

    // Corrupt JSON
    const badJSONStorage = {
      getItem: () => '{ bad json',
      setItem: () => {}
    };
    expect(loadProgress('m1', badJSONStorage)).toEqual(emptyProgress('m1'));

    // Forma incorrecta / saneamiento
    const badShapeStorage = {
      getItem: () => JSON.stringify({
        moduleId: 999, // wrong type
        completedLessons: ['1', 2, null], // mixed
        userName: 123
      }),
      setItem: () => {}
    };
    const loaded = loadProgress('m1', badShapeStorage);
    expect(loaded.moduleId).toBe('m1');
    expect(loaded.completedLessons).toEqual([2]); // Saneado
    expect(loaded.userName).toBe(null); // Saneado a null

    // Camino feliz
    const store: Record<string, string> = {};
    const memStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k] = v; }
    };
    const validP = { ...emptyProgress('m1'), completedLessons: [1, 2], userName: 'Mateo' };
    expect(saveProgress(validP, memStorage)).toBe(true);
    expect(loadProgress('m1', memStorage)).toEqual(validP);
  });

  it('pruebaAprobada: empieza en false y se sanea si el dato guardado no es booleano', () => {
    expect(emptyProgress('m1').pruebaAprobada).toBe(false);

    const badTypeStorage = {
      getItem: () => JSON.stringify({ pruebaAprobada: 'sí' }),
      setItem: () => {}
    };
    expect(loadProgress('m1', badTypeStorage).pruebaAprobada).toBe(false);
  });

  it('passPrueba: aprueba, es idempotente, y no toca nada más', () => {
    const p = { ...emptyProgress('m1'), completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
    const aprobado = passPrueba(p);
    expect(aprobado.pruebaAprobada).toBe(true);
    expect(aprobado.completedLessons).toEqual(p.completedLessons); // no muta lo demás
    expect(aprobado).not.toBe(p); // inmutable

    // aprobarla otra vez no cambia nada (idempotente): misma referencia
    expect(passPrueba(aprobado)).toBe(aprobado);
  });

  it('misionHecha: empieza en false y se sanea si el dato guardado no es booleano', () => {
    expect(emptyProgress('m1').misionHecha).toBe(false);

    const badTypeStorage = {
      getItem: () => JSON.stringify({ misionHecha: 1 }),
      setItem: () => {}
    };
    expect(loadProgress('m1', badTypeStorage).misionHecha).toBe(false);
  });

  it('marcarMisionHecha: la reconoce, es idempotente, y no toca nada más', () => {
    const p = { ...emptyProgress('m1'), pruebaAprobada: true };
    const hecha = marcarMisionHecha(p);
    expect(hecha.misionHecha).toBe(true);
    expect(hecha.pruebaAprobada).toBe(true); // no muta lo demás
    expect(hecha).not.toBe(p); // inmutable

    expect(marcarMisionHecha(hecha)).toBe(hecha); // idempotente: misma referencia
  });

  function withThrowingAccessor(fn: () => void) {
    const desc = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() { throw new DOMException('denied', 'SecurityError'); },
    });
    try {
      fn();
    } finally {
      if (desc) Object.defineProperty(globalThis, 'localStorage', desc);
      else Reflect.deleteProperty(globalThis, 'localStorage');
    }
  }

  it('loadProgress no lanza si ACCEDER a localStorage lanza', () => {
    withThrowingAccessor(() => {
      expect(() => loadProgress('m1')).not.toThrow();
      expect(loadProgress('m1')).toEqual(emptyProgress('m1'));
    });
  });

  it('saveProgress no lanza si ACCEDER a localStorage lanza y devuelve false', () => {
    withThrowingAccessor(() => {
      expect(() => saveProgress(emptyProgress('m1'))).not.toThrow();
      expect(saveProgress(emptyProgress('m1'))).toBe(false);
    });
  });
});


describe('emailPrompted', () => {
  it('empieza en false y permite leer progreso anterior', () => {
    expect(emptyProgress('m1').emailPrompted).toBe(false);
    expect(parseProgress('{}', 'm1').emailPrompted).toBe(false);
  });
  it.each([null, 'true', 1, [], {}])('sanea un valor no booleano: %j', (emailPrompted) => {
    expect(parseProgress(JSON.stringify({ emailPrompted }), 'm1').emailPrompted).toBe(false);
  });
  it.each([true, false])('conserva el booleano %s al guardar y leer', (emailPrompted) => {
    let raw = '';
    const storage = { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; } };
    saveProgress({ ...emptyProgress('m1'), emailPrompted }, storage);
    expect(loadProgress('m1', storage).emailPrompted).toBe(emailPrompted);
  });
});
