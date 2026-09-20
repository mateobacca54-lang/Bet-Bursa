'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  completeLesson,
  parseProgress,
  readRawProgress,
  saveProgress,
  type ModuleProgress,
} from './progress';

// ============================================================
// useProgress — progreso del usuario sobre localStorage.
//
// Usa useSyncExternalStore: el servidor (y el primer render de
// hidratación) ven "sin progreso"; el cliente lee localStorage
// justo después sin desajuste de hidratación.
// ============================================================

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener('storage', callback); // otras pestañas
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function notify(): void {
  listeners.forEach((l) => l());
}

const noopSubscribe = () => () => {};

/** false en el servidor y en el render de hidratación; true después. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function useProgress(moduleId: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRawProgress(moduleId),
    () => null
  );
  const hydrated = useHydrated();
  const progress = useMemo(() => parseProgress(raw, moduleId), [raw, moduleId]);

  const update = useCallback(
    (fn: (current: ModuleProgress) => ModuleProgress) => {
      const next = fn(parseProgress(readRawProgress(moduleId), moduleId));
      saveProgress(next);
      notify();
    },
    [moduleId]
  );

  const complete = useCallback(
    (lesson: number) => update((p) => completeLesson(p, lesson, new Date())),
    [update]
  );

  return { progress, hydrated, update, complete };
}
