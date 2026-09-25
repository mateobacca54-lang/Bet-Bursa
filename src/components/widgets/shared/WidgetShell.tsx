'use client';

import { useState, useCallback } from 'react';
import type { WidgetState } from '@/lib/types';
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
 * Gestiona el estado, el feedback visual, y el botón de reintento.
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

  const handleRetry = useCallback(() => {
    setStateInternal('idle');
    onStateChange?.('idle');
  }, [onStateChange]);

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
      {/* Encabezado */}
      {title && (
        <h2
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--ink)',
            lineHeight: 'var(--line-height-tight)',
            margin: '0 0 var(--space-2) 0',
          }}
        >
          {title}
        </h2>
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
          color: 'var(--ink-secondary)',
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
        onRetry={state === 'wrong' ? handleRetry : undefined}
      />
    </div>
  );
}
