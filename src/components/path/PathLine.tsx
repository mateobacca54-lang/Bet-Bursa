'use client';

import { useId } from 'react';
import { motion, type TargetAndTransition } from 'framer-motion';
import { buildPathD, splitPathAt, type PathLayout } from '@/lib/path-geometry';
import { DURATION, variants } from '@/lib/motion';

interface PathLineProps {
  layout: PathLayout;
  /** Índice del nodo actual: el tramo 0..currentIndex es el recorrido */
  currentIndex: number;
  /** Segundos antes de empezar a dibujar */
  startDelay: number;
  instant: boolean;
  reduced: boolean;
}

/** Blanco de la superficie con transparencia: sale de tokens, no es un valor nuevo */
const onDark = (percent: number) =>
  `color-mix(in srgb, var(--surface-raised) ${percent}%, transparent)`;

const GRID_LINES = 4;

/**
 * PathLine — la gráfica: cuadrícula, área bajo la curva, el tramo recorrido (sólido,
 * se dibuja con pathLength) y el tramo por desbloquear (punteado, aparece después).
 *
 * pathLength usa stroke-dasharray, por eso el tramo punteado no puede dibujarse igual:
 * entra con opacity cuando el trazo naranja termina.
 */
export default function PathLine({ layout, currentIndex, startDelay, instant, reduced }: PathLineProps) {
  const uid = useId().replace(/:/g, '');
  const { points, width, height, orientation } = layout;
  const { done, locked } = splitPathAt(points, currentIndex);
  const baseline = height - 20;

  const hasDone = done.length > 1;
  const hasLocked = locked.length > 1;
  const first = done[0];
  const last = done[done.length - 1];

  const fade = (delay: number) =>
    instant ? { duration: 0 } : reduced ? { duration: 0.1 } : { duration: DURATION.scene, delay };
  const drawEnd = startDelay + variants.drawPath.transition.duration;

  const doneInitial = instant ? false : reduced ? { opacity: 0 } : { pathLength: 0 };
  const doneAnimate: TargetAndTransition = instant
    ? { pathLength: 1, opacity: 1, transition: { duration: 0 } }
    : reduced
      ? { opacity: 1, transition: { duration: 0.1 } }
      : {
          ...variants.drawPath,
          transition: { ...variants.drawPath.transition, delay: startDelay },
        };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', left: 0, top: 0, display: 'block' }}
    >
      <defs>
        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--brand-500)', stopOpacity: 0.34 }} />
          <stop offset="100%" style={{ stopColor: 'var(--brand-500)', stopOpacity: 0 }} />
        </linearGradient>
        {hasDone && (
          <linearGradient
            id={`${uid}-line`}
            gradientUnits="userSpaceOnUse"
            x1={first.x}
            y1={first.y}
            x2={last.x}
            y2={last.y}
          >
            <stop offset="0%" style={{ stopColor: 'var(--brand-600)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--brand-400)' }} />
          </linearGradient>
        )}
      </defs>

      {/* Cuadrícula de gráfica de mercado */}
      {Array.from({ length: GRID_LINES }, (_, i) => {
        const y = (height / (GRID_LINES + 1)) * (i + 1);
        return <line key={i} x1={0} x2={width} y1={y} y2={y} stroke={onDark(6)} strokeWidth={1} />;
      })}
      {orientation === 'diagonal' && (
        <>
          <line x1={0} x2={width} y1={baseline} y2={baseline} stroke={onDark(14)} strokeWidth={1} />
          {points.map((p, i) => (
            <line
              key={i}
              x1={p.x}
              x2={p.x}
              y1={p.y}
              y2={baseline}
              stroke={onDark(10)}
              strokeWidth={1}
              strokeDasharray="2 6"
            />
          ))}
        </>
      )}

      {/* El área bajo la curva solo tiene sentido en la gráfica diagonal */}
      {hasDone && orientation === 'diagonal' && (
        <motion.path
          d={`${buildPathD(done)} L ${last.x} ${height} L ${first.x} ${height} Z`}
          fill={`url(#${uid}-area)`}
          stroke="none"
          initial={instant ? false : { opacity: 0 }}
          animate={{ opacity: 1, transition: fade(drawEnd - 0.3) }}
        />
      )}

      {hasLocked && (
        <motion.path
          d={buildPathD(locked)}
          fill="none"
          stroke={onDark(32)}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="1 9"
          initial={instant ? false : { opacity: 0 }}
          animate={{ opacity: 1, transition: fade(drawEnd) }}
        />
      )}

      {hasDone && (
        <motion.path
          d={buildPathD(done)}
          fill="none"
          stroke={`url(#${uid}-line)`}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'drop-shadow(0 0 8px color-mix(in srgb, var(--brand-500) 55%, transparent))',
          }}
          initial={doneInitial}
          animate={doneAnimate}
        />
      )}
    </svg>
  );
}
