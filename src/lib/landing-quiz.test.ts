import { describe, expect, it } from 'vitest';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import {
  HERO_QUIZ_CORRECT_ID,
  HERO_QUIZ_KEY_CONCEPT,
  HERO_QUIZ_OPTIONS,
  HERO_QUIZ_QUESTION,
  chooseHeroQuizOption,
  getHeroQuizReveal,
  heroQuizIsAnswered,
  heroQuizOptionStatus,
  heroQuizWasCorrect,
  initialHeroQuizState,
  isHeroQuizCorrect,
  resetHeroQuizState,
  type HeroQuizState,
} from './landing-quiz';

describe('HERO_QUIZ_QUESTION / HERO_QUIZ_KEY_CONCEPT — contenido', () => {
  it('la pregunta es literal el gancho de la lección 3 del temario', () => {
    const leccion3 = TEMARIO_MODULO_1.find((l) => l.number === 3)!;
    expect(HERO_QUIZ_QUESTION).toBe(leccion3.hook);
    expect(HERO_QUIZ_QUESTION.length).toBeGreaterThan(0);
  });

  it('el concepto clave es literal el de la lección 3 del temario', () => {
    const leccion3 = TEMARIO_MODULO_1.find((l) => l.number === 3)!;
    expect(HERO_QUIZ_KEY_CONCEPT).toBe(leccion3.keyConcept);
  });

  it('las tres opciones existen y "hoy" es la correcta', () => {
    expect(HERO_QUIZ_OPTIONS.map((o) => o.id)).toEqual(['mismo', 'hoy', 'diez']);
    expect(HERO_QUIZ_CORRECT_ID).toBe('hoy');
    expect(isHeroQuizCorrect('hoy')).toBe(true);
    expect(isHeroQuizCorrect('mismo')).toBe(false);
    expect(isHeroQuizCorrect('diez')).toBe(false);
  });
});

describe('estado inicial', () => {
  it('nadie ha elegido: selected es null y no está respondido', () => {
    expect(initialHeroQuizState.selected).toBeNull();
    expect(heroQuizIsAnswered(initialHeroQuizState)).toBe(false);
    expect(heroQuizWasCorrect(initialHeroQuizState)).toBeNull();
  });

  it('con nadie elegido, las tres opciones están "idle"', () => {
    for (const opt of HERO_QUIZ_OPTIONS) {
      expect(heroQuizOptionStatus(initialHeroQuizState, opt.id)).toBe('idle');
    }
  });
});

describe('chooseHeroQuizOption — elegir un acierto', () => {
  const state = chooseHeroQuizOption(initialHeroQuizState, 'hoy');

  it('marca la respuesta como contestada y acertada', () => {
    expect(heroQuizIsAnswered(state)).toBe(true);
    expect(heroQuizWasCorrect(state)).toBe(true);
  });

  it('la elegida (y correcta) queda "selected-correct"; el resto, "dimmed"', () => {
    expect(heroQuizOptionStatus(state, 'hoy')).toBe('selected-correct');
    expect(heroQuizOptionStatus(state, 'mismo')).toBe('dimmed');
    expect(heroQuizOptionStatus(state, 'diez')).toBe('dimmed');
  });
});

describe('chooseHeroQuizOption — elegir un fallo', () => {
  const state = chooseHeroQuizOption(initialHeroQuizState, 'mismo');

  it('marca la respuesta como contestada y NO acertada', () => {
    expect(heroQuizIsAnswered(state)).toBe(true);
    expect(heroQuizWasCorrect(state)).toBe(false);
  });

  it('la elegida queda "selected-wrong", la correcta "correct", el resto "dimmed"', () => {
    expect(heroQuizOptionStatus(state, 'mismo')).toBe('selected-wrong');
    expect(heroQuizOptionStatus(state, 'hoy')).toBe('correct');
    expect(heroQuizOptionStatus(state, 'diez')).toBe('dimmed');
  });
});

describe('chooseHeroQuizOption — no se puede elegir dos veces', () => {
  it('una segunda elección se ignora: el estado no cambia', () => {
    const first: HeroQuizState = chooseHeroQuizOption(initialHeroQuizState, 'mismo');
    const second = chooseHeroQuizOption(first, 'hoy');
    expect(second).toBe(first); // misma referencia: no-op
    expect(second.selected).toBe('mismo');
  });
});

describe('resetHeroQuizState — "Probar otra vez"', () => {
  it('vuelve al estado inicial y se puede volver a elegir', () => {
    const answered = chooseHeroQuizOption(initialHeroQuizState, 'diez');
    const reset = resetHeroQuizState();
    expect(reset).toEqual(initialHeroQuizState);
    expect(heroQuizIsAnswered(reset)).toBe(false);

    const answeredAgain = chooseHeroQuizOption(reset, 'hoy');
    expect(answeredAgain.selected).toBe('hoy');
    expect(answered.selected).toBe('diez'); // el estado anterior no se mutó
  });
});

describe('getHeroQuizReveal', () => {
  it('la línea de "hoy" reconoce el acierto', () => {
    expect(getHeroQuizReveal('hoy').line).toBe('¡Bien leído! Valen más hoy.');
  });

  it('cada opción tiene su propia línea, y "always" y el concepto son iguales para todas', () => {
    const reveals = HERO_QUIZ_OPTIONS.map((o) => getHeroQuizReveal(o.id));
    const lines = new Set(reveals.map((r) => r.line));
    expect(lines.size).toBe(HERO_QUIZ_OPTIONS.length); // tres líneas distintas
    for (const r of reveals) {
      expect(r.always).toBe(
        'Si hoy los pones a crecer, en 10 años son más. Si los dejas quietos, los precios suben y compran menos.'
      );
      expect(r.keyConcept).toBe(HERO_QUIZ_KEY_CONCEPT);
    }
  });
});
