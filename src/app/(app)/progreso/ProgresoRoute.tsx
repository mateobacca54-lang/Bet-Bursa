'use client';

import { useState } from 'react';
import { MODULO_1 } from '@/content/modulo-1/temario';
import { useProgress } from '@/lib/useProgress';
import { Progreso } from '@/components/progreso';

/**
 * Conecta Progreso con el progreso real (localStorage), igual que ModuloUno con ModuleHome.
 */
export default function ProgresoRoute() {
  const { progress, hydrated, marcarMision } = useProgress(MODULO_1.id);
  const [now] = useState(() => new Date());

  return <Progreso progress={progress} now={now} hydrated={hydrated} onMisionHecha={marcarMision} />;
}
