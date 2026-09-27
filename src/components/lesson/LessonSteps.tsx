'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import Image from 'next/image';
import { motion, useAnimationControls } from 'framer-motion';
import Reveal from '@/components/motion/Reveal';
import { Estampa, type EstampaScene } from '@/components/illus';
import EjemploVisual from './EjemploVisual';
import { DatoReal } from '@/components/widgets/DatoReal';
import type { IndicadorId } from '@/lib/indicadores/types';
import type { Apuesta } from '@/content/modulo-1/apuestas';
import { Card, Choice, Eyebrow, Heading, Stat } from '@/components/ui';
import type { ChoiceState } from '@/components/ui';
import { DURATION, EASE_OUT_EXPO, DRAW_PATH_DURATION, motionSafe, variants } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { acertoApuesta, faltanPorRevelar, fraseResultadoApuesta } from '@/lib/leccion-pasos';
import { celebrar } from '@/lib/celebrar';

// ============================================================
// Los seis pasos de una lección (DESIGN.md §8): gancho → tu apuesta → la idea →
// un ejemplo de tu día → ahora tú → lo que te llevas. Cada uno pide un gesto: elegir,
// tocar para revelar, resolver. El h1 de cada paso recibe el foco al montarse (para
// lectores de pantalla) sin mostrar el anillo de :focus-visible (globals.css).
// ============================================================

const bodyStyle: CSSProperties = {
  fontSize: 'var(--font-size-lg)',
  lineHeight: 'var(--line-height-loose)',
  color: 'var(--ink)',
  margin: 0,
};

/** Estilo del h1 en los pasos donde el propio rótulo hace de título ("Ahora tú",
 * "Un ejemplo de tu día"): se ve como un Eyebrow pero es semánticamente el h1 del paso. */
const eyebrowHeadingStyle: CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--brand-700)',
  letterSpacing: 'var(--tracking-wide)',
  textTransform: 'uppercase',
  margin: 0,
};

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

/** Reinicio visual mínimo para un `<button>` que envuelve contenido de lectura (sin Card). */
function tapButtonStyle(activo: boolean): CSSProperties {
  return {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    font: 'inherit',
    color: 'inherit',
    cursor: activo ? 'pointer' : 'default',
  };
}

/** Reinicio mínimo para usar `Card` como botón (as="button"): conserva su fondo y filo. */
const cardButtonReset: CSSProperties = {
  width: '100%',
  textAlign: 'left',
  font: 'inherit',
  color: 'inherit',
};

// ─── 1 · Gancho ─────────────────────────────────────────────

export function StepHook({
  lessonNumber,
  title,
  hook,
  scene,
}: {
  lessonNumber: number;
  title: string;
  hook: string;
  /** Ilustración del tema (components/illus). Se posa sobre el papel, sin caja blanca. */
  scene?: EstampaScene | null;
}) {
  return (
    <div>
      <Reveal as="div">
        <Eyebrow tone="brand">
          Lección {lessonNumber} · {title}
        </Eyebrow>
      </Reveal>
      <Reveal delay={0.06} style={{ marginTop: 'var(--space-3)' }}>
        <Heading level={1} variant="display" size="lg" focusOnMount>
          {highlightPesos(hook)}
        </Heading>
      </Reveal>
      {scene && (
        <Reveal
          delay={0.2}
          style={{ marginTop: 'var(--space-6)', position: 'relative', maxWidth: 420, width: '100%', marginInline: 'auto' }}
        >
          <Estampa scene={scene} className="estampa--papel" style={{ width: '100%', height: 'auto', display: 'block' }} />
          <Image
            src="/monedita/monedita.webp"
            alt=""
            width={64}
            height={64}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              display: 'block',
            }}
          />
        </Reveal>
      )}
    </div>
  );
}

// ─── 2 · Tu apuesta ─────────────────────────────────────────

export function StepApuesta({
  apuesta,
  picked,
  onPick,
}: {
  apuesta: Apuesta;
  picked: string | null;
  onPick: (id: string) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const controls = useAnimationControls();
  // Solo salta cuando ESTE montaje pasa de "sin elegir" a "elegido"; si el paso se
  // remonta con una elección ya hecha (al volver atrás y avanzar), no vuelve a saltar.
  const yaSaltoRef = useRef(picked !== null);

  useEffect(() => {
    if (picked !== null && !yaSaltoRef.current) {
      yaSaltoRef.current = true;
      void controls.start(motionSafe(variants, reduced).hop);
    }
  }, [picked, reduced, controls]);

  return (
    <div>
      <Reveal as="div">
        <Eyebrow tone="brand">Tu apuesta</Eyebrow>
      </Reveal>
      <Reveal delay={0.06} style={{ marginTop: 'var(--space-3)' }}>
        <Heading level={1} variant="display" size="md" focusOnMount>
          {highlightPesos(apuesta.pregunta)}
        </Heading>
      </Reveal>
      <Reveal delay={0.14} style={{ marginTop: 'var(--space-6)', display: 'grid', gap: 'var(--space-3)' }}>
        {apuesta.opciones.map((opcion) => {
          const state: ChoiceState = picked ? (picked === opcion.id ? 'selected' : 'disabled') : 'idle';
          return (
            <Choice key={opcion.id} state={state} onClick={() => onPick(opcion.id)}>
              {opcion.texto}
            </Choice>
          );
        })}
      </Reveal>
      <div aria-live="polite" style={{ marginTop: 'var(--space-6)', minHeight: 56 }}>
        {picked !== null && (
          <Reveal style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <motion.div animate={controls} style={{ flexShrink: 0 }}>
              <Image src="/monedita/monedita-pensando.webp" alt="" width={48} height={48} style={{ display: 'block' }} />
            </motion.div>
            <p style={{ margin: 0, color: 'var(--ink-secondary)', fontSize: 'var(--font-size-base)' }}>
              Anotado. Vamos a ver si aciertas.
            </p>
          </Reveal>
        )}
      </div>
    </div>
  );
}

// ─── 3 · La idea ────────────────────────────────────────────

export function StepIdea({
  keyConcept,
  frases,
  revealCount,
  onReveal,
}: {
  keyConcept: string;
  frases: string[];
  revealCount: number;
  onReveal: () => void;
}) {
  const total = frases.length;
  const visibles = frases.slice(0, revealCount);
  const faltan = faltanPorRevelar(revealCount, total);

  return (
    <div>
      <Reveal as="div">
        <Eyebrow tone="brand">La idea</Eyebrow>
      </Reveal>
      <Reveal delay={0.06} style={{ marginTop: 'var(--space-3)' }}>
        <Card
          as="button"
          type="button"
          variant="raised"
          pad="lg"
          onClick={faltan ? onReveal : undefined}
          aria-disabled={!faltan}
          aria-label={faltan ? 'Toca para seguir leyendo la idea' : undefined}
          style={{ ...cardButtonReset, background: 'var(--brand-50)', borderColor: 'var(--brand-100)', cursor: faltan ? 'pointer' : 'default' }}
        >
          <Heading level={1} variant="display" size="md" focusOnMount>
            {keyConcept}
          </Heading>
        </Card>
      </Reveal>
      <div style={{ marginTop: 'var(--space-6)', display: 'grid', gap: 'var(--space-3)' }}>
        {visibles.map((frase, i) => (
          <Reveal key={i} as="p" instant={i < visibles.length - 1} style={bodyStyle}>
            {highlightPesos(frase)}
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─── 4 · Un ejemplo de tu día ───────────────────────────────

export function StepEjemplo({
  frases,
  lesson,
  datoReal,
  revealCount,
  onReveal,
}: {
  frases: string[];
  lesson?: number;
  datoReal?: IndicadorId[];
  revealCount: number;
  onReveal: () => void;
}) {
  const total = frases.length;
  const visibles = frases.slice(0, revealCount);
  const faltan = faltanPorRevelar(revealCount, total);

  return (
    <div>
      <button
        type="button"
        onClick={faltan ? onReveal : undefined}
        aria-disabled={!faltan}
        aria-label={faltan ? 'Toca para seguir el ejemplo' : undefined}
        style={tapButtonStyle(faltan)}
      >
        <Heading level={1} variant="title" size="sm" focusOnMount style={eyebrowHeadingStyle}>
          Un ejemplo de tu día
        </Heading>
        <div style={{ marginTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-3)' }}>
          {visibles.map((frase, i) => (
            <Reveal key={i} as="p" instant={i < visibles.length - 1} style={bodyStyle}>
              {highlightPesos(frase)}
            </Reveal>
          ))}
        </div>
        {lesson !== undefined && <EjemploVisual lesson={lesson} step={revealCount} />}
      </button>
      {datoReal && datoReal.length > 0 && <DatoReal indicadores={datoReal} />}
    </div>
  );
}

// ─── 5 · Ahora tú ───────────────────────────────────────────

export function StepPractice({ children }: { children: ReactNode }) {
  return (
    <div>
      <Reveal>
        <Heading level={1} variant="title" size="sm" focusOnMount style={eyebrowHeadingStyle}>
          Ahora tú
        </Heading>
      </Reveal>
      <Reveal delay={0.06} style={{ marginTop: 'var(--space-4)' }}>
        {children}
      </Reveal>
    </div>
  );
}

// ─── 6 · Lo que te llevas ───────────────────────────────────

/**
 * Monedita celebra al terminar la lección: un salto (`hop`) justo cuando el trazo del check
 * termina de dibujarse. Bajo prefers-reduced-motion no salta: solo aparece.
 */
function CelebrateMonedita({ reduced }: { reduced: boolean }) {
  const hop = motionSafe(variants, reduced).hop;
  return (
    <motion.div
      style={{ flexShrink: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, ...(reduced ? {} : { y: hop.y, rotate: hop.rotate }) }}
      transition={{
        opacity: { duration: reduced ? 0.1 : DURATION.element, delay: reduced ? 0 : DURATION.scene },
        y: { ...hop.transition, delay: DURATION.scene + DURATION.element },
        rotate: { ...hop.transition, delay: DURATION.scene + DURATION.element },
      }}
    >
      <Image src="/monedita/monedita-celebra.webp" alt="" width={84} height={84} style={{ display: 'block', height: 'auto' }} />
    </motion.div>
  );
}

/** Lanza el confeti grande una sola vez por montaje del paso (DESIGN.md §7: "Terminar la lección"). */
function useCelebrarAlEntrar(reduced: boolean) {
  const yaCelebroRef = useRef(false);
  useEffect(() => {
    if (yaCelebroRef.current) return;
    yaCelebroRef.current = true;
    celebrar('grande', { reduced });
  }, [reduced]);
}

export function StepResumen({
  summary,
  apuesta,
  apuestaPick,
  leccionNumero,
  totalLecciones,
  children,
}: {
  summary: string;
  /** null si esta lección no tiene apuesta (no debería pasar; ver apuestas.ts). */
  apuesta: Apuesta | null;
  apuestaPick: string | null;
  leccionNumero: number;
  totalLecciones: number;
  children?: ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  useCelebrarAlEntrar(reduced);

  const opcionElegida = apuesta?.opciones.find((o) => o.id === apuestaPick) ?? null;
  const acerto = apuesta ? acertoApuesta(apuestaPick, apuesta.acierto) : false;

  return (
    <div>
      <div aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ display: 'block', flexShrink: 0 }}>
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
        <CelebrateMonedita reduced={reduced} />
      </div>

      <Reveal as="div">
        <Eyebrow tone="brand">Lo que te llevas</Eyebrow>
      </Reveal>
      <Reveal delay={0.06} style={{ marginTop: 'var(--space-3)' }}>
        <Heading level={1} variant="display" size="md" focusOnMount>
          {highlightPesos(summary)}
        </Heading>
      </Reveal>

      {apuesta && opcionElegida && (
        <Reveal delay={0.12} style={{ marginTop: 'var(--space-6)' }}>
          <Card variant="sunk" pad="md">
            <p style={{ margin: '0 0 var(--space-2) 0', color: 'var(--ink)', fontWeight: 'var(--font-weight-semibold)' }}>
              Apostaste: «{opcionElegida.texto}»
            </p>
            <p style={{ margin: '0 0 var(--space-2) 0', color: acerto ? 'var(--brand-700)' : 'var(--ink)', fontWeight: 'var(--font-weight-semibold)' }}>
              {fraseResultadoApuesta(acerto)}
            </p>
            <p style={{ margin: 0, color: 'var(--ink-secondary)', lineHeight: 'var(--line-height-normal)' }}>
              {highlightPesos(apuesta.cierre)}
            </p>
          </Card>
        </Reveal>
      )}

      <Reveal delay={0.18} style={{ marginTop: 'var(--space-8)' }}>
        <Stat value={leccionNumero} suffix={` de ${totalLecciones}`} label="Llevas en el módulo 1" />
      </Reveal>

      {children && (
        <Reveal delay={0.24} style={{ marginTop: 'var(--space-8)' }}>
          {children}
        </Reveal>
      )}
    </div>
  );
}
