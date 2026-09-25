'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MODULO_1, TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import { MISION_MODULO_1 } from '@/content/modulo-1/mision';
import { getGreetingState, type GreetingData } from '@/lib/greeting';
import { getCurrentStreak, getNextLesson, type ModuleProgress } from '@/lib/progress';
import { Reveal } from '@/components/motion';
import { AppShell, Greeting } from '@/components/shell';
import { LearningPath } from '@/components/path';
import { FloatingPapers } from '@/components/decor';
import { PruebaCheckpoint } from '@/components/prueba';

interface ModuleHomeProps {
  progress: ModuleProgress;
  /** El "ahora" con el que se decide el saludo; entra por props para que sea testeable */
  now: Date;
  /** false hasta que se leyó localStorage: hasta entonces no se muestra saludo ni camino */
  hydrated: boolean;
  /** El usuario pulsó "Lo tengo" en el repaso */
  onReviewed: (lesson: number) => void;
  /** El usuario pulsó "Ya lo hice" en la misión de fin de módulo */
  onMisionHecha: () => void;
}

const hrefFor = (lesson: number) => `/modulo/1/leccion/${lesson}`;

/** Punto de la leyenda: repite el aspecto del nodo para que se entienda sin explicar */
function LegendDot({ kind }: { kind: 'done' | 'current' | 'locked' }) {
  const style =
    kind === 'done'
      ? { background: 'var(--brand-600)', border: '2px solid var(--brand-400)' }
      : kind === 'current'
        ? { background: 'var(--surface-raised)', border: '3px solid var(--brand-500)' }
        : { background: 'var(--ink)', border: '2px dashed var(--ink-secondary)' };
  return (
    <span
      aria-hidden="true"
      style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 'var(--radius-pill)', ...style }}
    />
  );
}

/**
 * ModuleHome — la pantalla de /modulo/1: saludo, papeles flotantes y el camino.
 *
 * Secuencia deliberada: primero se te reconoce (saludo, t=0), después se te muestra el
 * terreno (el camino se dibuja a partir de t=0.4).
 */
export default function ModuleHome({ progress, now, hydrated, onReviewed, onMisionHecha }: ModuleHomeProps) {
  const total = MODULO_1.lessonCount;
  const live = useMemo(() => getGreetingState(progress, now, total), [progress, now, total]);

  // El estado del saludo se fija la primera vez que hay datos reales: si el usuario pulsa
  // "Lo tengo", el saludo NO debe cambiar de frase debajo de sus ojos.
  const [frozen, setFrozen] = useState<GreetingData | null>(null);
  if (hydrated && frozen === null) setFrozen(live);
  const greeting = frozen ?? live;

  const nextLesson = getNextLesson(progress, total);
  // Las 10 hechas y sin aprobar: el botón lleva a la prueba, no al módulo siguiente
  // (ARQUITECTURA §2: se avanza demostrando, no asistiendo).
  const ctaHref =
    greeting.state === 'awaiting-test' ? '/modulo/1/prueba' : nextLesson ? hrefFor(nextLesson) : '/modulo/2';

  return (
    <AppShell
      completed={live.completedCount}
      total={total}
      moduleLabel="Módulo 1"
      streakDays={getCurrentStreak(progress, now)}
    >
      <div className="bursa-hero" style={{ minHeight: 340, display: 'flex', alignItems: 'center' }}>
        <FloatingPapers />
        {hydrated && (
          <div style={{ width: '100%' }}>
            <Greeting
              data={greeting}
              lessons={TEMARIO_MODULO_1}
              ctaHref={ctaHref}
              onReviewed={onReviewed}
              mision={{ texto: MISION_MODULO_1, hecha: progress.misionHecha }}
              onMisionHecha={onMisionHecha}
            />
          </div>
        )}
      </div>

      <motion.section layout aria-labelledby="camino-titulo" style={{ marginTop: 'var(--space-12)' }}>
        <Reveal delay={0.3}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <span
                className="uppercase-tracking"
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--brand-700)',
                }}
              >
                Módulo 1
              </span>
              <h2
                id="camino-titulo"
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: 'var(--line-height-tight)',
                  color: 'var(--ink)',
                }}
              >
                {MODULO_1.title}
              </h2>
            </div>

            <ul
              aria-label="Leyenda del camino"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                margin: 0,
                padding: 0,
                listStyle: 'none',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--ink-secondary)',
              }}
            >
              {(
                [
                  ['done', 'Hecha'],
                  ['current', 'Sigue'],
                  ['locked', 'Por abrir'],
                ] as const
              ).map(([kind, text]) => (
                <li key={kind} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <LegendDot kind={kind} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {hydrated ? (
          <LearningPath
            lessons={TEMARIO_MODULO_1}
            completedLessons={progress.completedLessons}
            nextLesson={nextLesson}
            hrefFor={hrefFor}
            ticker={`M1 · ${MODULO_1.title}`}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{ height: 420, background: 'var(--ink)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}
          />
        )}

        {hydrated && greeting.state === 'awaiting-test' && (
          <PruebaCheckpoint moduleNumber={1} href="/modulo/1/prueba" delay={0.5} />
        )}
      </motion.section>
    </AppShell>
  );
}
