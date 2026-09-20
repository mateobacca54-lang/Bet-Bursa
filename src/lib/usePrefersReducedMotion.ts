'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(callback: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

/**
 * usePrefersReducedMotion — ¿el usuario pidió menos movimiento?
 *
 * Sustituye a `useReducedMotion()` de framer-motion en TODOS los componentes de Bursa.
 * Motivo: el de framer-motion lee la media query en el primer render del cliente, y el
 * servidor no puede conocerla; si difieren, el HTML no coincide y React descarta la
 * hidratación (error "Hydration failed"). Este hook devuelve `false` durante la
 * hidratación —igual que el servidor— y el valor real inmediatamente después.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
