'use client';

import { useCallback, useState } from 'react';
import { MODULO_1 } from '@/content/modulo-1/temario';
import { useProgress } from '@/lib/useProgress';
import { ModuleHome } from '@/components/module';

/**
 * Conecta ModuleHome con el progreso real (localStorage).
 * En el servidor y en el primer render de hidratación `hydrated` es false.
 */
export default function ModuloUno() {
  const { progress, hydrated, update } = useProgress(MODULO_1.id);
  // El "ahora" se fija al montar: el saludo no debe cambiar mientras el usuario lo lee.
  const [now] = useState(() => new Date());

  const onReviewed = useCallback(
    (lesson: number) =>
      update((p) => ({
        ...p,
        reviewedConcepts: p.reviewedConcepts.includes(lesson)
          ? p.reviewedConcepts
          : [...p.reviewedConcepts, lesson],
      })),
    [update]
  );

  return <ModuleHome progress={progress} now={now} hydrated={hydrated} onReviewed={onReviewed} />;
}
