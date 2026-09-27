'use client';

import { useRouter } from 'next/navigation';
import { MODULO_1 } from '@/content/modulo-1/temario';
import { nombreModulo } from '@/content/modulos';
import { PRUEBA_MODULO_1 } from '@/content/modulo-1/prueba';
import { getNextLesson } from '@/lib/progress';
import { useProgress } from '@/lib/useProgress';
import { PruebaDePaso } from '@/components/prueba';
import { Button, Heading } from '@/components/ui';

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
        background: 'var(--paper)',
      }}
    >
      <div style={{ maxWidth: 480, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', alignItems: 'center' }}>
        <Heading level={1} variant="display" size="md">
          {title}
        </Heading>
        <p style={{ margin: 0, color: 'var(--ink-soft)', lineHeight: 'var(--line-height-normal)' }}>{body}</p>
        <Button href={PATH_HREF}>Volver al camino</Button>
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
      moduleTitle={nombreModulo(1)}
      exitHref={PATH_HREF}
      onAprobada={() => {
        pass();
        router.push(PATH_HREF);
      }}
    />
  );
}
