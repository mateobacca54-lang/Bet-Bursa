'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { WidgetState } from '@/lib/types';

interface FeedbackOverlayProps {
  state: WidgetState;
  correctMessage: string;
  wrongMessage: string;
  hintMessage?: string;
  onRetry?: () => void;
}

/**
 * FeedbackOverlay — overlay animado de feedback para todos los widgets.
 *
 * - Correcto: icono ✓ con fondo --feedback-correct, escala animada.
 * - Incorrecto: icono ✗ con borde --feedback-wrong, shake horizontal 120ms.
 * - Respeta prefers-reduced-motion: sin animaciones, solo cambio visual.
 * - aria-live="assertive" para anunciar resultado a lectores de pantalla.
 */
export default function FeedbackOverlay({
  state,
  correctMessage,
  wrongMessage,
  hintMessage,
  onRetry,
}: FeedbackOverlayProps) {
  const shouldReduceMotion = useReducedMotion();

  if (state !== 'correct' && state !== 'wrong' && state !== 'revealed') {
    return null;
  }

  const isCorrect = state === 'correct';
  const isRevealed = state === 'revealed';

  const correctAnimation = shouldReduceMotion
    ? {}
    : {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: [0, 1.15, 1], opacity: 1 },
        transition: { duration: 0.3, ease: 'easeOut' as const },
      };

  const wrongAnimation = shouldReduceMotion
    ? {}
    : {
        initial: { x: 0 },
        animate: { x: [0, -6, 6, -6, 6, 0] },
        transition: { duration: 0.12 },
      };

  return (
    <div
      aria-live="assertive"
      role="status"
      className="feedback-overlay"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-6)',
        marginTop: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        background: isCorrect
          ? 'var(--surface-raised)'
          : 'var(--surface-raised)',
        border: isCorrect
          ? '2px solid var(--feedback-correct)'
          : '2px solid var(--feedback-wrong)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Icono animado */}
      {isCorrect ? (
        <motion.div
          {...correctAnimation}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--feedback-correct)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--on-brand)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      ) : (
        <motion.div
          {...wrongAnimation}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '2px solid var(--feedback-wrong)',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--feedback-wrong)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </motion.div>
      )}

      {/* Mensaje */}
      <p
        style={{
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--ink)',
          lineHeight: 'var(--line-height-normal)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        {isCorrect
          ? correctMessage
          : isRevealed
          ? correctMessage
          : wrongMessage}
      </p>

      {/* Pista (solo en wrong, no en revealed) */}
      {state === 'wrong' && hintMessage && (
        <p
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--ink-secondary)',
            lineHeight: 'var(--line-height-normal)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          {hintMessage}
        </p>
      )}

      {/* Botón de reintento (solo en wrong) */}
      {state === 'wrong' && onRetry && (
        <button
          onClick={onRetry}
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--ink)',
            background: 'var(--surface-raised)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            padding: 'var(--space-2) var(--space-6)',
            cursor: 'pointer',
            transition: 'background var(--transition-fast)',
            minHeight: 'var(--touch-min)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase' as const,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--brand-50)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--surface-raised)';
          }}
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
