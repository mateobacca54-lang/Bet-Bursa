import { describe, it, expect } from 'vitest';
import {
  emptyProgress,
  toDateKey,
  daysBetween,
  completeLesson,
  getCurrentStreak,
  loadProgress,
  saveProgress
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
