'use client';

import { useRef, useState } from 'react';
import MoneditaInteractiva from './MoneditaInteractiva';
import Link from 'next/link';
import { motion, useAnimationControls } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO, motionSafe, variants } from '@/lib/motion';
import {
  HERO_QUIZ_OPTIONS,
  HERO_QUIZ_QUESTION,
  chooseHeroQuizOption,
  getHeroQuizReveal,
  heroQuizOptionStatus,
  heroQuizWasCorrect,
  initialHeroQuizState,
  resetHeroQuizState,
  type HeroQuizOptionId,
  type HeroQuizState,
} from '@/lib/landing-quiz';

function CheckIcon() {
  // Mismo trazo que el check de LessonNode: un solo ícono de acierto en toda la app.
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * HeroQuiz — la pregunta del héroe: predecir antes de revelar (SPEC §5).
 *
 * Pregunta literal de la lección 3. Al elegir, Monedita salta y cambia de cara
 * (`variants.hop`, patrón de `components/inicio/Monedita.tsx`); la elegida se
 * marca "Tu predicción" y la correcta "Respuesta" con un check — nunca solo con
 * color. Las opciones son botones reales bloqueados con `aria-disabled` (no
 * `disabled`), para no perder el foco de teclado al elegir (mismo criterio que
 * `components/inicio/WarmUp.tsx`).
 *
 * La revelación reserva su espacio desde el principio (`.hq-reveal` con
 * min-height) y además entra con opacity + y: la tarjeta no salta al aparecer.
 */
export default function HeroQuiz() {
  const reduced = usePrefersReducedMotion();
  const controls = useAnimationControls();
  const [state, setState] = useState<HeroQuizState>(initialHeroQuizState);
  const firstOptionRef = useRef<HTMLButtonElement>(null);

  const selected = state.selected;
  const wasCorrect = heroQuizWasCorrect(state);
  const reveal = selected !== null ? getHeroQuizReveal(selected) : null;

  const moneditaKey = selected === null ? 'idle' : wasCorrect ? 'correct' : 'wrong';
  function handleChoose(id: HeroQuizOptionId) {
    if (selected !== null) return;
    setState((s) => chooseHeroQuizOption(s, id));
    void controls.start(motionSafe(variants, reduced).hop);
  }

  function handleReset() {
    setState(resetHeroQuizState());
    // El foco vuelve a la primera opción para que se pueda repetir sin usar el mouse.
    requestAnimationFrame(() => firstOptionRef.current?.focus());
  }

  const revealMotionProps = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.1 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: DURATION.scene, ease: EASE_OUT_EXPO },
      };

  return (
    <div className="hq-card">
      <div className="hq-header">
        <motion.div className="hq-avatar" animate={controls}>
          <MoneditaInteractiva state={moneditaKey} />
        </motion.div>
        <p className="hq-eyebrow">Una pregunta de la lección 3</p>
      </div>

      <p className="hq-question">{HERO_QUIZ_QUESTION}</p>

      <div className="hq-time" aria-hidden="true">
        <span>Hoy</span>
        <span className="hq-time-track"><span className="hq-time-fill" /></span>
        <span>En 10 años</span>
      </div>

      <ul className="hq-options" aria-label="Tu predicción">
        {HERO_QUIZ_OPTIONS.map((option, i) => {
          const status = heroQuizOptionStatus(state, option.id);
          const showPick = status === 'selected-correct' || status === 'selected-wrong';
          const showAnswer = status === 'selected-correct' || status === 'correct';
          return (
            <li key={option.id}>
              <button
                ref={i === 0 ? firstOptionRef : undefined}
                type="button"
                className="hq-option"
                data-state={status}
                aria-disabled={selected !== null}
                onClick={() => handleChoose(option.id)}
              >
                <span className="hq-option-label">{option.label}</span>
                {(showPick || showAnswer) && (
                  <span className="hq-option-tags">
                    {showPick && <span className="hq-badge hq-badge--pick">Tu predicción</span>}
                    {showAnswer && (
                      <span className="hq-badge hq-badge--answer">
                        <CheckIcon />
                        Respuesta
                      </span>
                    )}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite">
        {reveal ? (
          <motion.div className="hq-reveal-inner" {...revealMotionProps}>
            <p className="hq-reveal-line">{reveal.line}</p>
            <p className="hq-reveal-always">{reveal.always}</p>
            <p className="hq-reveal-concept">{reveal.keyConcept}</p>
            <div className="hq-actions">
              <button type="button" className="lp-btn lp-btn--secondary" onClick={handleReset}>
                Probar otra vez
              </button>
              <Link href="/inicio" className="hq-link">
                Hacer la lección 3
              </Link>
            </div>
          </motion.div>
        ) : (
          <p className="hq-reveal-hint">Elige una. Después te explico por qué.</p>
        )}
      </div>
    </div>
  );
}

