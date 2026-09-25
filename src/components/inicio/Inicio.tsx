'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MODULO_1, TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import { COMPLETE_CTA, MODULO_1_BLURB, MODULO_2_PREVIEW, MONEDITA_INTRO, WARM_UP } from '@/content/inicio';
import { getInicioView, PATH_HREF } from '@/lib/inicio';
import { getCurrentStreak, type ModuleProgress } from '@/lib/progress';
import { Reveal } from '@/components/motion';
import { AppShell, RollingNumber, getGreetingCopy } from '@/components/shell';
import Monedita from './Monedita';
import WarmUp from './WarmUp';
import ModuleCard from './ModuleCard';
import './inicio.css';

interface InicioProps {
  progress: ModuleProgress;
  /** El "ahora" con el que se decide el saludo; entra por props para que sea testeable */
  now: Date;
  /** false hasta que se leyó localStorage: hasta entonces el globo de Monedita va vacío */
  hydrated: boolean;
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M5 12h14m-5-6 6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Inicio — la pantalla que va entre la landing y el camino (/inicio).
 *
 * Adaptable: en la primera visita Monedita se presenta y propone una apuesta (predecir antes de
 * revelar); si el usuario ya empezó, lo saluda con el mismo texto que /modulo/1 y muestra el mapa
 * de módulos. No pide ningún dato (PLAN §5.5: el nombre se pide después, no antes).
 *
 * Secuencia: Monedita entra primero (t=0), luego el globo (t≈0.1), luego las opciones o las tarjetas.
 */
export default function Inicio({ progress, now, hydrated }: InicioProps) {
  const total = MODULO_1.lessonCount;
  const view = useMemo(() => getInicioView(progress, now, total), [progress, now, total]);
  const [reaction, setReaction] = useState(0);

  const copy = getGreetingCopy(view.greeting, TEMARIO_MODULO_1);
  const ctaLabel = view.greeting.state === 'complete' ? COMPLETE_CTA : copy.cta;
  const showPathLink = view.ctaHref !== PATH_HREF;

  return (
    <AppShell
      completed={view.greeting.completedCount}
      total={total}
      moduleLabel="Módulo 1"
      streakDays={getCurrentStreak(progress, now)}
      active="inicio"
    >
      {/* El título (h1) solo existe tras hidratar; sin él, la región no debe apuntar a un id inexistente. */}
      <section className="ini-hero" aria-labelledby={hydrated ? 'ini-titulo' : undefined}>
        <Monedita reaction={reaction} />

        <div className="ini-bubble">
          {hydrated && view.mode === 'first-visit' && (
            <>
              <Reveal as="h1" delay={0.08} className="ini-title" style={{ marginBottom: 'var(--space-2)' }}>
                <span id="ini-titulo">
                  {MONEDITA_INTRO.before}
                  <em>{MONEDITA_INTRO.name}</em>
                  {MONEDITA_INTRO.after}
                </span>
              </Reveal>
              <Reveal as="p" delay={0.12} className="ini-lead" style={{ marginBottom: 'var(--space-8)' }}>
                {MONEDITA_INTRO.lead}
              </Reveal>
              <WarmUp config={WARM_UP} ctaHref={view.ctaHref} onPick={() => setReaction((r) => r + 1)} />
            </>
          )}

          {hydrated && view.mode === 'returning' && (
            <>
              <Reveal as="h1" delay={0.08} className="ini-title">
                <span id="ini-titulo">
                  {copy.title.before}
                  {copy.title.name && <em>{copy.title.name}</em>}
                  {copy.title.after}
                </span>
              </Reveal>
              <Reveal as="p" delay={0.16} className="ini-lead">
                {copy.sub.map((segment, i) =>
                  segment.kind === 'text' ? (
                    <span key={i}>{segment.text}</span>
                  ) : (
                    <strong key={i}>
                      <RollingNumber value={segment.value} /> de {segment.total}
                    </strong>
                  )
                )}
              </Reveal>
              <Reveal delay={0.24}>
                <div className="ini-actions">
                  <Link href={view.ctaHref} className="ini-btn uppercase-tracking">
                    {ctaLabel}
                    <Arrow />
                  </Link>
                  {showPathLink && (
                    <Link href={PATH_HREF} className="ini-btn ini-btn--quiet uppercase-tracking">
                      Ver el camino
                    </Link>
                  )}
                </div>
              </Reveal>
            </>
          )}
        </div>
      </section>

      {hydrated && view.mode === 'returning' && (
        <section aria-labelledby="ini-modulos" style={{ marginTop: 'var(--space-12)' }}>
          <Reveal delay={0.3}>
            <h2 id="ini-modulos" className="ini-modules-title">
              Tus módulos
            </h2>
          </Reveal>
          <ul className="ini-grid">
            {view.modules.map((card, i) => (
              <Reveal as="li" key={card.number} delay={0.34 + i * 0.06}>
                <ModuleCard
                  card={card}
                  title={card.number === 1 ? MODULO_1.title : MODULO_2_PREVIEW.title}
                  blurb={card.number === 1 ? MODULO_1_BLURB : MODULO_2_PREVIEW.blurb}
                />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
