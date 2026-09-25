'use client';

import { useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { BursaWidgetProps, ProportionBuilderConfig } from '@/lib/types';
import { initialProportions, proportionLimits, redistributeProportions, savingsIndex } from '@/lib/proporciones';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_QUART } from '@/lib/motion';
import { WidgetShell } from '../shared';

/** Repartir. Arrastrar una fila cambia su porcentaje respecto al inicio del gesto.
 * El id de la categoría evaluada debe ser `ahorro` (o `savings`).
 * onAttempt recibe porcentajes por id. Al cambiar de ejercicio, remontar con key.
 */
export default function ProportionBuilder({ config, disabled = false, locale = 'es-CO', onAttempt, onStateChange }: BursaWidgetProps<ProportionBuilderConfig, Record<string, number>>) {
  const reduced = usePrefersReducedMotion();
  const helpId = useId();
  const [values, setValues] = useState(() => initialProportions(config.categories));
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointer: number; index: number; x: number; width: number; values: number[] } | null>(null);
  const savings = savingsIndex(config.categories);
  const money = (percent: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(config.totalAmount * percent / 100);

  return (
    <WidgetShell instruction={config.instruction} correctMessage={config.feedbackPositive} wrongMessage={config.feedbackNegative}
      maxAttempts={Infinity} onStateChange={onStateChange}>
      {({ state, setState }) => {
        const locked = disabled || state === 'correct';
        const update = (index: number, target: number, source = values) => {
          if (locked) return;
          setValues(redistributeProportions(config.categories, source, index, target));
          if (state !== 'active') setState('active');
        };
        return (
          <div style={{ display: 'grid', gap: 'var(--space-4)', color: 'var(--ink)', fontFamily: 'var(--font-family)' }}>
            <strong data-testid="proportion-total">{money(100)} · {values.reduce((a, b) => a + b, 0)} %</strong>
            <div aria-hidden="true" style={{ position: 'relative', height: 'var(--touch-min)', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
              {config.categories.map((category, i) => (
                <motion.div key={category.id} initial={false}
                  animate={{ x: `${values.slice(0, i).reduce((a, b) => a + b, 0)}%`, scaleX: values[i] / 100 }}
                  transition={{ duration: reduced || dragging ? 0 : DURATION.micro, ease: EASE_OUT_QUART }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transformOrigin: 'left center', background: `var(${category.colorToken})` }} />
              ))}
            </div>
            <p id={helpId} style={{ margin: 0, color: 'var(--ink-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-normal)' }}>
              Arrastra una categoría a la derecha o a la izquierda. También puedes usar las flechas del teclado.
            </p>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {config.categories.map((category, i) => {
                const limits = proportionLimits(config.categories, i);
                return (
                  <button key={category.id} type="button" role="slider" disabled={locked}
                    aria-label={category.label} aria-describedby={helpId} aria-orientation="horizontal"
                    aria-valuenow={values[i]} aria-valuemin={limits.min} aria-valuemax={limits.max}
                    aria-valuetext={`${values[i]} %, ${money(values[i])}`}
                    onKeyDown={(event) => {
                      const direction = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
                      if (direction !== undefined || event.key === 'Home' || event.key === 'End') {
                        event.preventDefault();
                        update(i, event.key === 'Home' ? limits.min : event.key === 'End' ? limits.max : values[i] + direction!);
                      }
                    }}
                    onPointerDown={(event) => {
                      if (locked || !event.isPrimary || event.button !== 0) return;
                      event.currentTarget.focus();
                      event.currentTarget.setPointerCapture(event.pointerId);
                      drag.current = { pointer: event.pointerId, index: i, x: event.clientX, width: event.currentTarget.getBoundingClientRect().width, values: [...values] };
                      setDragging(true);
                    }}
                    onPointerMove={(event) => {
                      const gesture = drag.current;
                      if (!gesture || gesture.pointer !== event.pointerId || gesture.index !== i || !gesture.width) return;
                      update(i, gesture.values[i] + (event.clientX - gesture.x) / gesture.width * 100, gesture.values);
                    }}
                    onPointerUp={(event) => {
                      if (drag.current?.pointer !== event.pointerId) return;
                      drag.current = null;
                      setDragging(false);
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }}
                    onLostPointerCapture={() => { drag.current = null; setDragging(false); }}
                    onPointerCancel={() => { drag.current = null; setDragging(false); }}
                    style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', width: '100%', minHeight: 'var(--touch-min)', padding: 'var(--space-3)', border: 0, borderLeft: `var(--space-2) solid var(${category.colorToken})`, borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', textAlign: 'left', cursor: locked ? 'default' : 'ew-resize', touchAction: 'pan-y', userSelect: 'none', overflowWrap: 'anywhere' }}>
                    <span>{category.label}</span>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)', fontVariantNumeric: 'tabular-nums' }}>{values[i]} % · {money(values[i])}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" disabled={locked} onClick={() => {
              if (locked) return;
              const correct = values[savings] >= config.savingsMinPercent;
              setState(correct ? 'correct' : 'wrong');
              onAttempt?.(Object.fromEntries(config.categories.map((c, i) => [c.id, values[i]])), correct);
            }} style={{ minHeight: 'var(--touch-min)', padding: 'var(--space-3) var(--space-4)', border: 0, borderRadius: 'var(--radius-pill)', background: 'var(--brand-600)', color: 'var(--on-brand)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', cursor: locked ? 'default' : 'pointer' }}>
              {state === 'correct' ? 'Reparto confirmado' : 'Confirmar reparto'}
            </button>
          </div>
        );
      }}
    </WidgetShell>
  );
}
