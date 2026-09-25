'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import './landing.css';

/** Palabras que se resaltan con el color de marca (no cambian el texto, solo el énfasis) */
const EMPHASIS = new Set(['dinero', 'mercados', 'pesos', 'jerga.']);
const TEXT =
  'Tu plata toma decisiones todos los días: la empanada que subió, el préstamo a un amigo, la cuota del celular. Bursa te enseña cómo funciona el dinero y los mercados donde se mueve, con ejemplos en pesos y sin jerga.';
const WORDS = TEXT.split(' ');
/**
 * Opacidad de una palabra que aún no "se ha leído". No baja de 0,72: desde que la sección
 * es de papel (2026-09-26), atenuar tinta oscura sobre fondo claro pierde contraste mucho
 * más rápido que atenuar blanco sobre negro — y las palabras en naranja son las primeras
 * en caer por debajo de 3 : 1 (mínimo WCAG AA para texto grande).
 */
const DIM = 0.82;

function Word({ word, index, progress, reduced }: { word: string; index: number; progress: MotionValue<number>; reduced: boolean }) {
  const start = index / WORDS.length;
  const end = Math.min(1, start + 1.6 / WORDS.length);
  const opacity = useTransform(progress, [start, end], [DIM, 1]);
  return (
    <motion.span
      style={reduced ? undefined : { opacity }}
      className={EMPHASIS.has(word.replace(/[,]/g, '')) ? 'lp-accent' : undefined}
    >
      {word}{' '}
    </motion.span>
  );
}

/**
 * Manifesto — el texto se "lee" al hacer scroll: cada palabra pasa de tenue a plena.
 * Solo opacidad, ligada al scroll. Con reduced-motion el texto se ve completo desde el principio.
 */
export default function Manifesto() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.55'] });

  return (
    <section ref={ref} className="lp-manifesto" aria-label="Qué es Bursa">
      <p>
        {WORDS.map((w, i) => (
          <Word key={i} word={w} index={i} progress={scrollYProgress} reduced={reduced} />
        ))}
      </p>
    </section>
  );
}
