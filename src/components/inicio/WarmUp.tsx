'use client';

import { useState } from 'react';
import Link from 'next/link';
import { staggerDelay } from '@/lib/motion';
import { resolveWarmUp, type WarmUpResult } from '@/lib/inicio';
import type { WarmUpConfig, WarmUpOptionId } from '@/content/inicio';
import { Reveal } from '@/components/motion';
import './inicio.css';

interface WarmUpProps {
  config: WarmUpConfig;
  /** Adónde lleva el botón que aparece tras la revelación */
  ctaHref: string;
  /** Se llama una vez, cuando el usuario compromete su apuesta */
  onPick?: (result: WarmUpResult) => void;
}

/**
 * WarmUp — la apuesta de bienvenida: "predecir antes de revelar" (PLAN §2).
 *
 * El usuario compromete una respuesta ANTES de ver nada. Después Monedita la reconoce
 * y explica. No hay respuesta "mala": ninguna opción se pinta de rojo ni de verde, y la
 * elegida se marca solo como "Tu apuesta". Se puede recorrer con teclado (son botones).
 *
 * Las opciones quedan bloqueadas con aria-disabled y NO con `disabled`: así el foco del
 * teclado no se pierde cuando el usuario apuesta.
 */
export default function WarmUp({ config, ctaHref, onPick }: WarmUpProps) {
  const [result, setResult] = useState<WarmUpResult | null>(null);

  function pick(id: WarmUpOptionId) {
    if (result) return;
    const next = resolveWarmUp(config, id);
    setResult(next);
    onPick?.(next);
  }

  return (
    <div>
      <Reveal as="p" delay={0.12} className="ini-eyebrow uppercase-tracking">
        {config.eyebrow}
      </Reveal>
      <Reveal as="h2" delay={0.16} className="ini-question" style={{ margin: 0 }}>
        {config.question}
      </Reveal>
      <Reveal as="p" delay={0.2} className="ini-hint">
        {config.hint}
      </Reveal>

      <ul className="ini-options" aria-label="Tu apuesta">
        {config.options.map((option, i) => {
          const picked = result?.pickedId === option.id;
          return (
            <Reveal as="li" key={option.id} delay={0.24 + staggerDelay(i)}>
              <button
                type="button"
                className="ini-option"
                aria-disabled={result !== null}
                aria-pressed={result ? picked : undefined}
                data-picked={picked}
                onClick={() => pick(option.id)}
              >
                <span>{option.label}</span>
                {picked && <span className="ini-chip">Tu apuesta</span>}
              </button>
            </Reveal>
          );
        })}
      </ul>

      <div aria-live="polite">
        {result && (
          <Reveal className="ini-reveal">
            <p>{result.reveal}</p>
            <p>{config.outro}</p>
            <div className="ini-actions">
              <Link href={ctaHref} className="ini-btn uppercase-tracking">
                {config.cta}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path
                    d="M5 12h14m-5-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
