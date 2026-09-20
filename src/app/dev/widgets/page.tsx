'use client';

import { ConsequenceSlider } from '@/components/widgets/ConsequenceSlider';
import { leccion02Config } from '@/content/modulo-1/leccion-02-inflacion';
import type { WidgetState } from '@/lib/types';

export default function WidgetsDevPage() {
  const handleStateChange = (state: WidgetState) => {
    console.log('[Widget State]', state);
  };

  const handleAttempt = (answer: number, isCorrect: boolean) => {
    console.log('[Attempt]', { answer, isCorrect });
  };

  return (
    <main
      style={{
        background: 'var(--surface)',
        minHeight: '100vh',
        padding: 'var(--space-8)',
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto var(--space-12) auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--brand-600)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase' as const,
            marginBottom: 'var(--space-2)',
          }}
        >
          Bursa · Dev · Widgets
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          Arquetipos de widgets interactivos
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-base)',
            color: 'var(--ink-secondary)',
            marginTop: 'var(--space-2)',
          }}
        >
          Página de desarrollo para probar widgets aislados.
        </p>
      </div>

      {/* Widget: ConsequenceSlider — Lección 02 */}
      <section
        style={{
          maxWidth: 720,
          margin: '0 auto var(--space-12) auto',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--ink-secondary)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase' as const,
            marginBottom: 'var(--space-3)',
            padding: '0 var(--space-2)',
          }}
        >
          Arquetipo A — ConsequenceSlider · Lección 02 · Inflación
        </div>

        <ConsequenceSlider
          config={leccion02Config}
          onStateChange={handleStateChange}
          onAttempt={handleAttempt}
        />
      </section>
    </main>
  );
}
