import { describe, it, expect } from 'vitest';
import { getGreetingCopy, type GreetingCopy } from './greeting-copy';
import type { GreetingData } from '@/lib/greeting';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';

const base: GreetingData = {
  state: 'in-progress',
  userName: 'Mateo',
  completedCount: 2,
  totalLessons: 10,
  nextLesson: 3,
  reviewLesson: null,
};

const copyOf = (over: Partial<GreetingData>): GreetingCopy =>
  getGreetingCopy({ ...base, ...over }, TEMARIO_MODULO_1);

/** Todo el texto que el usuario llegaría a leer, en una sola cadena */
const allText = (c: GreetingCopy): string =>
  [
    c.title.before,
    c.title.name ?? '',
    c.title.after,
    ...c.sub.map((s) => (s.kind === 'text' ? s.text : `${s.value} de ${s.total}`)),
    c.cta,
    c.review?.concept ?? '',
  ].join(' ');

const STATES: Partial<GreetingData>[] = [
  { state: 'first-time', completedCount: 0, nextLesson: 1 },
  { state: 'in-progress' },
  { state: 'returning-late', reviewLesson: 1 },
  { state: 'complete', completedCount: 10, nextLesson: null },
];

describe('Textos del saludo', () => {
  it('estado 0: primera vez, sin nombre en el titular', () => {
    const c = copyOf(STATES[0]);
    expect(c.title.before).toBe('Todo esto empieza con un billete que ya tienes en el bolsillo.');
    expect(c.title.name).toBeNull();
    expect(c.sub).toEqual([{ kind: 'text', text: 'Diez lecciones. Ninguna pasa de cinco minutos.' }]);
    expect(c.cta).toBe('Empezar por el principio');
  });

  it('estado 1: con nombre y sin nombre son frases distintas (no un hueco)', () => {
    const withName = copyOf({});
    expect(withName.title).toEqual({ before: 'Hola, ', name: 'Mateo', after: '.' });

    const noName = copyOf({ userName: null });
    expect(noName.title).toEqual({ before: 'Bienvenido de vuelta.', name: null, after: '' });
  });

  it('estado 1: "llevas 2 de 10", la siguiente por su TEMA y el CTA con el título', () => {
    const c = copyOf({});
    expect(c.sub[1]).toEqual({ kind: 'progress', value: 2, total: 10 });
    expect(allText(c)).toContain('La que sigue es sobre el interés compuesto.');
    expect(c.cta).toBe('Seguir: Interés simple vs. interés compuesto');
  });

  it('estado 2: incluye el concepto clave de la lección a repasar', () => {
    const c = copyOf(STATES[2]);
    expect(c.title.before).toBe('Hola de nuevo, ');
    expect(c.review).toEqual({
      lesson: 1,
      concept: 'El dinero es un acuerdo social de confianza, no un objeto con valor propio',
    });
    expect(c.cta).toBe('Repasar y seguir');
  });

  it('estado 2 sin nombre', () => {
    const c = copyOf({ ...STATES[2], userName: null });
    expect(c.title).toEqual({ before: 'Hola de nuevo.', name: null, after: '' });
  });

  it('estado 3: módulo completo', () => {
    const c = copyOf(STATES[3]);
    expect(c.title).toEqual({ before: 'Terminaste el Módulo 1, ', name: 'Mateo', after: '.' });
    expect(c.cta).toBe('Ver el Módulo 2');
    expect(copyOf({ ...STATES[3], userName: null }).title.before).toBe('Terminaste el Módulo 1.');
  });

  it('solo el estado 2 propone repaso', () => {
    expect(STATES.map((s) => copyOf(s).review !== null)).toEqual([false, false, true, false]);
  });

  it('tono: nunca deuda, urgencia ni épica, en ningún estado ni con/sin nombre', () => {
    const forbidden = /faltan|falta\b|pendiente|no pierdas|no te quedes|transforma|urgente|última oportunidad|ya casi/i;
    for (const s of STATES) {
      for (const userName of ['Mateo', null]) {
        const text = allText(copyOf({ ...s, userName }));
        expect(text, `Estado ${s.state}, nombre ${userName}`).not.toMatch(forbidden);
      }
    }
  });

  it('nunca deja un hueco: sin nombre no aparece coma colgando ni doble espacio', () => {
    for (const s of STATES) {
      const c = copyOf({ ...s, userName: null });
      const joined = `${c.title.before}${c.title.name ?? ''}${c.title.after}`;
      expect(joined).not.toMatch(/,\s*\.|\s{2,}|,\s*$/);
    }
  });
});
