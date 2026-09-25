'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { formatCOP } from '@/lib/format';
import { DURATION, EASE_OUT_QUART, staggerDelay } from '@/lib/motion';
import type { DataPoint } from '@/lib/types';
import './LiveVisualization.css';

interface LiveVisualizationProps {
  /** Serie de datos [{x: año, y: precio}] */
  dataPoints: DataPoint[];
  /** Índice actual del slider (cuántos puntos iluminar) */
  currentIndex: number;
  /** Precio base (para la línea de referencia) */
  basePrice: number;
  /** Precio objetivo */
  targetPrice: number;
  /** Año actual seleccionado */
  currentYear: number;
  /** Precio actual calculado */
  currentPrice: number;
}

const SVG_WIDTH = 560;
const SVG_HEIGHT = 280;
const PADDING = { top: 40, right: 24, bottom: 40, left: 80 };
const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

/**
 * LiveVisualization — SVG reactivo que muestra el precio del almuerzo
 * subiendo con la inflación.
 *
 * - Barra de precio que crece con el año.
 * - Línea de referencia punteada para el precio base.
 * - Línea de objetivo punteada para el precio target.
 * - Valor numérico grande animado con motion.
 * - Todo en SVG a mano, sin librería de charting.
 */
export default function LiveVisualization({
  dataPoints,
  currentIndex,
  basePrice,
  targetPrice,
  currentYear,
  currentPrice,
}: LiveVisualizationProps) {
  const shouldReduceMotion = usePrefersReducedMotion();

  // Escalar datos al viewport SVG
  const { scaleY, bars } = useMemo(() => {
    const maxPrice = Math.max(
      ...dataPoints.map((d) => d.y),
      targetPrice * 1.1
    );
    const sX = CHART_WIDTH / Math.max(dataPoints.length - 1, 1);
    const sY = CHART_HEIGHT / maxPrice;

    const barWidth = Math.min(sX * 0.65, 36);

    const b = dataPoints.map((point, i) => ({
      x: PADDING.left + i * sX - barWidth / 2,
      y: PADDING.top + CHART_HEIGHT - point.y * sY,
      width: barWidth,
      height: point.y * sY,
      year: point.x,
      price: point.y,
    }));

    return { scaleY: sY, bars: b };
  }, [dataPoints, targetPrice]);

  // Línea de referencia del precio base
  const baseLineY = PADDING.top + CHART_HEIGHT - basePrice * scaleY;
  // Línea del precio objetivo
  const targetLineY = PADDING.top + CHART_HEIGHT - targetPrice * scaleY;

  const exceeds = currentPrice >= targetPrice;

  return (
    <div
      className="bursa-price-visual"
      style={{
        width: '100%',
        maxWidth: SVG_WIDTH,
        margin: '0 auto',
      }}
    >
      {/* Precio grande animado */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 'var(--space-4)',
        }}
      >
        <motion.div
          key={currentPrice}
          initial={shouldReduceMotion ? false : { y: 8, opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : DURATION.micro, ease: EASE_OUT_QUART }}
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: exceeds ? 'var(--brand-700)' : 'var(--ink)',
            lineHeight: 'var(--line-height-tight)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatCOP(currentPrice)}
        </motion.div>
        <div
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--ink-secondary)',
            marginTop: 'var(--space-1)',
          }}
        >
          Precio del almuerzo en {currentYear}
        </div>
      </div>

      {/* Gráfico SVG */}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        width="100%"
        role="img"
        aria-label={`Gráfico de precios del almuerzo: ${formatCOP(currentPrice)} en ${currentYear}`}
        style={{ display: 'block', height: 'auto' }}
      >
        {/* Eje Y — líneas de referencia */}
        {/* Línea de precio base */}
        <line
          x1={PADDING.left}
          y1={baseLineY}
          x2={SVG_WIDTH - PADDING.right}
          y2={baseLineY}
          stroke="var(--ink-secondary)"
          strokeWidth={1}
          strokeDasharray="6 4"
          opacity={0.5}
        />
        <text
          x={PADDING.left - 8}
          y={baseLineY + 4}
          textAnchor="end"
          fill="var(--ink-secondary)"
          fontSize={11}
          fontFamily="var(--font-family)"
        >
          {formatCOP(basePrice)}
        </text>

        {/* Línea del precio objetivo */}
        <line
          x1={PADDING.left}
          y1={targetLineY}
          x2={SVG_WIDTH - PADDING.right}
          y2={targetLineY}
          stroke="var(--brand-600)"
          strokeWidth={1.5}
          strokeDasharray="8 4"
          opacity={0.6}
        />
        <text
          x={SVG_WIDTH - PADDING.right}
          y={Math.max(16, targetLineY - 8)}
          textAnchor="end"
          fill="var(--brand-700)"
          fontSize={11}
          fontFamily="var(--font-family)"
          fontWeight={600}
        >
          Referencia: {formatCOP(targetPrice)}
        </text>

        {/* Eje X baseline */}
        <line
          x1={PADDING.left}
          y1={PADDING.top + CHART_HEIGHT}
          x2={SVG_WIDTH - PADDING.right}
          y2={PADDING.top + CHART_HEIGHT}
          stroke="var(--border)"
          strokeWidth={1}
        />

        {/* Barras */}
        {bars.map((bar, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <g key={bar.year}>
              {/* Barra */}
              <motion.rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={4}
                fill={
                  isActive
                    ? isCurrent && exceeds
                      ? 'var(--brand-700)'
                      : isCurrent
                      ? 'var(--brand-600)'
                      : 'var(--brand-300)'
                    : 'var(--border)'
                }
                initial={shouldReduceMotion ? false : { scaleY: 0.96, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : DURATION.element, delay: shouldReduceMotion ? 0 : staggerDelay(i), ease: EASE_OUT_QUART }}
                // framer pone transform-box: fill-box en SVG: el origen es relativo a la propia barra.
                style={{ transformOrigin: '50% 100%' }}
              />

              {/* Etiqueta de año */}
              <text
                x={bar.x + bar.width / 2}
                y={PADDING.top + CHART_HEIGHT + 16}
                textAnchor="middle"
                fill={isCurrent ? 'var(--ink)' : 'var(--ink-secondary)'}
                fontSize={isCurrent ? 12 : 10}
                fontFamily="var(--font-family)"
                fontWeight={isCurrent ? 600 : 400}
              >
                {bar.year}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="bursa-price-legend">
        <span>Precio inicial<strong>{formatCOP(basePrice)}</strong></span>
        <span>Referencia<strong>{formatCOP(targetPrice)}</strong></span>
      </div>
    </div>
  );
}
