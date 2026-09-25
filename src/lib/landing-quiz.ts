import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';

// ============================================================
// landing-quiz.ts — Lógica pura de HeroQuiz (sin DOM, con test).
//
// HeroQuiz es la pregunta del héroe de la landing: predecir antes de revelar,
// con el gancho literal de la lección 3 (temario.ts). Se referencia el temario
// en vez de copiarlo a mano: si el gancho cambia allá, cambia aquí también
// (mismo criterio que src/content/inicio.ts con WARM_UP).
//
// Los textos de revelación SÍ son literales de docs/SPEC-LANDING-V2.md §5 (HeroQuiz):
// no se tocan sin cambiar la spec primero.
// ============================================================

const LECCION_3 = TEMARIO_MODULO_1.find((l) => l.number === 3);

/** Pregunta de HeroQuiz: literal el gancho de la lección 3. */
export const HERO_QUIZ_QUESTION = LECCION_3?.hook ?? '';

/** Concepto clave de la lección 3, para la revelación en display. */
export const HERO_QUIZ_KEY_CONCEPT = LECCION_3?.keyConcept ?? '';

export type HeroQuizOptionId = 'mismo' | 'hoy' | 'diez';

export interface HeroQuizOption {
  id: HeroQuizOptionId;
  label: string;
}

/** La única opción correcta: hoy vale más (el tiempo multiplica). */
export const HERO_QUIZ_CORRECT_ID: HeroQuizOptionId = 'hoy';

export const HERO_QUIZ_OPTIONS: readonly HeroQuizOption[] = [
  { id: 'mismo', label: 'Es lo mismo' },
  { id: 'hoy', label: 'Valen más hoy' },
  { id: 'diez', label: 'Valen más en 10 años' },
];

export function isHeroQuizCorrect(id: HeroQuizOptionId): boolean {
  return id === HERO_QUIZ_CORRECT_ID;
}

export interface HeroQuizState {
  selected: HeroQuizOptionId | null;
}

export const initialHeroQuizState: HeroQuizState = { selected: null };

/**
 * Elige una opción. Si ya había una elegida, no hace nada: no se puede
 * cambiar de predicción una vez comprometida (misma regla que WarmUp).
 */
export function chooseHeroQuizOption(state: HeroQuizState, id: HeroQuizOptionId): HeroQuizState {
  if (state.selected !== null) return state;
  return { selected: id };
}

/** Vuelve al estado inicial: "Probar otra vez". */
export function resetHeroQuizState(): HeroQuizState {
  return initialHeroQuizState;
}

export function heroQuizIsAnswered(state: HeroQuizState): boolean {
  return state.selected !== null;
}

/** null = todavía no eligió; true/false = si acertó. */
export function heroQuizWasCorrect(state: HeroQuizState): boolean | null {
  return state.selected === null ? null : isHeroQuizCorrect(state.selected);
}

export type HeroQuizOptionStatus =
  | 'idle' // nadie ha elegido
  | 'selected-correct' // la eligió y es la correcta
  | 'selected-wrong' // la eligió y NO es la correcta
  | 'correct' // es la correcta, pero eligió otra
  | 'dimmed'; // ni la eligió ni es la correcta

/**
 * Estado visual de una opción, sin depender solo del color (SPEC §5):
 * la elegida siempre se marca "Tu predicción"; la correcta siempre se marca
 * "Respuesta" (con check); el resto baja de opacidad y queda deshabilitado.
 */
export function heroQuizOptionStatus(state: HeroQuizState, id: HeroQuizOptionId): HeroQuizOptionStatus {
  if (state.selected === null) return 'idle';
  const isSelected = state.selected === id;
  const isCorrect = isHeroQuizCorrect(id);
  if (isSelected && isCorrect) return 'selected-correct';
  if (isSelected) return 'selected-wrong';
  if (isCorrect) return 'correct';
  return 'dimmed';
}

export interface HeroQuizReveal {
  /** Primera línea, según lo que eligió */
  line: string;
  /** Segunda línea, siempre igual */
  always: string;
  /** Concepto clave, en display */
  keyConcept: string;
}

const REVEAL_LINE: Record<HeroQuizOptionId, string> = {
  hoy: '¡Bien leído! Valen más hoy.',
  mismo:
    'Parece lo mismo porque el billete dice lo mismo. Pero lo que puedes hacer con él cambia con el tiempo.',
  diez: 'Es al revés: quien tiene la plata hoy puede ponerla a crecer, y quien espera la recibe cuando los precios ya subieron.',
};

const REVEAL_ALWAYS =
  'Si hoy los pones a crecer, en 10 años son más. Si los dejas quietos, los precios suben y compran menos.';

/** Construye la revelación para la opción elegida. */
export function getHeroQuizReveal(selected: HeroQuizOptionId): HeroQuizReveal {
  return {
    line: REVEAL_LINE[selected],
    always: REVEAL_ALWAYS,
    keyConcept: HERO_QUIZ_KEY_CONCEPT,
  };
}
