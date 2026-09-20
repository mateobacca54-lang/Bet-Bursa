'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import type { AnimatedComparatorConfig, BursaWidgetProps, ComparatorSeries } from '@/lib/types';
import { formatCOP } from '@/lib/format';
import { DRAW_PATH_DURATION, DURATION, EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { niceTicks, percentOff, snapToStep, valueToY, yToValue } from '@/lib/widget-math';

// Geometría del gráfico (unidades del viewBox)
const W = 600;
const H = 340;
const PLOT = { left: 82, right: 574, top: 30, bottom: 286 };

/** Etiqueta corta de eje: 150000 → "$150 mil" (cabe en móvil y se lee mejor que "$ 150.000"). */
const tickLabel = (v: number): string => (Math.abs(v) >= 1000 ? `$${v / 1000} mil` : `$${v}`);
const STEP = 5000; // paso del teclado y del ajuste al arrastrar

/**
 * AnimatedComparator — Arquetipo D
 *
 * Con `predictionMode` es un ejercicio de "predecir antes de revelar":
 *   1. se ve solo una serie (p. ej. el interés simple), completa;
 *   2. la persona arrastra un punto hasta donde cree que estará la serie oculta en `atX`;
 *   3. al fijar la predicción, la serie real se dibuja con `pathLength`, pasando por encima
 *      (o por debajo) de lo que creyó;
 *   4. el mensaje dice cuánto se acercó. Nunca "ganó" o "perdió".
 *
 * Se puede mover con puntero/dedo (arrastrando el punto o tocando el gráfico) y con teclado
 * (el punto es un slider: ↑ → suben, ↓ ← bajan, PgUp/PgDn saltan, Inicio/Fin).
 */
export default function AnimatedComparator({
  config,
  onStateChange,
  onAttempt,
  disabled = false,
}: BursaWidgetProps<AnimatedComparatorConfig, number>) {
  const reduced = usePrefersReducedMotion();
  const prediction = config.predictionMode;
  const hidden = useMemo(
    () => (prediction ? config.series.find((s) => s.id === prediction.seriesId) : undefined),
    [config.series, prediction],
  );
  const visible = useMemo(() => config.series.filter((s) => s.id !== hidden?.id), [config.series, hidden]);

  // ─── Escalas ───
  const { xMin, xMax, yMin, yMax, ticks } = useMemo(() => {
    const xs = config.series.flatMap((s) => s.dataPoints.map((p) => p.x));
    const ys = config.series.flatMap((s) => s.dataPoints.map((p) => p.y));
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const t = niceTicks(lo * 0.85, hi * 1.1, 5);
    // El eje llega hasta la marca de arriba y a la de abajo para que el punto tenga rango completo.
    return { xMin: Math.min(...xs), xMax: Math.max(...xs), yMin: t[0], yMax: t[t.length - 1], ticks: t };
  }, [config.series]);

  const xOf = useCallback((x: number) => PLOT.left + ((x - xMin) / (xMax - xMin)) * (PLOT.right - PLOT.left), [xMin, xMax]);
  const yOf = useCallback((v: number) => valueToY(v, PLOT.top, PLOT.bottom, yMin, yMax), [yMin, yMax]);
  const pathOf = useCallback(
    (s: ComparatorSeries) => s.dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.x).toFixed(1)} ${yOf(p.y).toFixed(1)}`).join(' '),
    [xOf, yOf],
  );

  // ─── Estado ───
  const startValue = snapToStep(yMin + (yMax - yMin) * 0.12, yMin, yMax, STEP);
  const [guess, setGuess] = useState(startValue);
  const [touched, setTouched] = useState(false);
  const [locked, setLocked] = useState(!prediction); // sin predicción no hay nada que fijar
  const [done, setDone] = useState(!prediction);
  const [focused, setFocused] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const titleId = useId();

  const actual = useMemo(
    () => (hidden && prediction ? hidden.dataPoints.find((p) => p.x === prediction.atX)?.y : undefined),
    [hidden, prediction],
  );

  const setFromClientY = useCallback(
    (clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const yView = ((clientY - rect.top) / rect.height) * H;
      setGuess(snapToStep(yToValue(yView, PLOT.top, PLOT.bottom, yMin, yMax), yMin, yMax, STEP));
      setTouched(true);
    },
    [yMin, yMax],
  );

  const onPointerDown = (e: ReactPointerEvent<SVGRectElement | SVGGElement>) => {
    if (locked || disabled) return;
    dragging.current = true;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setFromClientY(e.clientY);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (dragging.current) setFromClientY(e.clientY);
  };
  const stopDrag = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (locked || disabled) return;
    const big = STEP * 5;
    const delta =
      e.key === 'ArrowUp' || e.key === 'ArrowRight' ? STEP :
      e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -STEP :
      e.key === 'PageUp' ? big :
      e.key === 'PageDown' ? -big : 0;
    if (e.key === 'Home') setGuess(yMin);
    else if (e.key === 'End') setGuess(yMax);
    else if (delta !== 0) setGuess((g) => snapToStep(g + delta, yMin, yMax, STEP));
    else return;
    e.preventDefault();
    setTouched(true);
  };

  const commit = () => {
    if (!prediction || actual === undefined || locked) return;
    setLocked(true);
    onStateChange?.('active');
    onAttempt?.(guess, percentOff(guess, actual) <= prediction.tolerancePercent);
    if (reduced) setDone(true);
  };

  // Termina cuando la línea real acaba de dibujarse (o de inmediato bajo reduced-motion).
  useEffect(() => {
    if (done) onStateChange?.('correct');
  }, [done, onStateChange]);

  const off = actual !== undefined ? percentOff(guess, actual) : 0;
  const close = prediction ? off <= prediction.tolerancePercent : false;
  const drawTransition = reduced ? { duration: 0 } : { duration: DRAW_PATH_DURATION, ease: EASE_OUT_EXPO };
  const revealed = locked && !!prediction;
  const atXpx = prediction ? xOf(prediction.atX) : 0;

  return (
    <div
      style={{
        background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        padding: 'var(--space-6)',
        maxWidth: 640,
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <h2 id={titleId} style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--font-size-xl)', color: 'var(--ink)', lineHeight: 'var(--line-height-tight)' }}>
        {config.title}
      </h2>
      <p style={{ margin: '0 0 var(--space-4) 0', color: 'var(--ink-secondary)', lineHeight: 'var(--line-height-normal)' }}>
        {config.description}
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="group"
        aria-labelledby={titleId}
        style={{ display: 'block', height: 'auto', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        {/* Cuadrícula y eje Y */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PLOT.left} x2={PLOT.right} y1={yOf(t)} y2={yOf(t)} stroke="var(--border)" strokeWidth={1} />
            <text x={PLOT.left - 8} y={yOf(t) + 5} textAnchor="end" fontSize={14} fill="var(--ink-secondary)">
              {tickLabel(t)}
            </text>
          </g>
        ))}

        {/* Eje X */}
        {Array.from({ length: Math.round(xMax - xMin) + 1 }, (_, i) => xMin + i).map((x) => (
          <text key={x} x={xOf(x)} y={PLOT.bottom + 22} textAnchor="middle" fontSize={14} fill="var(--ink-secondary)">
            {x}
          </text>
        ))}
        <text x={(PLOT.left + PLOT.right) / 2} y={H - 6} textAnchor="middle" fontSize={14} fill="var(--ink-secondary)">
          {config.xAxisLabel}
        </text>

        {/* Zona táctil: tocar el gráfico coloca el punto ahí */}
        {prediction && !locked && (
          <rect
            x={PLOT.left}
            y={PLOT.top}
            width={PLOT.right - PLOT.left}
            height={PLOT.bottom - PLOT.top}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onPointerDown={onPointerDown}
          />
        )}

        {/* Series visibles: completas desde el principio */}
        {visible.map((s) => (
          <path key={s.id} d={pathOf(s)} fill="none" stroke={s.colorToken} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
        ))}

        {/* Serie oculta: se dibuja al fijar la predicción */}
        {revealed && hidden && (
          <motion.path
            d={pathOf(hidden)}
            fill="none"
            stroke={hidden.colorToken}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={drawTransition}
            onAnimationComplete={() => setDone(true)}
          />
        )}

        {/* Guía vertical en el punto a predecir */}
        {prediction && (
          <line x1={atXpx} x2={atXpx} y1={PLOT.top} y2={PLOT.bottom} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="4 4" pointerEvents="none" />
        )}

        {/* Valor real (aparece cuando termina el trazo) */}
        {done && revealed && actual !== undefined && (
          <motion.g
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : DURATION.element }}
          >
            <circle cx={atXpx} cy={yOf(actual)} r={7} fill={hidden?.colorToken} stroke="var(--surface-raised)" strokeWidth={2} />
            <text x={atXpx - 12} y={yOf(actual) - 12} textAnchor="end" fontSize={15} fontWeight={700} fill="var(--ink)" stroke="var(--surface-raised)" strokeWidth={4} paintOrder="stroke">
              Real: {formatCOP(actual)}
            </text>
          </motion.g>
        )}

        {/* Tu predicción: el punto que se arrastra */}
        {prediction && (
          <g
            role="slider"
            tabIndex={locked || disabled ? -1 : 0}
            aria-label={`Tu predicción a los ${prediction.atX} ${config.xAxisLabel.toLowerCase()}`}
            aria-valuemin={yMin}
            aria-valuemax={yMax}
            aria-valuenow={guess}
            aria-valuetext={formatCOP(guess)}
            aria-readonly={locked}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            transform={`translate(${atXpx} ${yOf(guess)})`}
            style={{ cursor: locked ? 'default' : 'grab', outline: 'none' }}
            className="bursa-comparator-handle"
          >
            <circle r={26} fill="transparent" /> {/* zona de toque ≥ 44 px */}
            {focused && <circle r={19} fill="none" stroke="var(--brand-700)" strokeWidth={2} strokeDasharray="3 3" />}
            <circle r={11} fill={locked ? 'var(--surface-raised)' : 'var(--brand-600)'} stroke="var(--brand-600)" strokeWidth={3} />
            {/* Etiqueta hacia la izquierda: el punto vive junto al borde derecho del gráfico */}
            <text
              x={14}
              y={-20}
              textAnchor="end"
              fontSize={15}
              fontWeight={700}
              fill="var(--brand-700)"
              stroke="var(--surface-raised)"
              strokeWidth={4}
              paintOrder="stroke"
            >
              {locked ? 'Tu predicción: ' : ''}{formatCOP(guess)}
            </text>
          </g>
        )}
      </svg>

      {/* Leyenda */}
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', listStyle: 'none', padding: 0, margin: 'var(--space-2) 0 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--ink-secondary)' }}>
        {[...visible, ...(revealed && hidden ? [hidden] : [])].map((s) => (
          <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span aria-hidden="true" style={{ width: 16, height: 4, borderRadius: 2, background: s.colorToken }} />
            {s.label}
          </li>
        ))}
      </ul>

      {/* Acción */}
      {prediction && !locked && (
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={() => touched && commit()}
            disabled={disabled}
            aria-disabled={!touched}
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--on-brand)',
              background: 'var(--brand-600)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: 'var(--space-3) var(--space-8)',
              minHeight: 'var(--touch-min)',
              boxShadow: 'var(--shadow-sm)',
              cursor: touched ? 'pointer' : 'not-allowed',
              opacity: touched ? 1 : 0.5,
            }}
          >
            Fijar mi predicción
          </button>
          {!touched && (
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--ink-secondary)' }}>
              Arrastra el punto (o usa las flechas) hasta donde creas que llegará.
            </span>
          )}
        </div>
      )}

      {/* Resultado: cuánto se acercó, sin ganar ni perder */}
      <div role="status" aria-live="polite" style={{ marginTop: 'var(--space-4)' }}>
        {done && revealed && actual !== undefined && prediction && (
          <motion.div
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : DURATION.element }}
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${close ? 'var(--feedback-correct)' : 'var(--border)'}`,
              background: 'var(--surface)',
            }}
          >
            <p style={{ margin: '0 0 var(--space-2) 0', fontWeight: 'var(--font-weight-bold)', color: 'var(--ink)' }}>
              Tu predicción: {formatCOP(guess)} · Real: {formatCOP(actual)}
              <span style={{ fontWeight: 'var(--font-weight-normal)', color: 'var(--ink-secondary)' }}>
                {' '}({off < 1 ? 'casi exacto' : `${Math.round(off)} % de diferencia`})
              </span>
            </p>
            <p style={{ margin: 0, color: 'var(--ink)', lineHeight: 'var(--line-height-normal)' }}>
              {close ? prediction.feedbackClose : prediction.feedbackFar}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
