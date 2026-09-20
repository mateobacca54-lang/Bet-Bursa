'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { variants } from '@/lib/motion';

type Tag = 'div' | 'span' | 'p' | 'h1' | 'h2' | 'li';

interface RevealProps {
  /** Segundos de espera antes de entrar */
  delay?: number;
  as?: Tag;
  style?: CSSProperties;
  className?: string;
  /**
   * Salta al estado final sin animar. Puede pasar de false a true en cualquier momento
   * (p. ej. cuando el usuario interactúa): "nada bloquea al usuario" (AGENTS.md).
   */
  instant?: boolean;
  children: ReactNode;
}

/** Bajo prefers-reduced-motion: solo aparece (cross-fade de 100 ms), nunca se desplaza. */
const REDUCED_TRANSITION = { duration: 0.1 };
const INSTANT = { opacity: 1, y: 0, transition: { duration: 0 } };

/**
 * Reveal — entrada `fadeUp` que respeta prefers-reduced-motion.
 *
 * Es el único sitio donde los componentes de Bursa aplican `fadeUp`, para que la regla
 * de reduced-motion (AGENTS.md) viva en un solo lugar y no se repita.
 */
export default function Reveal({
  delay = 0,
  as = 'div',
  style,
  className,
  instant = false,
  children,
}: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (reduced) {
    return (
      <Tag
        className={className}
        style={style}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={REDUCED_TRANSITION}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      style={style}
      initial={{ opacity: 0, y: 12 }}
      animate={
        instant
          ? INSTANT
          : { ...variants.fadeUp, transition: { ...variants.fadeUp.transition, delay } }
      }
    >
      {children}
    </Tag>
  );
}
