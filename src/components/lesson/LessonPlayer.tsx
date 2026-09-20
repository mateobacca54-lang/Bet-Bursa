'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { TemarioEntry } from '@/content/modulo-1/temario';
import type { LessonContent } from '@/content/modulo-1/lecciones';
import type { WidgetState } from '@/lib/types';
import ProgressBar from '@/components/shell/ProgressBar';
import { DURATION, EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { StepHook, StepConcept, StepExample, StepPractice, StepSummary } from './LessonSteps';
import PracticeWidget from './PracticeWidget';
import NamePrompt from './NamePrompt';

const STEP_NAMES = ['Gancho', 'Concepto', 'Ejemplo', 'Práctica', 'Resumen'] as const;
const LAST = STEP_NAMES.length - 1;
const PRACTICE = 3;
/** Desplazamiento horizontal de la transición entre pasos (px) */
const SHIFT = 24;

interface LessonPlayerProps {
  entry: TemarioEntry;
  content: LessonContent;
  /** A dónde lleva la X de salir */
  exitHref: string;
  /** Se llama una vez, al pulsar "Terminar lección" */
  onFinish: () => void;
  /** Si se debe preguntar el nombre en el resumen (solo tras la lección 1, una vez) */
  askName?: boolean;
  onName?: (name: string) => void;
}

/**
 * LessonPlayer — máquina de 5 pasos del temario: gancho → concepto → ejemplo →
 * práctica → resumen. Cada paso entra desplazándose 24 px desde el lado hacia el que
 * avanzas y sale en espejo. Bajo reduced-motion solo hay un cross-fade.
 *
 * El paso de práctica no deja avanzar hasta acertar o ver la respuesta (tras 3 fallos
 * el widget la revela): así nadie sigue sin haber intentado, pero nadie queda atascado.
 */
export default function LessonPlayer({ entry, content, exitHref, onFinish, askName = false, onName }: LessonPlayerProps) {
  const reduced = usePrefersReducedMotion();
  // Se decide al montar: al guardar el nombre `askName` pasa a false y el formulario
  // desaparecería antes de mostrar su confirmación.
  const [showName] = useState(askName);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [practiceDone, setPracticeDone] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const onPracticeState = (state: WidgetState) => {
    if (state === 'correct' || state === 'revealed') setPracticeDone(true);
  };

  const blocked = step === PRACTICE && !practiceDone;
  const isLast = step === LAST;

  const handleNext = () => {
    if (blocked || finishing) return;
    if (isLast) {
      setFinishing(true);
      onFinish();
    } else {
      go(step + 1);
    }
  };

  const stepTransition = reduced ? { duration: 0.1 } : { duration: DURATION.scene, ease: EASE_OUT_EXPO };
  const shift = reduced ? 0 : SHIFT;

  const primary: CSSProperties = {
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'uppercase',
    minHeight: 'var(--touch-min)',
    padding: 'var(--space-3) var(--space-8)',
    borderRadius: 'var(--radius-pill)',
    border: 'none',
    color: 'var(--on-brand)',
    background: 'var(--brand-600)',
    boxShadow: 'var(--shadow-sm)',
    cursor: blocked ? 'not-allowed' : 'pointer',
    opacity: blocked ? 0.5 : 1,
    transition: 'opacity var(--transition-fast)',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          paddingTop: 'calc(var(--space-4) + env(safe-area-inset-top, 0px))',
          maxWidth: 720,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <Link
          href={exitHref}
          aria-label="Salir de la lección"
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 'var(--touch-min)',
            height: 'var(--touch-min)',
            flexShrink: 0,
            borderRadius: 'var(--radius-pill)',
            color: 'var(--ink-secondary)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 5 L15 15 M15 5 L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>

        <div
          role="group"
          aria-label={`Paso ${step + 1} de ${STEP_NAMES.length}: ${STEP_NAMES[step]}`}
          style={{ display: 'flex', gap: 'var(--space-2)', flex: 1 }}
        >
          {STEP_NAMES.map((name, i) => (
            <div key={name} style={{ flex: 1 }}>
              <ProgressBar value={i <= step ? 1 : 0} max={1} label={`${name}${i <= step ? ' (visto)' : ''}`} height={6} />
            </div>
          ))}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 640,
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-4)',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: shift * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -shift * direction }}
            transition={stepTransition}
          >
            {step === 0 && <StepHook lessonNumber={entry.number} title={entry.title} hook={entry.hook} />}
            {step === 1 && <StepConcept keyConcept={entry.keyConcept} explanation={content.explanation} />}
            {step === 2 && <StepExample example={content.example} />}
            {step === 3 && (
              <StepPractice>
                <PracticeWidget spec={content.practice} onStateChange={onPracticeState} />
              </StepPractice>
            )}
            {step === 4 && (
              <StepSummary summary={content.summary}>
                {showName && onName ? <NamePrompt onAnswer={onName} /> : null}
              </StepSummary>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer
        style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--surface-raised)',
          borderTop: '1px solid var(--border)',
          padding: 'var(--space-4)',
          paddingBottom: 'calc(var(--space-4) + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {blocked && (
          <p
            id="practice-hint"
            style={{
              margin: '0 auto var(--space-3)',
              maxWidth: 640,
              textAlign: 'center',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--ink-secondary)',
            }}
          >
            Resuelve el ejercicio para seguir
          </p>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            maxWidth: 640,
            margin: '0 auto',
          }}
        >
          {step > 0 ? (
            <button
              type="button"
              onClick={() => go(step - 1)}
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--ink-secondary)',
                background: 'transparent',
                border: 'none',
                minHeight: 'var(--touch-min)',
                padding: '0 var(--space-3)',
                cursor: 'pointer',
              }}
            >
              Atrás
            </button>
          ) : (
            <span />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button
              type="button"
              onClick={handleNext}
              aria-disabled={blocked || finishing}
              aria-describedby={blocked ? 'practice-hint' : undefined}
              style={primary}
            >
              {isLast ? 'Terminar lección' : 'Continuar'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
