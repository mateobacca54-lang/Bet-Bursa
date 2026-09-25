'use client';

import { Pila } from '@/components/illus';
import { MoneditaGuide } from '@/components/widgets/shared';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import type { AnimatedComparatorConfig, BursaWidgetProps, ComparatorSeries } from '@/lib/types';
import { formatCOP } from '@/lib/format';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { niceTicks, percentOff, snapToStep, valueToY, yToValue } from '@/lib/widget-math';
import './animated-comparator.css';

// Geometría del gráfico (unidades del viewBox)
const W = 440;
const H = 320;
const PLOT = { left: 68, right: 422, top: 28, bottom: 258 };

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
 *   4. el mensaje dice cuánto se acercó. Nunca "ganó." o "perdió".
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
  const [locked, setLocked] = useState(!prediction);
  const [done, setDone] = useState(!prediction);
  const [focused, setFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const titleId = useId();
  // Cada SVG necesita sus propios IDs para que filtros y recortes no se mezclen.
  const chartId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const glowId = `comparator-glow-${chartId}`;
  const backgroundId = `comparator-background-${chartId}`;
  const clipId = `comparator-clip-${chartId}`;

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
    setIsDragging(true);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setFromClientY(e.clientY);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (dragging.current) setFromClientY(e.clientY);
  };
  const stopDrag = () => {
    dragging.current = false;
    setIsDragging(false);
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

  useEffect(() => {
    if (done) onStateChange?.('correct');
  }, [done, onStateChange]);

  const simpleSeries = visible[0];
  const startAmount = simpleSeries?.dataPoints[0]?.y;
  const simpleAtX = prediction ? simpleSeries?.dataPoints.find((p) => p.x === prediction.atX)?.y : undefined;
  const coinUnit = startAmount ? startAmount / 5 : undefined;

  const off = actual !== undefined ? percentOff(guess, actual) : 0;
  const close = prediction ? off <= prediction.tolerancePercent : false;
  // Aumentamos la duración para un dibujo más dramtico de la línea exponencial
  const drawTransition = reduced ? { duration: 0 } : { duration: 2.2, ease: "easeOut" as const };
  const revealed = locked && !!prediction;
  const atXpx = prediction ? xOf(prediction.atX) : 0;

  return (
    <motion.div layout
      className="bursa-comparator"
      style={{
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: 'var(--space-6)',
        maxWidth: 640,
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-light)'
      }}
    >
      <h2 id={titleId} className="bursa-comparator__title" style={{ margin: '0 0 var(--space-2) 0', color: 'var(--ink)', lineHeight: 'var(--line-height-tight)' }}>
        {config.title}
      </h2>
      <p className="bursa-comparator__description" style={{ margin: '0 0 var(--space-6) 0', color: 'var(--ink-secondary)', lineHeight: 'var(--line-height-normal)' }}>
        {config.description}
      </p>

      <MoneditaGuide
        compact
        state={done ? 'correct' : touched ? 'active' : 'idle'}
        message={revealed ? 'Mira cómo la curva compuesta se despega: ganó. Interés sobre lo que ya ganó.' : 'Arrastra el punto para predecir. No necesitas acertar para descubrir la diferencia.'}
      />

      <div style={{ position: 'relative', marginTop: 'var(--space-6)' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="group"
          aria-labelledby={titleId}
          className="bursa-comparator__chart"
          style={{ display: 'block', height: 'auto', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', overflow: 'visible' }}
          onPointerMove={onPointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        >
          {/* Filtros visuales "Premium" (Glow) */}
          <defs>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id={backgroundId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sand-100)" />
              <stop offset="100%" stopColor="var(--sand-50)" />
            </linearGradient>
            <clipPath id={clipId}><rect x={PLOT.left} y={PLOT.top} width={PLOT.right - PLOT.left} height={PLOT.bottom - PLOT.top} rx={16} /></clipPath>
          </defs>

          {/* Fondo del gráfico mejorado */}
          <rect x={PLOT.left} y={PLOT.top} width={PLOT.right - PLOT.left} height={PLOT.bottom - PLOT.top} rx={16} fill={`url(#${backgroundId})`} stroke="var(--border)" strokeWidth={1} />
          
          {/* Cuadrícula eleganó.e (dotted) */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PLOT.left} x2={PLOT.right} y1={yOf(t)} y2={yOf(t)} stroke="var(--border-light)" strokeWidth={1} strokeDasharray="4 4" />
              <text className="bursa-comparator__axis-label" x={PLOT.left - 10} y={yOf(t) + 5} textAnchor="end" fontSize={15} fontWeight="500" fill="var(--ink-secondary)">
                {tickLabel(t)}
              </text>
            </g>
          ))}

          {/* Eje X */}
          {Array.from({ length: Math.round(xMax - xMin) + 1 }, (_, i) => xMin + i).map((x) => (
            <text className="bursa-comparator__axis-label" key={x} x={xOf(x)} y={PLOT.bottom + 25} textAnchor="middle" fontSize={15} fontWeight="500" fill="var(--ink-secondary)">
              {x}
            </text>
          ))}
          <text className="bursa-comparator__axis-label" x={(PLOT.left + PLOT.right) / 2} y={H - 2} textAnchor="middle" fontSize={14} fontWeight="600" fill="var(--ink-tertiary)" style={{ textTransform: "uppercase" }} letterSpacing={1}>
            {config.xAxisLabel}
          </text>

          {/* Zona táctil */}
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

                    <g clipPath={`url(#${clipId})`}>
          {/* Series visibles (Interés Simple) */}
          {visible.map((s) => (
            <path key={s.id} d={pathOf(s)} fill="none" stroke={s.colorToken} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" opacity={0.6} />
          ))}

          {/* Serie oculta animada con GLOW (Interés Compuesto) */}
          {revealed && hidden && (
            <motion.path
              d={pathOf(hidden)}
              fill="none"
              stroke={hidden.colorToken}
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
              filter={`url(#${glowId})`}
              initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={drawTransition}
              onAnimationComplete={() => setDone(true)}
            />
          )}

          </g>

          {/* Guía vertical gruesa interactiva */}
          {prediction && (
            <line 
              x1={atXpx} x2={atXpx} 
              y1={PLOT.top} y2={PLOT.bottom} 
              stroke={isDragging ? "var(--brand-300)" : "var(--border)"} 
              strokeWidth={isDragging ? 3 : 2} 
              strokeDasharray="6 6" 
              pointerEvents="none" 
              style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
            />
          )}

          {/* Tu predicción interactiva: Animada con spring */}
          {prediction && (
            <motion.g
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
              animate={{ 
                x: atXpx, 
                y: yOf(guess),
                scale: isDragging ? 1.15 : focused ? 1.05 : 1
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                mass: 0.8
              }}
              style={{ cursor: locked ? 'default' : 'grab' }}
              className="bursa-comparator-handle"
            >
              <circle r={32} fill="transparent" /> {/* Hitbox extendida */}
              
              {/* Anillo exterior animado */}
              <motion.circle 
                r={16} 
                fill={locked ? 'var(--surface-raised)' : 'var(--brand-50)'} 
                stroke={focused ? 'var(--ink)' : locked ? 'var(--border)' : 'var(--brand-400)'} 
                strokeWidth={isDragging || focused ? 4 : 2} 
              />
              
              {/* Punto central */}
              <circle r={8} fill={locked ? 'var(--ink-secondary)' : 'var(--brand-600)'} />
              
              {/* Tooltip dinámico conectado al handle */}
              <motion.g animate={{ opacity: locked ? 0.6 : 1, y: isDragging ? -30 : -24 }}>
                <rect x={-45} y={-14} width={90} height={28} rx={14} fill={locked ? "var(--surface)" : "var(--brand-600)"} stroke={locked ? "var(--border)" : "none"} />
                <text
                  x={0}
                  y={5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={700}
                  fill={locked ? "var(--ink-secondary)" : "var(--on-brand)"}
                >
                  {formatCOP(guess)}
                </text>
              </motion.g>
            </motion.g>
          )}

          {/* Valor real final: Hace "pop" con spring */}
          {done && revealed && actual !== undefined && (
            <motion.g
              initial={{ scale: reduced ? 1 : 0.5, opacity: reduced ? 1 : 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Conexión visual si hubo fallo grande */}
              {!close && (
                <line 
                  x1={atXpx} y1={yOf(guess)} 
                  x2={atXpx} y2={yOf(actual)} 
                  stroke="var(--error-300)" strokeWidth={2} strokeDasharray="4 4" 
                />
              )}
              
              <circle cx={atXpx} cy={yOf(actual)} r={10} fill={hidden?.colorToken} stroke="var(--surface-raised)" strokeWidth={3} filter={`url(#${glowId})`} />
              <rect x={atXpx - 130} y={yOf(actual) - 16} width={115} height={32} rx={16} fill={hidden?.colorToken} />
              <text x={atXpx - 72} y={yOf(actual) + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--on-brand)">
                Real: {formatCOP(actual)}
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', justifyContent: 'center', listStyle: 'none', padding: 0, margin: 'var(--space-4) 0 0 0', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--ink)' }}>
        {[...visible, ...(revealed && hidden ? [hidden] : [])].map((s) => (
          <motion.li 
            key={s.id} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: s.colorToken, boxShadow: '0 0 8px ' + s.colorToken }} />
            {s.label}
          </motion.li>
        ))}
      </ul>

      {prediction && !locked && (
        <motion.div 
          initial={false}
          animate={{ y: touched ? 0 : 10, opacity: 1 }}
          style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <motion.button
            whileHover={touched && !disabled ? { scale: 1.05 } : {}}
            whileTap={touched && !disabled ? { scale: 0.95 } : {}}
            type="button"
            onClick={() => touched && commit()}
            disabled={disabled || !touched}
            aria-disabled={!touched}
            className="bursa-comparator__action"
            style={{ 
              opacity: touched ? 1 : 0.5,
              background: touched ? 'var(--brand-600)' : 'var(--surface-disabled)',
              color: touched ? 'var(--on-brand)' : 'var(--ink-tertiary)',
              border: 'none',
              padding: 'var(--space-3) var(--space-8)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              cursor: touched ? 'pointer' : 'default',
              boxShadow: touched ? '0 4px 14px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Fijar mi predicción
          </motion.button>
        </motion.div>
      )}

      {/* Resultado animado con Stagger */}
      <div role="status" aria-live="polite">
        {done && revealed && actual !== undefined && prediction && (
          <motion.div
            initial={{ opacity: reduced ? 1 : 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.4, delay: 0.2 }}
            style={{
              marginTop: 'var(--space-6)',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${close ? 'var(--brand-400)' : 'var(--border-light)'}`,
              background: close ? 'var(--brand-50)' : 'var(--sand-50)',
            }}
          >
            <p style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--ink)' }}>
              {close ? prediction.feedbackClose : prediction.feedbackFar}
            </p>
            <p style={{ margin: 0, color: 'var(--ink-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Pensaste {formatCOP(guess)} y la realidad fue {formatCOP(actual)} 
              <strong style={{ color: 'var(--ink)' }}> ({off < 1 ? '¡Casi exacto!' : `${Math.round(off)}% de diferencia`})</strong>
            </p>
            
            {coinUnit && simpleAtX !== undefined && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <div aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'var(--space-8)' }}>
                  {[
                    { label: simpleSeries.label, value: simpleAtX },
                    { label: hidden?.label ?? '', value: actual },
                  ].map((p, i) => (
                    <motion.div 
                      key={p.label} 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (i * 0.2), type: 'spring' }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}
                    >
                      <Pila count={p.value / coinUnit} scale={1.3} />
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--ink)' }}>
                        {p.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  style={{ margin: 'var(--space-4) 0 0', textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  Cada moneda vale {formatCOP(coinUnit)}.
                </motion.p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}





