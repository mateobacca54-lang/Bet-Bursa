'use client';

import { useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { BursaWidgetProps, ElegirConfig } from '@/lib/types';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_QUART } from '@/lib/motion';
import { MoneditaGuide } from '@/components/widgets/shared';

/**
 * Elegir — el arquetipo que no corrige: refleja.
 *
 * Los otros cinco arquetipos validan una respuesta. Este no: cada opción es una decisión
 * legítima, y al elegir se muestra qué dice esa elección de quien la tomó. No hay estado
 * "wrong", no hay reintentar. Por eso no usa WidgetShell (pensado para acierto/error) y
 * tiene su propio contenedor, más simple.
 *
 * Se usa en los cierres de módulo y en la apuesta de Monedita. NUNCA en una prueba de paso:
 * esa sí corrige (src/content/modulo-1/prueba.ts tiene su propia lógica, con respuesta
 * correcta, porque ahí sí importa si la decisión fue la sensata).
 *
 * Llama a onStateChange('correct') al elegir — no porque haya acertado, sino porque es la
 * señal que ya usa el resto del producto para "esto se resolvió, se puede seguir".
 */
export default function Elegir({
  config,
  onStateChange,
  onAttempt,
  disabled = false,
}: BursaWidgetProps<ElegirConfig, string>) {
  const reduced = usePrefersReducedMotion();
  const groupId = useId();
  const [elegida, setElegida] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const elegir = (id: string) => {
    if (disabled || elegida) return;
    setElegida(id);
    onStateChange?.('correct');
    onAttempt?.(id, true);
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (elegida || disabled) return;
    const { options } = config;
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (index + 1) % options.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (index - 1 + options.length) % options.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      elegir(options[index].id);
      return;
    }
    if (next >= 0) {
      e.preventDefault();
      refs.current[options[next].id]?.focus();
    }
  };

  const opcionElegida = elegida ? config.options.find((o) => o.id === elegida) : null;

  return (
    <div
      style={{
        background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        padding: 'var(--space-8)',
        maxWidth: 640,
        width: '100%',
        margin: '0 auto',
      }}
    >
      <MoneditaGuide
        compact
        state={elegida ? 'correct' : 'idle'}
        message={opcionElegida ? 'Esa elección ya nos ayuda a acompañarte mejor. Vamos a construir desde ahí.' : 'No hay una respuesta correcta aquí. Elige la opción que más se parezca a lo que quieres lograr.'}
      />
      <p
        style={{
          margin: '0 0 var(--space-6) 0',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--font-size-base)',
          color: 'var(--ink-secondary)',
          lineHeight: 'var(--line-height-normal)',
        }}
      >
        {config.instruction}
      </p>

      <div role="radiogroup" aria-label={config.instruction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {config.options.map((op, i) => {
          const activa = elegida === op.id;
          const armed = elegida === null;
          return (
            <motion.button
              key={op.id}
              ref={(el) => {
                refs.current[op.id] = el;
              }}
              type="button"
              role="radio"
              aria-checked={activa}
              aria-describedby={activa ? `${groupId}-reflexion` : undefined}
              tabIndex={elegida ? (activa ? 0 : -1) : i === 0 ? 0 : -1}
              disabled={disabled || (!armed && !activa)}
              onClick={() => elegir(op.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              whileTap={reduced ? undefined : { scale: 0.985 }}
              animate={activa ? { scale: [1, 1.015, 1] } : { scale: 1 }}
              transition={{ duration: reduced ? 0 : DURATION.element, ease: EASE_OUT_QUART }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                textAlign: 'left',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--font-size-base)',
                color: 'var(--ink)',
                minHeight: 'var(--touch-min)',
                padding: 'var(--space-3) var(--space-5)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${activa ? 'var(--brand-600)' : 'var(--border)'}`,
                background: activa ? 'var(--brand-50)' : 'var(--surface)',
                cursor: !armed && !activa ? 'default' : 'pointer',
                opacity: !armed && !activa ? 0.5 : 1,
                boxShadow: activa ? '0 8px 18px rgba(244, 80, 27, 0.14)' : 'none',
                transition: 'border-color var(--transition-fast), opacity var(--transition-fast), box-shadow var(--transition-fast)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  borderRadius: 'var(--radius-pill)',
                  border: `2px solid ${activa ? 'var(--brand-600)' : 'var(--border)'}`,
                  background: activa ? 'var(--brand-600)' : 'transparent',
                }}
              />
              {op.label}
            </motion.button>
          );
        })}
      </div>

      {opcionElegida && (
        <motion.p
          id={`${groupId}-reflexion`}
          role="status"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.1 : DURATION.element, ease: EASE_OUT_QUART }}
          style={{
            margin: 'var(--space-6) 0 0 0',
            padding: 'var(--space-4) var(--space-5)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--brand-600)',
            background: 'var(--sand-100, var(--surface))',
            color: 'var(--ink)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 'var(--line-height-normal)',
          }}
        >
          {opcionElegida.reflexion}
        </motion.p>
      )}
    </div>
  );
}
