'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MODULO_1, TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import { getLessonContent } from '@/content/modulo-1/lecciones';
import { getNextLesson } from '@/lib/progress';
import { useProgress } from '@/lib/useProgress';
import { LessonPlayer } from '@/components/lesson';

const PATH_HREF = '/modulo/1';

/** Pantalla simple para "todavía no" (lección sin contenido o aún bloqueada). */
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

export default function LessonRoute({ number }: { number: number }) {
  const router = useRouter();
  const { progress, hydrated, update, complete } = useProgress(MODULO_1.id);
  const entry = TEMARIO_MODULO_1.find((l) => l.number === number);
  const content = getLessonContent(number);

  if (!entry) return null;

  if (!content) {
    return <Aside title="Esta lección se está preparando" body="Todavía no está lista. Vuelve al camino y sigue con las que ya puedes hacer." />;
  }

  // Hasta hidratar no sabemos el progreso real: no decidimos el candado con datos vacíos.
  if (!hydrated) return null;

  const next = getNextLesson(progress, MODULO_1.lessonCount) ?? MODULO_1.lessonCount;
  if (number > next) {
    return <Aside title="Esta se abre más adelante" body={`Sigue el camino en orden: la que te toca ahora es la lección ${next}.`} />;
  }

  const askName = number === 1 && !progress.namePrompted;

  const finish = () => {
    complete(number);
    // Si no respondió el nombre, no se le vuelve a preguntar (PLAN §5.5).
    if (askName) update((p) => (p.namePrompted ? p : { ...p, namePrompted: true }));
    router.push(PATH_HREF);
  };

  return (
    <LessonPlayer
      entry={entry}
      content={content}
      exitHref={PATH_HREF}
      onFinish={finish}
      askName={askName}
      onName={(name) => update((p) => ({ ...p, userName: name, namePrompted: true }))}
    />
  );
}
