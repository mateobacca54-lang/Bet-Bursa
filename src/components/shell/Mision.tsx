'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_QUART } from '@/lib/motion';

interface MisionProps {
  /** La tarea, literal del temario (ver src/content/modulo-1/mision.ts) */
  texto: string;
  onDone: () => void;
  /** Segundos de espera antes de entrar */
  delay?: number;
}

/**
 * Mision — la única tarea que Bursa pide fuera de la pantalla (ARQUITECTURA §2, "Los
 * cuatro refuerzos"). No se corrige: solo se reconoce. Vive en el saludo del módulo
 * completo, como SpacedReview vive en el de "volviste tarde" — mismo lenguaje visual,
 * para que se sienta parte del mismo mecanismo y no una pantalla aparte.
 */
export default function Mision({ texto, onDone, delay = 0 }: MisionProps) {
  const reduced = usePrefersReducedMotion();

  const hidden = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 };
  const shown = reduced ? { opacity: 1 } : { opacity: 1, scale: 1 };
  const transition = reduced
    ? { duration: 0.1 }
    : { duration: DURATION.element, ease: EASE_OUT_QUART, delay };

  return (
    <motion.section
      layout
      aria-label="Tu misión de este módulo"
      initial={hidden}
      animate={shown}
      exit={{ ...hidden, transition: { duration: reduced ? 0.1 : DURATION.element, ease: EASE_OUT_QUART } }}
      transition={transition}
      style={{
        textAlign: 'left',
        background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-md)',
        borderLeft: '4px solid var(--gold-500, var(--brand-600))',
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
        Tu misión de este módulo
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
        {texto}
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
          Ya lo hice
        </motion.button>
      </div>
    </motion.section>
  );
}
