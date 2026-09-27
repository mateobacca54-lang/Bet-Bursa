'use client';

import Link from 'next/link';
import { motion, useAnimationControls } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { NODE_SIZE } from '@/lib/path-geometry';
import { DURATION, EASE_OUT_QUART, variants } from '@/lib/motion';
import { Reveal } from '@/components/motion';

export type NodeState = 'completed' | 'current' | 'locked';

interface LessonNodeProps {
  number: number;
  state: NodeState;
  /** Centro del nodo, en px dentro del lienzo */
  x: number;
  y: number;
  href: string;
  /** Texto completo para lectores de pantalla */
  label: string;
  /** Segundos de espera antes de entrar */
  delay: number;
  instant: boolean;
  /** id del peek, mientras está abierto */
  describedBy?: string;
  onEnter: (lesson: number) => void;
  onLeave: () => void;
  onLockedAttempt: (lesson: number) => void;
}

/** Duración del pulso del halo: dos "historias" lentas, no un parpadeo */
const HALO_DURATION = DURATION.story * 2;

/** Blanco de la superficie con transparencia: viene de tokens, no es un valor nuevo */
const onDark = (percent: number) =>
  `color-mix(in srgb, var(--surface-raised) ${percent}%, transparent)`;

const circle = {
  width: NODE_SIZE,
  height: NODE_SIZE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--radius-pill)',
  fontFamily: 'var(--font-family)',
  fontSize: 'var(--font-size-base)',
  fontWeight: 'var(--font-weight-bold)',
  textDecoration: 'none',
  padding: 0,
} as const;

const STATE_STYLE = {
  completed: {
    background: 'var(--brand-600)',
    color: 'var(--on-brand)',
    border: '2px solid var(--brand-400)',
    boxShadow: 'var(--shadow-md)',
  },
  current: {
    background: 'var(--surface-raised)',
    color: 'var(--ink)',
    border: '3px solid var(--brand-500)',
    boxShadow: 'var(--shadow-md)',
  },
  locked: {
    background: onDark(10),
    color: onDark(60),
    border: `2px dashed ${onDark(28)}`,
    boxShadow: 'none',
  },
} as const;

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * LessonNode — un punto sobre la gráfica.
 *
 *   completed  relleno naranja + check
 *   current    blanco con borde naranja y un halo que pulsa (la siguiente lección)
 *   locked     el número apagado con borde punteado: "por abrir", no "prohibido".
 *              Al pulsarlo hace shake y NO navega.
 *
 * Es un <Link> o un <button> real, nunca un div con onClick.
 */
export default function LessonNode({
  number,
  state,
  x,
  y,
  href,
  label,
  delay,
  instant,
  describedBy,
  onEnter,
  onLeave,
  onLockedAttempt,
}: LessonNodeProps) {
  const reduced = usePrefersReducedMotion();
  const shake = useAnimationControls();
  const style = { ...circle, ...STATE_STYLE[state] };

  const handlers = {
    onMouseEnter: () => onEnter(number),
    onMouseLeave: onLeave,
    onFocus: () => onEnter(number),
    onBlur: onLeave,
    'aria-describedby': describedBy,
  };

  return (
    <Reveal
      as="li"
      delay={delay}
      instant={instant}
      style={{
        position: 'absolute',
        left: x - NODE_SIZE / 2,
        top: y - NODE_SIZE / 2,
        width: NODE_SIZE,
        height: NODE_SIZE,
        listStyle: 'none',
      }}
    >
      {state === 'current' && (
        <motion.span
          aria-hidden="true"
          animate={reduced ? { opacity: 0.35 } : { scale: [1, 1.9], opacity: [0.6, 0] }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: HALO_DURATION, ease: EASE_OUT_QUART, repeat: Infinity }
          }
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'var(--radius-pill)',
            border: '2px solid var(--brand-500)',
            pointerEvents: 'none',
          }}
        />
      )}

      <motion.div
        animate={shake}
        whileHover={reduced ? undefined : variants.hoverLift}
        style={{ position: 'relative' }}
      >
        {state === 'locked' ? (
          <button
            type="button"
            aria-disabled="true"
            aria-label={label}
            {...handlers}
            onClick={() => {
              if (!reduced) shake.start(variants.shake);
              onLockedAttempt(number);
            }}
            style={{ ...style, cursor: 'pointer' }}
          >
            {number}
          </button>
        ) : (
          <Link
            href={href}
            aria-label={label}
            aria-current={state === 'current' ? 'step' : undefined}
            {...handlers}
            style={style}
          >
            {state === 'completed' ? <CheckIcon /> : number}
          </Link>
        )}
      </motion.div>
    </Reveal>
  );
}
