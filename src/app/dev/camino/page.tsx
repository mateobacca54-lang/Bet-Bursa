'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MODULO_1 } from '@/content/modulo-1/temario';
import { emptyProgress, toDateKey, type ModuleProgress } from '@/lib/progress';
import { ModuleHome } from '@/components/module';

/**
 * /dev/camino — banco de pruebas del camino y del saludo.
 *
 * El estado sale de la URL, así cada uno se puede abrir, capturar y compartir:
 *   ?done=3      lecciones completadas (0–10)
 *   &late=1      la última actividad fue hace 5 días (estado "volvió tarde")
 *   &name=1      el usuario tiene nombre ("Mateo")
 *   &prueba=1    con done=10: la prueba de paso está aprobada (si no, es "awaiting-test")
 *   &mision=1    con prueba=1: la misión de fin de módulo ya se reconoció
 */
const PRESETS: { label: string; query: string }[] = [
  { label: '0 · primera vez', query: 'done=0' },
  { label: '2 · en curso', query: 'done=2&name=1' },
  { label: '3 · volvió tarde', query: 'done=3&late=1&name=1' },
  { label: '5 · mitad, sin nombre', query: 'done=5' },
  { label: '10 · prueba pendiente', query: 'done=10&name=1' },
  { label: '10 · completo, misión pendiente', query: 'done=10&name=1&prueba=1' },
  { label: '10 · completo, misión hecha', query: 'done=10&name=1&prueba=1&mision=1' },
];

function build(done: number, late: boolean, named: boolean, prueba: boolean, mision: boolean, now: Date): ModuleProgress {
  const last = new Date(now);
  last.setDate(now.getDate() - (late ? 5 : 0));
  return {
    ...emptyProgress(MODULO_1.id),
    completedLessons: Array.from({ length: done }, (_, i) => i + 1),
    lastVisitedLesson: Math.max(done, 1),
    streakDays: done > 0 ? Math.min(done, 4) : 0,
    lastActiveDate: done > 0 ? toDateKey(last) : null,
    userName: named ? 'Mateo' : null,
    pruebaAprobada: prueba,
    misionHecha: mision,
  };
}

function Playground() {
  const params = useSearchParams();
  const [now] = useState(() => new Date());
  const done = Math.min(Math.max(Number(params.get('done') ?? 2) || 0, 0), MODULO_1.lessonCount);
  const late = params.get('late') === '1';
  const named = params.get('name') === '1';
  const prueba = params.get('prueba') === '1';
  const mision = params.get('mision') === '1';
  const progress = useMemo(() => build(done, late, named, prueba, mision, now), [done, late, named, prueba, mision, now]);

  return (
    <>
      <nav
        aria-label="Estados de prueba"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--ink)',
          color: 'var(--surface-raised)',
          fontSize: 'var(--font-size-xs)',
        }}
      >
        <strong style={{ marginRight: 'var(--space-2)' }}>Estado de prueba:</strong>
        {PRESETS.map((p) => (
          <Link
            key={p.query}
            href={`/dev/camino?${p.query}`}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--ink-secondary)',
              color: 'var(--surface-raised)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      <ModuleHome key={params.toString()} progress={progress} now={now} hydrated onReviewed={() => {}} onMisionHecha={() => {}} />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Playground />
    </Suspense>
  );
}
