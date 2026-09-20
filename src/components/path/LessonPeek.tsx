'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { TemarioEntry } from '@/content/modulo-1/temario';
import { DURATION, EASE_OUT_QUART } from '@/lib/motion';

export const PEEK_WIDTH = 264;

interface LessonPeekProps {
  lesson: TemarioEntry;
  locked: boolean;
  id: string;
}

/**
 * LessonPeek — tarjeta que aparece al pasar por un nodo (o al enfocarlo con teclado).
 * Muestra el GANCHO de la lección, tal cual está en el temario. Si la lección está
 * bloqueada, dice cuándo se abre: sin reproche, sin urgencia.
 */
export default function LessonPeek({ lesson, locked, id }: LessonPeekProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      id={id}
      role="tooltip"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
      transition={
        reduced ? { duration: 0.1 } : { duration: DURATION.element, ease: EASE_OUT_QUART }
      }
      style={{
        width: PEEK_WIDTH,
        padding: 'var(--space-4)',
        background: 'var(--surface-raised)',
        color: 'var(--ink)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        pointerEvents: 'none',
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
        Lección {lesson.number}
      </span>
      <strong
        style={{
          fontSize: 'var(--font-size-base)',
          lineHeight: 'var(--line-height-tight)',
        }}
      >
        {lesson.title}
      </strong>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-size-sm)',
          lineHeight: 'var(--line-height-normal)',
          color: 'var(--ink-secondary)',
        }}
      >
        {lesson.hook}
      </p>
      {locked && (
        <span
          style={{
            marginTop: 'var(--space-1)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--border)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--ink-secondary)',
          }}
        >
          Se abre cuando termines la lección {lesson.number - 1}.
        </span>
      )}
    </motion.div>
  );
}
