'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { TemarioEntry } from '@/content/modulo-1/temario';
import { MODULO_1 } from '@/content/modulo-1/temario';
import type { LessonContent } from '@/content/modulo-1/lecciones';
import { apuestaDeLeccion } from '@/content/modulo-1/apuestas';
import { escenaDeLeccion } from '@/content/modulo-1/escenas';
import type { WidgetState } from '@/lib/types';
import { Button, ProgressBar } from '@/components/ui';
import { DURATION, EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useReservarEsquina } from '@/lib/useReservarEsquina';
import { dividirEnFrases, faltanPorRevelar, siguienteRevelacion } from '@/lib/leccion-pasos';
import { StepHook, StepApuesta, StepIdea, StepEjemplo, StepPractice, StepResumen } from './LessonSteps';
import PracticeWidget from './PracticeWidget';
import NamePrompt from './NamePrompt';
import EmailPrompt from './EmailPrompt';

const STEP_NAMES = ['Gancho', 'Tu apuesta', 'La idea', 'Un ejemplo', 'Ahora tú', 'Lo que te llevas'] as const;
const HOOK = 0;
const APUESTA = 1;
const IDEA = 2;
const EJEMPLO = 3;
const PRACTICE = 4;
const RESUMEN = STEP_NAMES.length - 1; // 5
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
  /** Si se debe ofrecer avisar por correo (solo tras la lección 1, una vez) */
  askEmail?: boolean;
  onEmailAnswered?: () => void;
}

/**
 * LessonPlayer — máquina de seis pasos (DESIGN.md §8): gancho → tu apuesta → la idea →
 * un ejemplo de tu día → ahora tú → lo que te llevas. Cada paso entra desplazándose
 * 24 px desde el lado hacia el que avanzas y sale en espejo. Bajo reduced-motion solo
 * hay un cross-fade.
 *
 * "La idea" y "Un ejemplo de tu día" revelan su texto frase por frase: mientras faltan,
 * el botón principal dice "Seguir" y solo revela la próxima; cuando ya se vieron todas,
 * pasa a hacer lo de siempre ("Continuar"). "Tu apuesta" y "Ahora tú" bloquean el avance
 * (sin elegir, o sin resolver el ejercicio) en vez de reetiquetar el botón.
 */
export default function LessonPlayer({
  entry,
  content,
  exitHref,
  onFinish,
  askName = false,
  onName,
  askEmail = false,
  onEmailAnswered,
}: LessonPlayerProps) {
  const reduced = usePrefersReducedMotion();
  // El botón de ayuda (fijo, misma esquina) sube para no montarse sobre el pie.
  const pieRef = useReservarEsquina<HTMLElement>();
  // Se deciden al montar: si cambiaran a mitad de camino, el formulario que ya se
  // está mostrando desaparecería antes de mostrar su propia confirmación.
  const [showName] = useState(askName);
  const [showEmail] = useState(askEmail);
  // Una pregunta a la vez: el correo no aparece hasta que el nombre ya se contestó
  // (o si no había nombre que preguntar, aparece de una vez).
  const [nameDone, setNameDone] = useState(!showName);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [apuestaPick, setApuestaPick] = useState<string | null>(null);
  const [ideaReveal, setIdeaReveal] = useState(1);
  const [ejemploReveal, setEjemploReveal] = useState(1);
  const [practiceDone, setPracticeDone] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const apuesta = useMemo(() => apuestaDeLeccion(entry.number), [entry.number]);
  const ideaFrases = useMemo(() => dividirEnFrases(content.explanation), [content.explanation]);
  const ejemploFrases = useMemo(() => dividirEnFrases(content.example), [content.example]);

  const go = (next: number) => {
    // Cada visita al paso empieza mostrando solo la primera frase, para que revelar
    // "frase por frase" tenga siempre el mismo sentido, incluso volviendo con "Atrás".
    if (next === IDEA) setIdeaReveal(1);
    if (next === EJEMPLO) setEjemploReveal(1);
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const onPracticeState = (state: WidgetState) => {
    if (state === 'correct' || state === 'revealed') setPracticeDone(true);
  };

  const idaFaltan = step === IDEA && faltanPorRevelar(ideaReveal, ideaFrases.length);
  const ejemploFaltan = step === EJEMPLO && faltanPorRevelar(ejemploReveal, ejemploFrases.length);
  const blocked = (step === APUESTA && apuestaPick === null) || (step === PRACTICE && !practiceDone);
  const isLast = step === RESUMEN;

  const primaryLabel = idaFaltan || ejemploFaltan ? 'Seguir' : isLast ? 'Terminar lección' : 'Continuar';
  const hintText =
    step === PRACTICE && blocked
      ? 'Resuelve el ejercicio para seguir'
      : step === APUESTA && blocked
        ? 'Elige una opción para seguir'
        : null;

  const handleNext = () => {
    if (finishing || blocked) return;
    if (idaFaltan) {
      setIdeaReveal((r) => siguienteRevelacion(r, ideaFrases.length));
      return;
    }
    if (ejemploFaltan) {
      setEjemploReveal((r) => siguienteRevelacion(r, ejemploFrases.length));
      return;
    }
    if (isLast) {
      setFinishing(true);
      onFinish();
      return;
    }
    go(step + 1);
  };

  const stepTransition = reduced ? { duration: 0.1 } : { duration: DURATION.scene, ease: EASE_OUT_EXPO };
  const shift = reduced ? 0 : SHIFT;

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    paddingTop: 'calc(var(--space-4) + env(safe-area-inset-top, 0px))',
    maxWidth: 720,
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      <header style={headerStyle}>
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
              <ProgressBar value={i <= step ? 1 : 0} max={1} label={`${name}${i <= step ? ' (visto)' : ''}`} size="thin" />
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
            {step === HOOK && (
              <StepHook lessonNumber={entry.number} title={entry.title} hook={entry.hook} scene={escenaDeLeccion(entry.number)} />
            )}
            {step === APUESTA && apuesta && (
              <StepApuesta apuesta={apuesta} picked={apuestaPick} onPick={setApuestaPick} />
            )}
            {step === IDEA && (
              <StepIdea
                keyConcept={entry.keyConcept}
                frases={ideaFrases}
                revealCount={ideaReveal}
                onReveal={() => setIdeaReveal((r) => siguienteRevelacion(r, ideaFrases.length))}
              />
            )}
            {step === EJEMPLO && (
              <StepEjemplo
                frases={ejemploFrases}
                lesson={entry.number}
                datoReal={content.datoReal}
                revealCount={ejemploReveal}
                onReveal={() => setEjemploReveal((r) => siguienteRevelacion(r, ejemploFrases.length))}
              />
            )}
            {step === PRACTICE && (
              <StepPractice>
                <PracticeWidget spec={content.practice} onStateChange={onPracticeState} />
              </StepPractice>
            )}
            {step === RESUMEN && (
              <StepResumen
                summary={content.summary}
                apuesta={apuesta}
                apuestaPick={apuestaPick}
                leccionNumero={entry.number}
                totalLecciones={MODULO_1.lessonCount}
              >
                {showName && onName && !nameDone ? (
                  <NamePrompt
                    onAnswer={(name) => {
                      onName(name);
                      setNameDone(true);
                    }}
                  />
                ) : showEmail && onEmailAnswered ? (
                  <EmailPrompt onAnswer={onEmailAnswered} />
                ) : null}
              </StepResumen>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer
        ref={pieRef}
        style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--paper)',
          borderTop: '1px solid var(--border-hairline)',
          padding: 'var(--space-4)',
          paddingBottom: 'calc(var(--space-4) + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {hintText && (
          <p
            id="lesson-hint"
            style={{
              margin: '0 auto var(--space-3)',
              maxWidth: 640,
              textAlign: 'center',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--ink-secondary)',
            }}
          >
            {hintText}
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
            <Button variant="ghost" onClick={() => go(step - 1)}>
              Atrás
            </Button>
          ) : (
            <span />
          )}

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={blocked || finishing}
            aria-describedby={hintText ? 'lesson-hint' : undefined}
          >
            {primaryLabel}
          </Button>
        </div>
      </footer>
    </div>
  );
}
