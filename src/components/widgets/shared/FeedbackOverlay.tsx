'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO, EASE_OUT_QUART, variants, motionSafe } from '@/lib/motion';
import { shouldOfferReveal } from '@/lib/widget-feedback';
import { Button } from '@/components/ui';
import type { WidgetState } from '@/lib/types';

interface FeedbackOverlayProps {
  state: WidgetState;
  correctMessage: string;
  wrongMessage: string;
  hintMessage?: string;
  /** Intentos fallidos hasta ahora (para decidir si ofrecer "Ver la respuesta"). */
  attempts?: number;
  /** Tope de intentos del widget (WidgetShell revela solo al llegarlo). */
  maxAttempts?: number;
  onRetry?: () => void;
  /** Revela la respuesta de inmediato, sin esperar el auto-reveal de WidgetShell. */
  onReveal?: () => void;
}

/**
 * FeedbackOverlay — overlay animado de feedback para todos los widgets.
 *
 * - Correcto: círculo --feedback-correct con un check dibujado (`pathLength`, DESIGN.md §7).
 * - Incorrecto: `shake` de 0,32 s, ink-toned (nunca rojo agresivo), explicación y reintento.
 * - Revelado: calmo, sin temblor, muestra la respuesta correcta.
 * - Respeta prefers-reduced-motion (usePrefersReducedMotion, no el de framer-motion).
 * - `aria-live="polite"`: la celebración se anuncia sin interrumpir al lector de pantalla.
 */
export default function FeedbackOverlay({
  state,
  correctMessage,
  wrongMessage,
  hintMessage,
  attempts = 0,
  maxAttempts = Infinity,
  onRetry,
  onReveal,
}: FeedbackOverlayProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // El resultado puede quedar bajo la barra fija de la lección: se trae a la vista.
  useEffect(() => {
    if (state === 'correct' || state === 'wrong' || state === 'revealed') {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    }
  }, [state, reduced]);

  if (state !== 'correct' && state !== 'wrong' && state !== 'revealed') {
    return null;
  }

  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const shakeVariant = motionSafe(variants, reduced).shake;
  const offerReveal = isWrong && onReveal && shouldOfferReveal(maxAttempts) && attempts >= maxAttempts - 1;

  return (
    <motion.div
      ref={ref}
      aria-live="polite"
      role="status"
      className="feedback-overlay"
      initial={isWrong && !reduced ? { x: 0 } : undefined}
      animate={isWrong ? shakeVariant : undefined}
      style={{
        scrollMarginBottom: 'calc(var(--space-16) * 2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-6)',
        marginTop: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-raised)',
        border: `2px solid ${isCorrect ? 'var(--feedback-correct)' : 'var(--feedback-wrong)'}`,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Icono */}
      {isCorrect ? (
        <motion.div
          initial={reduced ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduced ? 0 : DURATION.element, ease: EASE_OUT_QUART }}
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <motion.polyline
              points="20 6 9 17 4 12"
              stroke="var(--on-brand)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : DURATION.element, ease: EASE_OUT_EXPO, delay: reduced ? 0 : 0.1 }}
            />
          </svg>
        </motion.div>
      ) : (
        <div
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
        </div>
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
        {isCorrect || state === 'revealed' ? correctMessage : wrongMessage}
      </p>

      {/* Pista (solo en wrong, no en revealed) */}
      {isWrong && hintMessage && (
        <p
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--ink-soft)',
            lineHeight: 'var(--line-height-normal)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          {hintMessage}
        </p>
      )}

      {/* Botones (solo en wrong) */}
      {isWrong && (onRetry || offerReveal) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-3)' }}>
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Intentar de nuevo
            </Button>
          )}
          {offerReveal && (
            <Button variant="ghost" onClick={onReveal}>
              Ver la respuesta
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
