'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { AnimatePresence, cubicBezier } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { TemarioEntry } from '@/content/modulo-1/temario';
import {
  createSpaceLedger,
  getPathLayout,
  NODE_SIZE,
  pickTagPlacement,
  rectsOverlap,
  type PathLayout,
  type PathPoint,
} from '@/lib/path-geometry';
import { useEvitarAyuda } from '@/lib/useEvitarAyuda';
import { DRAW_PATH_DURATION, EASE_OUT_EXPO, staggerDelay } from '@/lib/motion';
import { timeForProgress } from '@/lib/motion-math';
import { Reveal } from '@/components/motion';
import { Estampa } from '@/components/illus';
import { escenaDeLeccion } from '@/content/modulo-1/escenas';
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

/** Tamaño de la ilustración del tema que sigue, en la esquina superior izquierda (lienzo 4:3) */
const POSTER = { left: 24, top: 44, width: 176, height: 132 };
/** Monedita sobresale de la esquina inferior derecha de la ilustración */
const GUIDE = 58;

/** Ancho máximo estimado de la etiqueta "Sigue: …" */
const TAG_MAX = 210;
/** Cuánto tarda el bloqueo fijado por un toque en móvil */
const PIN_MS = 3200;

/** Esquina superior izquierda de un adorno, en píxeles del lienzo del camino */
interface TagSpot {
  left: number;
  top: number;
}

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

/**
 * Tamaño estimado de la etiqueta "Sigue: …" según su texto. Sobreestimar un poco es seguro
 * (deja más aire); subestimar la haría pisar la línea.
 */
function estimateTag(text: string): { width: number; height: number } {
  const perLine = TAG_MAX - 24;
  const lines = Math.max(1, Math.ceil((text.length * 6.6) / perLine));
  return { width: Math.min(TAG_MAX, Math.round(text.length * 6.6 + 24)), height: lines * 15 + 12 };
}

/**
 * Posición de reserva para la etiqueta cuando no hay ningún hueco medido (caminos estrechos,
 * sobre todo en el celular). Siempre devuelve left/top DENTRO del lienzo: antes podía quedar
 * por encima del borde superior y el contenedor la recortaba a media palabra.
 */
function tagPosition(p: PathPoint, layout: PathLayout, size: { width: number; height: number }): TagSpot {
  const half = NODE_SIZE / 2;
  const gap = 10;
  const dy = layout.orientation === 'diagonal' ? 6 : -12;
  const clampX = (x: number) => Math.min(Math.max(x, 8), Math.max(8, layout.width - size.width - 8));
  const clampY = (y: number) => Math.min(Math.max(y, 8), Math.max(8, layout.height - size.height - 8));

  if (layout.width - (p.x + half + gap) >= size.width) return { left: p.x + half + gap, top: clampY(p.y + dy) };
  if (p.x - half - gap >= size.width) return { left: p.x - half - gap - size.width, top: clampY(p.y + dy) };

  // Ni a un lado ni al otro: encima del nodo, y si arriba no cabe, debajo.
  const arriba = p.y - half - 8 - size.height;
  return { left: clampX(p.x - half), top: arriba >= 8 ? arriba : clampY(p.y + half + 8) };
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
  // Dónde cae el botón de ayuda, medido (no supuesto: ver useEvitarAyuda.ts).
  const ayudaLocal = useEvitarAyuda(ref);
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

  const nextScene = nextLesson ? escenaDeLeccion(nextLesson) : null;
  const nextEntryForTag = nextLesson ? lessons.find((l) => l.number === nextLesson) ?? null : null;

  // ─── UNA SOLA PASADA DE COLOCACIÓN, POR PRIORIDAD ───
  //
  // Antes cada adorno decidía solo si cabía, mirando únicamente los nodos: la etiqueta y el
  // cartel elegían el mismo hueco y se montaban (llegó a taparse el 60 %). Ahora se colocan en
  // orden y cada uno reserva su sitio, así que el siguiente ya no lo puede pisar.
  //
  //   0 la esquina del botón de ayuda  →  1 nodos y línea (nunca ceden)  →
  //   2 etiqueta "Sigue:"  →  3 cartel + Monedita
  //
  // La etiqueta va antes que el cartel porque ORIENTA: dice qué viene. El cartel es decorativo.
  // Quien no encuentra sitio, no se muestra.
  const placement = useMemo(() => {
    if (!layout) return { tag: null as CSSProperties | null, poster: false };
    const view = { width: layout.width, height: layout.height };
    const ledger = createSpaceLedger(layout.points, view);

    // 0 · el botón de ayuda es global y fijo (misma esquina en toda la app): este
    // componente no lo ve por sí solo, pero `ayudaLocal` ya lo midió (posición real,
    // no una esquina supuesta: el camino suele ser más alto que el hueco visible bajo
    // él, así que Ayuda puede caer a mitad de su alto). Medido con
    // scripts/medir-solapes.mjs: sin esto, "Sigue:" llegó a taparse un 29 %.
    if (ayudaLocal) ledger.occupy(ayudaLocal);

    // 2 · la etiqueta
    let tag: CSSProperties | null = null;
    if (nextEntryForTag) {
      const text = `Sigue: ${nextEntryForTag.topic}`;
      const size = estimateTag(text);
      const spot =
        layout.orientation === 'diagonal'
          ? pickTagPlacement(currentIndex, layout.points, view, { ...size, reserved: ledger.taken })
          : null;
      // Sin hueco medido (anchos estrechos, o el camino vertical: pickTagPlacement no
      // se usa ahí): posición de reserva. tagPosition no conoce a Ayuda (es geometría
      // pura, relativa al nodo), así que si el resultado cae encima de ella, se sube
      // por encima.
      let spot2 = spot ?? tagPosition(layout.points[currentIndex], layout, size);
      if (!spot && ayudaLocal && rectsOverlap({ ...spot2, ...size }, ayudaLocal, 4)) {
        const arriba = ayudaLocal.top - size.height - 8;
        if (arriba >= 8) spot2 = { left: spot2.left, top: arriba };
      }
      ledger.occupy({ ...spot2, ...size });
      tag = { left: spot2.left, top: spot2.top };
    }

    // 3 · el cartel del tema que sigue, con Monedita asomando por su esquina inferior derecha.
    // El rectángulo incluye lo que ella sobresale: si no, reservaría de menos.
    const poster =
      layout.orientation === 'diagonal' &&
      !!nextScene &&
      ledger.claim(
        {
          left: POSTER.left,
          top: POSTER.top,
          width: POSTER.width + GUIDE / 3,
          height: POSTER.height + GUIDE / 3,
        },
        { clearance: 12 }
      );

    return { tag, poster };
  }, [layout, nextScene, nextEntryForTag, currentIndex, ayudaLocal]);

  const showPoster = placement.poster;

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

          {showPoster && nextScene && (
            <Reveal
              delay={startDelay + 0.2}
              instant={instant}
              style={{ position: 'absolute', left: POSTER.left, top: POSTER.top, width: POSTER.width, pointerEvents: 'none' }}
            >
              <div aria-hidden="true" style={{ position: 'relative' }}>
                <Estampa scene={nextScene} style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }} />
                <Image
                  src="/monedita/monedita.webp"
                  alt=""
                  width={GUIDE}
                  height={Math.round((GUIDE * 640) / 600)}
                  style={{ position: 'absolute', right: -GUIDE / 3, bottom: -GUIDE / 3, height: 'auto' }}
                />
              </div>
            </Reveal>
          )}

          {nextEntry && placement.tag && (
            <Reveal
              delay={(delays[currentIndex] ?? 0) + 0.3}
              instant={instant}
              style={{ position: 'absolute', maxWidth: TAG_MAX, ...placement.tag }}
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
