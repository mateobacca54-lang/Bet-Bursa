'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, cubicBezier } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { TemarioEntry } from '@/content/modulo-1/temario';
import { getPathLayout, NODE_SIZE, type PathLayout, type PathPoint } from '@/lib/path-geometry';
import { DRAW_PATH_DURATION, EASE_OUT_EXPO, staggerDelay } from '@/lib/motion';
import { timeForProgress } from '@/lib/motion-math';
import { Reveal } from '@/components/motion';
import PathLine from './PathLine';
import LessonNode, { type NodeState } from './LessonNode';
import LessonPeek, { PEEK_WIDTH } from './LessonPeek';

interface LearningPathProps {
  lessons: readonly TemarioEntry[];
  /** Lecciones ya completadas */
  completedLessons: readonly number[];
  /** La lección que sigue (null si el módulo está completo) */
  nextLesson: number | null;
  hrefFor: (lesson: number) => string;
  /** Rótulo tipo cotización, ej. "M1 · Fundamentos del dinero". Solo se muestra en la vista diagonal */
  ticker?: string;
  /** Segundos de espera antes de empezar a dibujar (el saludo entra primero) */
  startDelay?: number;
}

/** Ancho máximo estimado de la etiqueta "Sigue: …" */
const TAG_MAX = 210;
/** Cuánto tarda el bloqueo fijado por un toque en móvil */
const PIN_MS = 3200;

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function peekPosition(p: PathPoint, layout: PathLayout): CSSProperties {
  const left = Math.min(Math.max(p.x - PEEK_WIDTH / 2, 8), layout.width - PEEK_WIDTH - 8);
  const gap = NODE_SIZE / 2 + 12;
  return p.y > layout.height / 2 ? { left, bottom: layout.height - p.y + gap } : { left, top: p.y + gap };
}

function tagPosition(p: PathPoint, layout: PathLayout): CSSProperties {
  const half = NODE_SIZE / 2;
  const diagonal = layout.orientation === 'diagonal';
  const dy = diagonal ? 6 : -12;

  if (layout.width - (p.x + half + 10) >= TAG_MAX) return { left: p.x + half + 10, top: p.y + dy };
  if (!diagonal && p.x - half - 10 >= TAG_MAX) return { right: layout.width - (p.x - half - 10), top: p.y + dy };
  return { right: layout.width - (p.x + half), bottom: layout.height - p.y + half + 8 };
}

/**
 * LearningPath — el camino del módulo como una gráfica de mercado (PLAN §2).
 *
 * Una línea quebrada ascendente une las lecciones. El tramo recorrido va en naranja y se
 * DIBUJA al cargar; el resto es punteado. Los nodos entran detrás del trazo.
 *
 * Los nodos son <Link>/<button> reales dentro de un <ol>: el SVG es decorativo y el <ol>
 * es lo que navega un lector de pantalla. Si el usuario interactúa mientras se dibuja,
 * todo salta al estado final (nada bloquea al usuario).
 */
export default function LearningPath({
  lessons,
  completedLessons,
  nextLesson,
  hrefFor,
  ticker,
  startDelay = 0.4,
}: LearningPathProps) {
  const reduced = usePrefersReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [instant, setInstant] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const pinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (pinTimer.current) clearTimeout(pinTimer.current);
  }, []);

  const count = lessons.length;
  const fallbackHeight = width ? Math.round(Math.min(Math.max(width * 0.4, 380), 480)) : 420;
  const layout = useMemo(
    () => (width && count > 0 ? getPathLayout(count, { width, height: fallbackHeight }) : null),
    [width, count, fallbackHeight]
  );

  const currentIndex = nextLesson ? nextLesson - 1 : count - 1;
  const completed = useMemo(() => new Set(completedLessons), [completedLessons]);

  // Cada nodo entra "detrás del trazo": justo cuando la línea lo alcanza. El trazo se dibuja
  // con EASE_OUT_EXPO (rapidísimo al inicio), así que el instante en que pasa por un nodo NO
  // es proporcional a la distancia: se obtiene invirtiendo la curva. Los nodos bloqueados
  // esperan a que el trazo termine y entran escalonados (máx. MAX_STAGGERED).
  const delays = useMemo(() => {
    if (!layout || reduced) return [];
    const pts = layout.points;
    const ease = cubicBezier(EASE_OUT_EXPO[0], EASE_OUT_EXPO[1], EASE_OUT_EXPO[2], EASE_OUT_EXPO[3]);
    const cumulative = [0];
    for (let i = 1; i < pts.length; i++) {
      cumulative.push(cumulative[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    const doneLength = cumulative[currentIndex] ?? 0;
    return pts.map((_, i) =>
      i <= currentIndex
        ? startDelay + DRAW_PATH_DURATION * timeForProgress(ease, doneLength > 0 ? cumulative[i] / doneLength : 0) + 0.04
        : startDelay + DRAW_PATH_DURATION + 0.1 + staggerDelay(i - currentIndex - 1)
    );
  }, [layout, reduced, currentIndex, startDelay]);

  const activeNumber = pinned ?? hovered;
  const active = activeNumber ? lessons.find((l) => l.number === activeNumber) ?? null : null;
  const nextEntry = nextLesson ? lessons.find((l) => l.number === nextLesson) ?? null : null;

  const stateOf = (n: number): NodeState =>
    completed.has(n) ? 'completed' : n === nextLesson ? 'current' : 'locked';

  const labelOf = (lesson: TemarioEntry, state: NodeState): string => {
    const base = `Lección ${lesson.number}: ${lesson.title}.`;
    if (state === 'completed') return `${base} Completada.`;
    if (state === 'current') return `${base} Es la siguiente.`;
    return `${base} Bloqueada: se abre al terminar la lección ${lesson.number - 1}.`;
  };

  const handleLockedAttempt = (n: number) => {
    setPinned(n);
    if (pinTimer.current) clearTimeout(pinTimer.current);
    pinTimer.current = setTimeout(() => setPinned(null), PIN_MS);
  };

  return (
    <div
      ref={ref}
      onPointerDownCapture={() => setInstant(true)}
      onKeyDownCapture={(e) => {
        setInstant(true);
        if (e.key === 'Escape') {
          setHovered(null);
          setPinned(null);
        }
      }}
      style={{
        position: 'relative',
        width: '100%',
        height: layout?.height ?? fallbackHeight,
        background: 'var(--ink)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
      }}
    >
      {layout && (
        <>
          <PathLine
            layout={layout}
            currentIndex={currentIndex}
            startDelay={startDelay}
            instant={instant}
            reduced={reduced}
          />

          <ol
            aria-label={`Camino del módulo: ${count} lecciones`}
            style={{ margin: 0, padding: 0, listStyle: 'none' }}
          >
            {lessons.map((lesson, i) => {
              const state = stateOf(lesson.number);
              const p = layout.points[i];
              return (
                <LessonNode
                  key={lesson.number}
                  number={lesson.number}
                  state={state}
                  x={p.x}
                  y={p.y}
                  href={hrefFor(lesson.number)}
                  label={labelOf(lesson, state)}
                  delay={delays[i] ?? 0}
                  instant={instant}
                  describedBy={activeNumber === lesson.number ? `peek-${lesson.number}` : undefined}
                  onEnter={setHovered}
                  onLeave={() => setHovered(null)}
                  onLockedAttempt={handleLockedAttempt}
                />
              );
            })}
          </ol>

          {ticker && layout.orientation === 'diagonal' && (
            <Reveal
              delay={startDelay}
              instant={instant}
              style={{
                position: 'absolute',
                left: 'var(--space-6)',
                top: 'var(--space-4)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--space-3)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              <span
                aria-hidden="true"
                className="uppercase-tracking"
                style={{ color: 'color-mix(in srgb, var(--surface-raised) 70%, transparent)' }}
              >
                {ticker}
              </span>
              <span aria-hidden="true" style={{ color: completed.size > 0 ? 'var(--brand-400)' : 'var(--ink-secondary)' }}>
                {completed.size > 0 ? '▲' : '—'} {Math.round((completed.size / count) * 100)} %
              </span>
            </Reveal>
          )}

          {nextEntry && (
            <Reveal
              delay={(delays[currentIndex] ?? 0) + 0.3}
              instant={instant}
              style={{ position: 'absolute', maxWidth: TAG_MAX, ...tagPosition(layout.points[currentIndex], layout) }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: 'var(--space-1) var(--space-3)',
                  background: 'var(--brand-600)',
                  color: 'var(--on-brand)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: 'var(--line-height-tight)',
                }}
              >
                Sigue: {nextEntry.topic}
              </span>
            </Reveal>
          )}

          <AnimatePresence>
            {active && (
              <div
                key={active.number}
                style={{ position: 'absolute', zIndex: 5, ...peekPosition(layout.points[active.number - 1], layout) }}
              >
                <LessonPeek
                  id={`peek-${active.number}`}
                  lesson={active}
                  locked={stateOf(active.number) === 'locked'}
                />
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
