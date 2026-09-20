'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO } from '@/lib/motion';

interface ProgressBarProps {
  value: number;
  max: number;
  /** Texto para lectores de pantalla, ej. "Progreso del módulo 1" */
  label: string;
  /** Alto en px. Por defecto 8 */
  height?: number;
}

/**
 * ProgressBar — el relleno crece con `scaleX` desde la izquierda (solo transform).
 */
export default function ProgressBar({ value, max, label, height = 8 }: ProgressBarProps) {
  const reduced = usePrefersReducedMotion();
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{
        height,
        width: '100%',
        background: 'var(--border)',
        borderRadius: 'var(--radius-pill)',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: ratio }}
        transition={reduced ? { duration: 0.1 } : { duration: DURATION.scene, ease: EASE_OUT_EXPO }}
        style={{
          height: '100%',
          width: '100%',
          transformOrigin: 'left center',
          background: 'linear-gradient(90deg, var(--brand-500), var(--brand-600))',
          borderRadius: 'var(--radius-pill)',
        }}
      />
    </div>
  );
}
