import { ModuleProgress, daysBetween, toDateKey } from './progress';

export type GreetingState = 'first-time' | 'in-progress' | 'returning-late' | 'awaiting-test' | 'complete';

export interface GreetingData {
  state: GreetingState;
  userName: string | null;
  completedCount: number;
  totalLessons: number;
  nextLesson: number | null;
  reviewLesson: number | null;
}

export function pickReviewConcept(progress: ModuleProgress): number | null {
  for (const lesson of progress.completedLessons) {
    if (!progress.reviewedConcepts.includes(lesson)) {
      return lesson;
    }
  }
  return null;
}

export function getGreetingState(progress: ModuleProgress, now: Date, totalLessons: number): GreetingData {
  const reviewLesson = pickReviewConcept(progress);
  
  const validCompleted = new Set(progress.completedLessons.filter(l => l >= 1 && l <= totalLessons));
  const completedCount = validCompleted.size;
  
  let nextLesson: number | null = null;
  for (let i = 1; i <= totalLessons; i++) {
    if (!validCompleted.has(i)) {
      nextLesson = i;
      break;
    }
  }

  let state: GreetingState = 'in-progress';

  if (completedCount === 0) {
    state = 'first-time';
  } else if (completedCount >= totalLessons) {
    // Las 10 lecciones no bastan: sin aprobar la prueba de paso no se avanza (ARQUITECTURA §2,
    // principio "se avanza demostrando, no asistiendo"). 'complete' solo llega tras aprobarla.
    state = progress.pruebaAprobada ? 'complete' : 'awaiting-test';
  } else if (progress.lastActiveDate) {
    const diff = daysBetween(progress.lastActiveDate, toDateKey(now));
    if (diff >= 3 && reviewLesson !== null) {
      state = 'returning-late';
    }
  }
  
  let userName = progress.userName;
  if (userName !== null) {
    const trimmed = userName.trim();
    if (trimmed === '') {
      userName = null;
    } else {
      userName = trimmed;
    }
  }

  return {
    state,
    userName,
    completedCount,
    totalLessons,
    nextLesson,
    reviewLesson: state === 'returning-late' ? reviewLesson : null
  };
}
