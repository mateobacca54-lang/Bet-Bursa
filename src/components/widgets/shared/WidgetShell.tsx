'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WidgetState } from '@/lib/types';
import { celebrar } from '@/lib/celebrar';
import { originFromRect } from '@/lib/widget-feedback';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Card, Heading } from '@/components/ui';
import FeedbackOverlay from './FeedbackOverlay';
import MoneditaGuide from './MoneditaGuide';

interface WidgetShellProps {
  /** Título del ejercicio */
  title?: string;
  /** Instrucción principal */
  instruction: string;
  /** El widget interactivo */
  children: (props: {
    state: WidgetState;
    setState: (state: WidgetState) => void;
    attempts: number;
  }) => React.ReactNode;
  /** Mensaje de acierto */
  correctMessage: string;
  /** Mensaje de error */
  wrongMessage: string;
  /** Pista al fallar */
  hintMessage?: string;
  /** Callback externo de cambio de estado */
  onStateChange?: (state: WidgetState) => void;
  /** Número máximo de intentos antes de revelar */
  maxAttempts?: number;
}

/**
 * WidgetShell — contenedor con máquina de estados para todos los widgets.
 *
 * Flujo: idle → active → correct | wrong → (retry → active) | revealed
 *
 * Gestiona el estado, el feedback visual, y el botón de reintento. Al llegar a 'correct'
 * lanza `celebrar('corta', …)` desde el centro del propio widget (DESIGN.md §7.2).
 * Los widgets hijos reciben state + setState via render prop.
 */
export default function WidgetShell({
  title,
  instruction,
  children,
  correctMessage,
  wrongMessage,
  hintMessage,
  onStateChange,
  maxAttempts = 3,
}: WidgetShellProps) {
  const [state, setStateInternal] = useState<WidgetState>('idle');
  const [attempts, setAttempts] = useState(0);
  const reduced = usePrefersReducedMotion();
  const shellRef = useRef<HTMLDivElement>(null);

  const setState = useCallback(
    (newState: WidgetState) => {
      setStateInternal(newState);
      onStateChange?.(newState);

      if (newState === 'wrong') {
        setAttempts((prev) => {
          const next = prev + 1;
          // Revelar después de maxAttempts intentos fallidos
          if (next >= maxAttempts) {
            setTimeout(() => {
              setStateInternal('revealed');
              onStateChange?.('revealed');
            }, 1500);
          }
          return next;
        });
      }
    },
    [onStateChange, maxAttempts]
  );

  // Al acertar, la celebración sale del centro del propio widget, no del centro de la
  // pantalla: se siente como una consecuencia de lo que la persona acaba de hacer ahí.
  useEffect(() => {
    if (state !== 'correct') return;
    const el = shellRef.current;
    const origen = el
      ? originFromRect(el.getBoundingClientRect(), { width: window.innerWidth, height: window.innerHeight })
      : undefined;
    celebrar('corta', { reduced, origen });
  }, [state, reduced]);

  const handleRetry = useCallback(() => {
    setStateInternal('idle');
    onStateChange?.('idle');
  }, [onStateChange]);

  const handleReveal = useCallback(() => {
    setStateInternal('revealed');
    onStateChange?.('revealed');
  }, [onStateChange]);

  return (
    <div ref={shellRef} style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>
      <Card variant="raised" pad="lg">
        {/* Encabezado */}
        {title && (
          <Heading level={2} variant="title" size="sm" style={{ marginBottom: 'var(--space-2)' }}>
            {title}
          </Heading>
        )}

        <MoneditaGuide
          compact={!title}
          state={state}
          message={hintMessage ?? 'Haz una predicción antes de buscar la respuesta. Equivocarse aquí también es parte de entender.'}
        />

        {/* Instrucción */}
        <p
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-base)',
            color: 'var(--ink-soft)',
            lineHeight: 'var(--line-height-normal)',
            margin: '0 0 var(--space-6) 0',
          }}
        >
          {instruction}
        </p>

        {/* Widget interactivo (render prop) */}
        <div>{children({ state, setState, attempts })}</div>

        {/* Feedback */}
        <FeedbackOverlay
          state={state}
          correctMessage={correctMessage}
          wrongMessage={wrongMessage}
          hintMessage={hintMessage}
          attempts={attempts}
          maxAttempts={maxAttempts}
          onRetry={state === 'wrong' ? handleRetry : undefined}
          onReveal={state === 'wrong' ? handleReveal : undefined}
        />
      </Card>
    </div>
  );
}
