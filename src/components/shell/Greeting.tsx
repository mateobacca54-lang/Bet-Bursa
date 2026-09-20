'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { GreetingData } from '@/lib/greeting';
import type { TemarioEntry } from '@/content/modulo-1/temario';
import { variants } from '@/lib/motion';
import { Reveal } from '@/components/motion';
import RollingNumber from './RollingNumber';
import SpacedReview from './SpacedReview';
import { getGreetingCopy } from './greeting-copy';

interface GreetingProps {
  data: GreetingData;
  lessons: readonly TemarioEntry[];
  /** Destino del botón principal */
  ctaHref: string;
  /** El usuario pulsó "Lo tengo" en el repaso */
  onReviewed?: (lesson: number) => void;
}

/**
 * Greeting — el saludo del camino (PLAN-MODULO-1.md §5.5).
 *
 * Coreografía (t = segundos desde el montaje):
 *   0.00  titular            fadeUp
 *   0.08  nombre             fadeUp, aparte — es lo que lo hace sentir personal
 *   0.20  subtítulo + botón  fadeUp
 * El camino empieza a dibujarse a los 0.40 (lo decide quien lo monta).
 */
export default function Greeting({ data, lessons, ctaHref, onReviewed }: GreetingProps) {
  const reduced = usePrefersReducedMotion();
  const copy = getGreetingCopy(data, lessons);
  const [reviewDone, setReviewDone] = useState(false);
  const { title } = copy;

  return (
    <section
      aria-labelledby="saludo-titulo"
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-6)',
        textAlign: 'center',
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <h1
        id="saludo-titulo"
        style={{
          margin: 0,
          fontSize: 'clamp(var(--font-size-3xl), 5vw, var(--font-size-4xl))',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--line-height-tight)',
          color: 'var(--ink)',
          textWrap: 'balance',
        }}
      >
        <Reveal
          as="span"
          style={{ display: title.name ? 'inline-block' : 'inline', whiteSpace: title.name ? 'pre' : 'normal' }}
        >
          {title.before}
        </Reveal>
        {title.name && (
          <Reveal as="span" delay={0.08} style={{ display: 'inline-block', color: 'var(--brand-600)' }}>
            {title.name}
          </Reveal>
        )}
        {title.after && (
          <Reveal as="span" delay={0.08} style={{ display: 'inline-block' }}>
            {title.after}
          </Reveal>
        )}
      </h1>

      <Reveal
        as="p"
        delay={0.2}
        style={{
          margin: 0,
          fontSize: 'var(--font-size-lg)',
          lineHeight: 'var(--line-height-normal)',
          color: 'var(--ink-secondary)',
          textWrap: 'balance',
        }}
      >
        {copy.sub.map((segment, i) =>
          segment.kind === 'text' ? (
            <span key={i}>{segment.text}</span>
          ) : (
            <strong key={i} style={{ color: 'var(--ink)', fontWeight: 'var(--font-weight-bold)' }}>
              <RollingNumber value={segment.value} /> de {segment.total}
            </strong>
          )
        )}
      </Reveal>

      <AnimatePresence>
        {copy.review && !reviewDone && (
          <SpacedReview
            key="review"
            lesson={copy.review.lesson}
            concept={copy.review.concept}
            delay={0.3}
            onDone={() => {
              setReviewDone(true);
              onReviewed?.(copy.review!.lesson);
            }}
          />
        )}
      </AnimatePresence>

      <motion.div layout>
        <Reveal delay={0.2}>
          <motion.div
            whileHover={reduced ? undefined : variants.hoverLift}
            whileTap={reduced ? undefined : { scale: 0.98 }}
          >
            <Link
              href={ctaHref}
              className="uppercase-tracking"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                minHeight: 'var(--touch-min)',
                padding: 'var(--space-3) var(--space-8)',
                background: 'var(--brand-600)',
                color: 'var(--on-brand)',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'var(--shadow-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                textDecoration: 'none',
              }}
            >
              {copy.cta}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path
                  d="M5 12h14m-5-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>
        </Reveal>
      </motion.div>
    </section>
  );
}
