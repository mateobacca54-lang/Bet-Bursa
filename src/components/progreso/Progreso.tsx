'use client';

import { nombreModulo } from '@/content/modulos';
import Link from 'next/link';
import { MODULO_1, TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import { MISION_MODULO_1 } from '@/content/modulo-1/mision';
import { MODULO_2_PREVIEW } from '@/content/inicio';
import { getCurrentStreak, type ModuleProgress } from '@/lib/progress';
import { getProgresoView, type ModuloResumen } from '@/lib/progreso';
import { Reveal } from '@/components/motion';
import { AppShell, Mision } from '@/components/shell';
import { Button, Eyebrow, Pill } from '@/components/ui';

const SIGUIENTE = { number: MODULO_2_PREVIEW.number, title: MODULO_2_PREVIEW.title };

const ESTILO_NODO: Record<ModuloResumen['status'], { background: string; border: string }> = {
  complete: { background: 'var(--brand-600)', border: '2px solid var(--brand-400)' },
  'in-progress': { background: 'var(--surface-raised)', border: '3px solid var(--brand-500)' },
  start: { background: 'var(--surface-raised)', border: '2px solid var(--border)' },
  soon: { background: 'var(--paper-sunk)', border: '2px dashed var(--ink-soft)' },
};

interface ProgresoProps {
  progress: ModuleProgress;
  /** El "ahora" con el que se calcula la racha; entra por props para que sea testeable */
  now: Date;
  /** false hasta que se leyó localStorage: hasta entonces se muestra un cascarón */
  hydrated: boolean;
  /** El usuario pulsó "Ya lo hice" en la misión de fin de módulo */
  onMisionHecha: () => void;
}

function SeccionTitulo({ children }: { children: string }) {
  return (
    <h2 style={{ margin: '0 0 var(--space-4)', borderTop: '1px solid var(--border-hairline)', paddingTop: 'var(--space-6)' }}>
      <Eyebrow as="span" tone="brand">
        {children}
      </Eyebrow>
    </h2>
  );
}

function NodoModulo({ modulo }: { modulo: ModuloResumen }) {
  const contenido = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        textAlign: 'center',
        width: 110,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-pill)',
          ...ESTILO_NODO[modulo.status],
        }}
      >
        {modulo.status === 'complete' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--surface-raised)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12l5 5L11 6" />
          </svg>
        )}
      </span>
      <span
        style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          color: modulo.status === 'soon' ? 'var(--ink-soft)' : 'var(--ink)',
        }}
      >
        {modulo.status === 'soon' ? 'Próximamente' : modulo.title}
      </span>
    </div>
  );

  return modulo.href ? (
    <Link href={modulo.href} style={{ textDecoration: 'none' }} aria-label={`${modulo.title}, ir al módulo`}>
      {contenido}
    </Link>
  ) : (
    <div aria-label={`${modulo.title}, próximamente`}>{contenido}</div>
  );
}

function FilaModulo({ modulo }: { modulo: ModuloResumen }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) 0',
        borderBottom: '1px solid var(--border-hairline)',
      }}
    >
      <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--ink)' }}>
        {modulo.title}
      </span>
      {modulo.status === 'soon' ? (
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--ink-soft)' }}>Próximamente</span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--ink-soft)' }}>
          {modulo.completed}/{modulo.total}
          {modulo.pruebaAprobada && <Pill tone="brand">prueba ✓</Pill>}
        </span>
      )}
    </li>
  );
}

/**
 * Progreso — /progreso, el mapa del territorio recorrido (06-PRODUCTO.md §3.3).
 *
 * A propósito NO muestra tiempo en la app, sesiones, velocidad ni comparaciones
 * (METODOLOGIA §9): son métricas de asistencia, y esta pantalla es sobre lo que
 * ya se entiende, no sobre cuánto se usó Bursa.
 */
export default function Progreso({ progress, now, hydrated, onMisionHecha }: ProgresoProps) {
  const view = getProgresoView(progress, TEMARIO_MODULO_1, MODULO_1.title, MISION_MODULO_1, SIGUIENTE);

  return (
    <AppShell
      completed={view.totalHechas}
      total={view.totalLecciones}
      moduleLabel={nombreModulo(1)}
      streakDays={getCurrentStreak(progress, now)}
      active="progreso"
    >
      {!hydrated ? (
        <div
          aria-hidden="true"
          style={{ height: 480, background: 'var(--paper-sunk)', borderRadius: 'var(--radius-card-lg)' }}
        />
      ) : (
        <div style={{ maxWidth: 640 }}>
          <Reveal>
            <h1 className="bursa-screen-title" style={{ marginBottom: 'var(--space-6)' }}>
              Tu camino
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-4)',
                padding: 'var(--space-4) 0',
              }}
            >
              {view.modulos.map((modulo, i) => (
                <div key={modulo.number} style={{ display: 'flex', alignItems: 'center', flex: i < view.modulos.length - 1 ? 1 : undefined }}>
                  <NodoModulo modulo={modulo} />
                  {i < view.modulos.length - 1 && (
                    <span aria-hidden="true" style={{ flex: 1, height: 2, background: 'var(--border-hairline)', margin: '0 var(--space-2)', marginBottom: 40 }} />
                  )}
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 'var(--font-size-base)', color: 'var(--ink)' }}>
              Llevas{' '}
              <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--font-weight-bold)' }}>
                {view.totalHechas}
              </strong>{' '}
              de {view.totalLecciones} lecciones.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <SeccionTitulo>Lo que ya entiendes</SeccionTitulo>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {view.modulos.map((modulo) => (
                <FilaModulo key={modulo.number} modulo={modulo} />
              ))}
            </ul>
          </Reveal>

          {view.conceptosPendientes.length > 0 && (
            <Reveal delay={0.3}>
              <SeccionTitulo>Para repasar</SeccionTitulo>
              <ul style={{ listStyle: 'none', margin: '0 0 var(--space-4)', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {view.conceptosPendientes.map((c) => (
                  <li key={c.leccion} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--ink)' }}>
                    {c.concepto}
                  </li>
                ))}
              </ul>
              <Button href="/modulo/1" variant="secondary">
                Repasar en 30 segundos
              </Button>
            </Reveal>
          )}

          {view.mision && !view.mision.hecha && (
            <Reveal delay={0.4} style={{ marginTop: 'var(--space-8)', borderTop: '1px solid var(--border-hairline)', paddingTop: 'var(--space-6)' }}>
              <Mision texto={view.mision.texto} onDone={onMisionHecha} />
            </Reveal>
          )}
        </div>
      )}
    </AppShell>
  );
}
