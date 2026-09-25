'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MODULO_1 } from '@/content/modulo-1/temario';
import { PRUEBA_MODULO_1 } from '@/content/modulo-1/prueba';
import { getNextLesson } from '@/lib/progress';
import { useProgress } from '@/lib/useProgress';
import { PruebaDePaso } from '@/components/prueba';

const PATH_HREF = '/modulo/1';

/** Pantalla simple para "todavía no": mismo patrón que Aside en LessonRoute.tsx. */
function Aside({ title, body }: { title: string; body: string }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-8) var(--space-4)',
        background: 'var(--surface)',
      }}
    >
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-2xl)', color: 'var(--ink)' }}>{title}</h1>
        <p style={{ margin: '0 0 var(--space-6) 0', color: 'var(--ink-secondary)', lineHeight: 'var(--line-height-normal)' }}>{body}</p>
        <Link
          href={PATH_HREF}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 'var(--touch-min)',
            padding: 'var(--space-3) var(--space-8)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--brand-600)',
            color: 'var(--on-brand)',
            fontWeight: 'var(--font-weight-semibold)',
            textDecoration: 'none',
          }}
        >
          Volver al camino
        </Link>
      </div>
    </main>
  );
}

/**
 * PruebaRoute — /modulo/1/prueba.
 *
 * Se puede entrar antes de tiempo (URL escrita a mano): si faltan lecciones, no se muestra
 * la prueba, se explica por qué. Ya aprobada, se puede volver a repasar por gusto — no se
 * bloquea, porque reintentar/repetir nunca tiene penalización (METODOLOGIA §5).
 */
export default function PruebaRoute() {
  const router = useRouter();
  const { progress, hydrated, pass } = useProgress(MODULO_1.id);

  // Hasta hidratar no sabemos el progreso real: no se decide nada con datos vacíos.
  if (!hydrated) return null;

  const todasHechas = getNextLesson(progress, MODULO_1.lessonCount) === null;
  if (!todasHechas) {
    const hechas = new Set(progress.completedLessons.filter((l) => l >= 1 && l <= MODULO_1.lessonCount)).size;
    return (
      <Aside
        title={`Llevas ${hechas} de ${MODULO_1.lessonCount} lecciones`}
        body="La prueba de paso repasa el módulo completo, así que se abre cuando terminas todas. Vuelve al camino y sigue donde ibas."
      />
    );
  }

  return (
    <PruebaDePaso
      situaciones={PRUEBA_MODULO_1}
      moduleNumber={1}
      moduleTitle={MODULO_1.title}
      exitHref={PATH_HREF}
      onAprobada={() => {
        pass();
        router.push(PATH_HREF);
      }}
    />
  );
}
