'use client';

import { useCallback, useRef, useId } from 'react';

interface SliderTrackProps {
  /** Valor mínimo */
  min: number;
  /** Valor máximo */
  max: number;
  /** Paso */
  step: number;
  /** Valor actual */
  value: number;
  /** Callback al cambiar */
  onChange: (value: number) => void;
  /** Etiqueta para accesibilidad */
  label: string;
  /** Etiqueta de visualización (ej. "2020") */
  displayValue: string;
  /** Deshabilitado */
  disabled?: boolean;
}

/**
 * SliderTrack — slider custom accesible construido sobre <input type="range">.
 *
 * - Track en --border, relleno progresivo en --brand-600.
 * - Thumb circular --surface-raised con --shadow-sm.
 * - Área táctil 44×44 px (la del <input>) aunque el thumb visual sea más pequeño.
 * - Soporta teclado (flechas), mouse y touch nativamente.
 */
export default function SliderTrack({
  min,
  max,
  step,
  value,
  onChange,
  label,
  displayValue,
  disabled = false,
}: SliderTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderId = useId();
  const progress = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        padding: 'var(--space-4) 0',
      }}
    >
      {/* Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-2)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--ink-secondary)',
        }}
      >
        <span>{min}</span>
        <span
          style={{
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--brand-700)',
            fontSize: 'var(--font-size-lg)',
          }}
        >
          {displayValue}
        </span>
        <span>{max}</span>
      </div>

      {/* Track visual */}
      <div
        ref={trackRef}
        style={{
          position: 'relative',
          width: '100%',
          height: 8,
          borderRadius: 'var(--radius-pill)',
          background: 'var(--border)',
          overflow: 'visible',
        }}
      >
        {/* Relleno progresivo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--brand-600)',
            transition: 'width 50ms ease',
          }}
        />

        {/* Thumb visual */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--surface-raised)',
            boxShadow: 'var(--shadow-sm), 0 0 0 3px var(--brand-600)',
            pointerEvents: 'none',
            transition: 'box-shadow var(--transition-fast)',
          }}
        />
      </div>

      {/* Input range invisible (para accesibilidad + interacción real) */}
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={displayValue}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          margin: 0,
          /* 44×44 touch target */
          minHeight: 'var(--touch-min)',
          zIndex: 2,
        }}
      />
    </div>
  );
}
