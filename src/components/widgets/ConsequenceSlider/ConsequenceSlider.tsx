'use client';

import { Objeto } from '@/components/illus';
import { useState, useMemo, useCallback } from 'react';
import type { BursaWidgetProps, ConsequenceSliderConfig, WidgetState } from '@/lib/types';
import { calculateInflatedPrice, formatCOP } from '@/lib/format';
import { WidgetShell } from '../shared';
import SliderTrack from './SliderTrack';
import LiveVisualization from './LiveVisualization';

/**
 * ConsequenceSlider — Arquetipo A
 *
 * El usuario mueve un slider y ve una visualización actualizarse en vivo.
 * Se valida contra un valor objetivo con tolerancia configurable.
 *
 * Caso de uso: "Este almuerzo costaba $8.000 en 2015. Mueve el slider
 * hasta encontrar el año en que pasa de $15.000."
 */
export default function ConsequenceSlider({
  config,
  onStateChange,
  onAttempt,
  disabled = false,
}: BursaWidgetProps<ConsequenceSliderConfig, number>) {
  const [currentValue, setCurrentValue] = useState(config.startValue);

  // Pre-calcular los datos de inflación
  const dataPoints = useMemo(() => {
    if (config.dataPoints && config.dataPoints.length > 0) {
      return config.dataPoints;
    }
    // Generar datos si no se proporcionan pre-calculados
    const points = [];
    for (let year = config.startValue; year <= config.endValue; year += config.step) {
      const yearsElapsed = year - config.startValue;
      const price = calculateInflatedPrice(
        config.basePrice,
        config.inflationRate,
        yearsElapsed
      );
      points.push({ x: year, y: price });
    }
    return points;
  }, [config]);

  // Encontrar el año objetivo (primer año en que precio >= target)
  const targetYear = useMemo(() => {
    const point = dataPoints.find((p) => p.y >= config.targetPrice);
    return point?.x ?? config.endValue;
  }, [dataPoints, config.targetPrice, config.endValue]);

  // Índice actual en los datos
  const currentIndex = useMemo(() => {
    return dataPoints.findIndex((p) => p.x === currentValue);
  }, [dataPoints, currentValue]);

  // Precio actual
  const currentPrice = useMemo(() => {
    const point = dataPoints.find((p) => p.x === currentValue);
    return point?.y ?? config.basePrice;
  }, [dataPoints, currentValue, config.basePrice]);

  const handleSliderChange = useCallback((value: number) => {
    setCurrentValue(value);
  }, []);

  const handleVerify = useCallback(
    (setState: (state: WidgetState) => void) => {
      const isCorrect = Math.abs(currentValue - targetYear) <= config.tolerance;
      setState(isCorrect ? 'correct' : 'wrong');
      onAttempt?.(currentValue, isCorrect);
    },
    [currentValue, targetYear, config.tolerance, onAttempt]
  );

  return (
    <WidgetShell
      title={config.hookText}
      instruction={config.instruction}
      correctMessage={config.explanationCorrect}
      wrongMessage={config.explanationWrong}
      hintMessage={`Pista: fíjate en el precio cuando se acerca a ${formatCOP(config.targetPrice)}.`}
      onStateChange={onStateChange}
    >
      {({ state, setState }) => (
        <div>
          {/* El objeto cuyo precio sube: se ve QUÉ se está comprando, no solo una cifra */}
          {config.visual && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
              <Objeto id={config.visual} size={64} />
            </div>
          )}

          {/* Visualización SVG */}
          <LiveVisualization
            dataPoints={dataPoints}
            currentIndex={currentIndex}
            basePrice={config.basePrice}
            targetPrice={config.targetPrice}
            currentYear={currentValue}
            currentPrice={currentPrice}
          />

          {/* Slider */}
          <div style={{ padding: '0 var(--space-4)' }}>
            <SliderTrack
              min={config.startValue}
              max={config.endValue}
              step={config.step}
              value={currentValue}
              onChange={handleSliderChange}
              label={config.label}
              displayValue={`${config.label}: ${currentValue}`}
              disabled={disabled || state === 'correct' || state === 'revealed'}
            />
          </div>

          {/* Botón Verificar */}
          {state !== 'correct' && state !== 'revealed' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 'var(--space-6)',
              }}
            >
              <button
                onClick={() => handleVerify(setState)}
                disabled={disabled}
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--on-brand)',
                  background: 'var(--brand-600)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: 'var(--space-3) var(--space-8)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'background var(--transition-fast), transform var(--transition-fast)',
                  minHeight: 'var(--touch-min)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase' as const,
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    e.currentTarget.style.background = 'var(--brand-700)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--brand-600)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Verificar
              </button>
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
