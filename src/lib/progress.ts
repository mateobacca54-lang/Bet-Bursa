export interface ModuleProgress {
  moduleId: string;
  completedLessons: number[];
  lastVisitedLesson: number;
  streakDays: number;
  lastActiveDate: string | null;
  userName: string | null;
  namePrompted: boolean;
  emailPrompted: boolean;
  reviewedConcepts: number[];
  /**
   * ¿Ya aprobó la prueba de paso de este módulo? Es lo único que se guarda de ella: no hay
   * "reprobado" persistido (el reintento es libre y sin límite, ARQUITECTURA §2) ni número
   * de intentos persistido. La captura de comprensión se envía aparte, sin datos personales.
   */
  pruebaAprobada: boolean;
  /**
   * ¿Ya se reconoció la misión de fin de módulo (ARQUITECTURA §2)? No se corrige — es una
   * tarea fuera de la pantalla que solo se reconoce en la siguiente visita, nunca se
   * verifica que de verdad se hizo.
   */
  misionHecha: boolean;
}

export function emptyProgress(moduleId: string): ModuleProgress {
  return {
    moduleId,
    completedLessons: [],
    lastVisitedLesson: 1,
    streakDays: 0,
    lastActiveDate: null,
    userName: null,
    namePrompted: false,
    emailPrompted: false,
    reviewedConcepts: [],
    pruebaAprobada: false,
    misionHecha: false,
  };
}

/**
 * Se aprueba la prueba de paso. Nunca "se reprueba": fallar no persiste nada, solo se
 * reintenta (ver PruebaDePaso). Idempotente: aprobarla dos veces no hace nada distinto.
 */
export function passPrueba(progress: ModuleProgress): ModuleProgress {
  return progress.pruebaAprobada ? progress : { ...progress, pruebaAprobada: true };
}

/** Se reconoce la misión. Idempotente, igual que passPrueba. */
export function marcarMisionHecha(progress: ModuleProgress): ModuleProgress {
  return progress.misionHecha ? progress : { ...progress, misionHecha: true };
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysBetween(fromKey: string, toKey: string): number {
  const parse = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const fromUTC = parse(fromKey);
  const toUTC = parse(toKey);
  return Math.floor((toUTC - fromUTC) / (1000 * 60 * 60 * 24));
}

export function completeLesson(progress: ModuleProgress, lesson: number, now: Date): ModuleProgress {
  const newProgress = {
    ...progress,
    completedLessons: [...progress.completedLessons],
  };

  const todayKey = toDateKey(now);
  
  if (!newProgress.completedLessons.includes(lesson)) {
    newProgress.completedLessons.push(lesson);
  }
  
  newProgress.lastVisitedLesson = lesson;

  if (progress.lastActiveDate === null) {
    newProgress.streakDays = 1;
  } else {
    const diff = daysBetween(progress.lastActiveDate, todayKey);
    if (diff === 1) {
      newProgress.streakDays = progress.streakDays + 1;
    } else if (diff === 0) {
      if (newProgress.streakDays === 0) {
        newProgress.streakDays = 1;
      }
    } else {
      newProgress.streakDays = 1;
    }
  }

  newProgress.lastActiveDate = todayKey;

  return newProgress;
}

export function getCurrentStreak(progress: ModuleProgress, now: Date): number {
  if (!progress.lastActiveDate) return 0;
  const diff = daysBetween(progress.lastActiveDate, toDateKey(now));
  if (diff === 0 || diff === 1) {
    return progress.streakDays;
  }
  return 0;
}

export function getNextLesson(progress: ModuleProgress, totalLessons: number): number | null {
  for (let i = 1; i <= totalLessons; i++) {
    if (!progress.completedLessons.includes(i)) {
      return i;
    }
  }
  return null;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function resolveStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  try {
    return typeof globalThis !== 'undefined' && globalThis.localStorage ? globalThis.localStorage : null;
  } catch {
    // Con los datos del sitio bloqueados, ACCEDER a localStorage lanza SecurityError.
    return null;
  }
}

export const progressKey = (moduleId: string): string => `bursa:progress:v1:${moduleId}`;

/** Lee el JSON crudo de localStorage. Nunca lanza; devuelve null si no hay nada o no se puede leer. */
export function readRawProgress(moduleId: string, storage?: StorageLike): string | null {
  const s = resolveStorage(storage);
  if (!s) return null;
  try {
    return s.getItem(progressKey(moduleId));
  } catch {
    return null;
  }
}

/** Convierte el JSON crudo en progreso saneado. Nunca lanza. */
export function parseProgress(raw: string | null, moduleId: string): ModuleProgress {
  const empty = emptyProgress(moduleId);
  if (!raw) return empty;

  try {
    const parsed: Record<string, unknown> | null = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') return empty;

    return {
      moduleId: typeof parsed.moduleId === 'string' ? parsed.moduleId : empty.moduleId,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons.filter((x): x is number => typeof x === 'number') : empty.completedLessons,
      lastVisitedLesson: typeof parsed.lastVisitedLesson === 'number' ? parsed.lastVisitedLesson : empty.lastVisitedLesson,
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : empty.streakDays,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : empty.lastActiveDate,
      userName: typeof parsed.userName === 'string' ? parsed.userName : empty.userName,
      namePrompted: typeof parsed.namePrompted === 'boolean' ? parsed.namePrompted : empty.namePrompted,
      emailPrompted: typeof parsed.emailPrompted === 'boolean' ? parsed.emailPrompted : empty.emailPrompted,
      reviewedConcepts: Array.isArray(parsed.reviewedConcepts) ? parsed.reviewedConcepts.filter((x): x is number => typeof x === 'number') : empty.reviewedConcepts,
      pruebaAprobada: typeof parsed.pruebaAprobada === 'boolean' ? parsed.pruebaAprobada : empty.pruebaAprobada,
      misionHecha: typeof parsed.misionHecha === 'boolean' ? parsed.misionHecha : empty.misionHecha,
    };
  } catch {
    return empty;
  }
}

export function loadProgress(moduleId: string, storage?: StorageLike): ModuleProgress {
  return parseProgress(readRawProgress(moduleId, storage), moduleId);
}

export function saveProgress(progress: ModuleProgress, storage?: StorageLike): boolean {
  const s = resolveStorage(storage);
  if (!s) return false;
  try {
    s.setItem(progressKey(progress.moduleId), JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
