'use client';

import { useState } from 'react';
import { MODULO_1 } from '@/content/modulo-1/temario';
import { useProgress } from '@/lib/useProgress';
import { Inicio } from '@/components/inicio';

/**
 * Conecta Inicio con el progreso real (localStorage).
 * En el servidor y en el primer render de hidratación `hydrated` es false.
 */
export default function InicioRoute() {
  const { progress, hydrated } = useProgress(MODULO_1.id);
  // El "ahora" se fija al montar: el saludo no debe cambiar mientras el usuario lo lee.
  const [now] = useState(() => new Date());

  return <Inicio progress={progress} now={now} hydrated={hydrated} />;
}
