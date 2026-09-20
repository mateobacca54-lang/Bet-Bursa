'use client';

import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO } from '@/lib/motion';

interface RollingNumberProps {
  value: number;
  style?: CSSProperties;
}

/**
 * RollingNumber — la cifra rueda hacia arriba cuando cambia.
 *
 * Solo se mueve cuando `value` CAMBIA; en el primer render aparece quieta. Es el único
 * momento en que un número se mueve solo (racha, progreso del módulo).
 * Bajo reduced-motion: cross-fade de 100 ms, sin desplazamiento.
 */
export default function RollingNumber({ value, style }: RollingNumberProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
        verticalAlign: 'bottom',
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          style={{ display: 'inline-block' }}
          initial={reduced ? { opacity: 0 } : { y: '70%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { y: '-70%', opacity: 0 }}
          transition={reduced ? { duration: 0.1 } : { duration: DURATION.scene, ease: EASE_OUT_EXPO }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
