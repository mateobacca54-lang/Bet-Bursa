'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Reveal from '@/components/motion/Reveal';
import { DURATION, EASE_OUT_EXPO, DRAW_PATH_DURATION } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

// ============================================================
// Los cinco pasos de una lección. Cada uno es una pantalla corta:
// una sola idea, tipografía grande, y el título del paso recibe el foco
// para que un lector de pantalla anuncie el cambio.
// ============================================================

const eyebrowStyle: CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--brand-700)',
  letterSpacing: 'var(--tracking-wide)',
  textTransform: 'uppercase',
  margin: '0 0 var(--space-3) 0',
};

const bodyStyle: CSSProperties = {
  fontSize: 'var(--font-size-lg)',
  lineHeight: 'var(--line-height-loose)',
  color: 'var(--ink)',
  margin: 0,
};

/** Título de paso: recibe el foco al montarse (sin anillo: no es un control). */
function StepHeading({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <h1
      ref={ref}
      tabIndex={-1}
      style={{
        margin: 0,
        outline: 'none',
        color: 'var(--ink)',
        lineHeight: 'var(--line-height-tight)',
        fontWeight: 'var(--font-weight-bold)',
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

/** Resalta las cifras en pesos ("$8.000") para que el ojo las encuentre. */
function highlightPesos(text: string): ReactNode[] {
  return text.split(/(\$\s?\d[\d.,]*)/g).map((part, i) =>
    /^\$\s?\d/.test(part) ? (
      <strong key={i} style={{ color: 'var(--brand-700)', fontWeight: 'var(--font-weight-bold)' }}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

// ─── 1 · Gancho ─────────────────────────────────────────────

export function StepHook({ lessonNumber, title, hook }: { lessonNumber: number; title: string; hook: string }) {
  return (
    <div>
      <Reveal as="p" style={eyebrowStyle}>
        Lección {lessonNumber} · {title}
      </Reveal>
      <Reveal delay={0.06}>
        <StepHeading style={{ fontSize: 'var(--font-size-3xl)' }}>{highlightPesos(hook)}</StepHeading>
      </Reveal>
    </div>
  );
}

// ─── 2 · Concepto ───────────────────────────────────────────

export function StepConcept({ keyConcept, explanation }: { keyConcept: string; explanation: string }) {
  return (
    <div>
      <Reveal as="p" style={eyebrowStyle}>
        La idea
      </Reveal>
      <Reveal delay={0.06}>
        <div
          style={{
            background: 'var(--brand-50)',
            borderLeft: '4px solid var(--brand-600)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <StepHeading style={{ fontSize: 'var(--font-size-2xl)' }}>{keyConcept}</StepHeading>
        </div>
      </Reveal>
      <Reveal delay={0.12}>
        <p style={bodyStyle}>{highlightPesos(explanation)}</p>
      </Reveal>
    </div>
  );
}

// ─── 3 · Ejemplo ────────────────────────────────────────────

export function StepExample({ example }: { example: string }) {
  return (
    <div>
      <Reveal as="p" style={eyebrowStyle}>
        Un ejemplo de tu día
      </Reveal>
      <Reveal delay={0.06}>
        <StepHeading style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-medium)', lineHeight: 'var(--line-height-loose)' }}>
          {highlightPesos(example)}
        </StepHeading>
      </Reveal>
    </div>
  );
}

// ─── 4 · Práctica ───────────────────────────────────────────

export function StepPractice({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* Es el h1 del paso (los widgets usan h2) y recibe el foco; se ve como el resto de rótulos. */}
      <Reveal>
        <StepHeading style={{ ...eyebrowStyle, color: 'var(--brand-700)', fontWeight: 'var(--font-weight-semibold)', lineHeight: 'var(--line-height-normal)' }}>
          Ahora tú
        </StepHeading>
      </Reveal>
      <Reveal delay={0.06}>{children}</Reveal>
    </div>
  );
}

// ─── 5 · Resumen ────────────────────────────────────────────

export function StepSummary({ summary, children }: { summary: string; children?: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div>
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        aria-hidden="true"
        style={{ display: 'block', marginBottom: 'var(--space-4)' }}
      >
        <circle cx="28" cy="28" r="28" fill="var(--brand-50)" />
        <motion.path
          d="M17 29.5 L25 37 L39 20"
          fill="none"
          stroke="var(--brand-600)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={reduced ? { duration: 0 } : { duration: DRAW_PATH_DURATION / 2, ease: EASE_OUT_EXPO, delay: DURATION.element }}
        />
      </svg>
      <Reveal as="p" style={eyebrowStyle}>
        Lo que te llevas
      </Reveal>
      <Reveal delay={0.06}>
        <StepHeading style={{ fontSize: 'var(--font-size-xl)', lineHeight: 'var(--line-height-normal)' }}>
          {highlightPesos(summary)}
        </StepHeading>
      </Reveal>
      {children && (
        <Reveal delay={0.14} style={{ marginTop: 'var(--space-8)' }}>
          {children}
        </Reveal>
      )}
    </div>
  );
}
