'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_QUART } from '@/lib/motion';

interface SpacedReviewProps {
  /** Número de la lección que se repasa */
  lesson: number;
  /** Concepto clave: UNA frase (el temario pide repasar la idea, no la lección) */
  concept: string;
  onDone: () => void;
  /** Segundos de espera antes de entrar */
  delay?: number;
}

/**
 * SpacedReview — refuerzo espaciado de 10 segundos (temario, "Principios").
 *
 * Vive dentro del saludo: una frase y un botón. Entra con scale .96→1 + fade y sale igual;
 * el contenido de debajo sube con una animación de layout (transform), no animando alturas.
 * Se monta dentro de un <AnimatePresence> del contenedor para que la salida se anime.
 */
export default function SpacedReview({ lesson, concept, onDone, delay = 0 }: SpacedReviewProps) {
  const reduced = usePrefersReducedMotion();

  const hidden = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 };
  const shown = reduced ? { opacity: 1 } : { opacity: 1, scale: 1 };
  const transition = reduced
    ? { duration: 0.1 }
    : { duration: DURATION.element, ease: EASE_OUT_QUART, delay };

  return (
    <motion.section
      layout
      aria-label={`Repaso de la lección ${lesson}`}
      initial={hidden}
      animate={shown}
      exit={{ ...hidden, transition: { duration: reduced ? 0.1 : DURATION.element, ease: EASE_OUT_QUART } }}
      transition={transition}
      style={{
        textAlign: 'left',
        background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-md)',
        borderLeft: '4px solid var(--brand-600)',
        boxShadow: 'var(--shadow-md)',
        padding: 'var(--space-4) var(--space-6)',
        maxWidth: 520,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <span
        className="uppercase-tracking"
        style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--brand-700)',
        }}
      >
        Repaso de 10 segundos · lección {lesson}
      </span>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          lineHeight: 'var(--line-height-tight)',
          color: 'var(--ink)',
        }}
      >
        {concept}
      </p>
      <div>
        <motion.button
          type="button"
          onClick={onDone}
          whileTap={reduced ? undefined : { scale: 0.97 }}
          style={{
            minHeight: 'var(--touch-min)',
            padding: 'var(--space-2) var(--space-6)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--ink)',
            background: 'transparent',
            border: '2px solid var(--brand-600)',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
          }}
        >
          Lo tengo
        </motion.button>
      </div>
    </motion.section>
  );
}
