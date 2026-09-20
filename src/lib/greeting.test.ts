import { describe, it, expect } from 'vitest';
import { getGreetingState } from './greeting';
import { emptyProgress } from './progress';

describe('Greeting State (Ola 0)', () => {
  it('emptyProgress -> first-time', () => {
    const p = emptyProgress('m1');
    const state = getGreetingState(p, new Date(), 10);
    expect(state.state).toBe('first-time');
    expect(state.completedCount).toBe(0);
  });

  it('el corte de 3 días: hace 2 días -> in-progress; hace 3 -> returning-late', () => {
    const p = emptyProgress('m1');
    p.completedLessons = [1];
    p.lastActiveDate = '2026-09-17'; // hace 3 días respecto a 09-20
    
    // Hace 2 días
    const d2 = new Date(2026, 8, 19, 12, 0);
    const s2 = getGreetingState(p, d2, 10);
    expect(s2.state).toBe('in-progress');
    expect(s2.reviewLesson).toBeNull();
    
    // Hace 3 días
    const d3 = new Date(2026, 8, 20, 12, 0);
    const s3 = getGreetingState(p, d3, 10);
    expect(s3.state).toBe('returning-late');
    expect(s3.reviewLesson).toBe(1);
  });

  it('returning-late sin nada que repasar cae en in-progress', () => {
    const p = emptyProgress('m1');
    p.completedLessons = [1];
    p.reviewedConcepts = [1]; // ya repasado
    p.lastActiveDate = '2026-09-17';
    
    const d3 = new Date(2026, 8, 20, 12, 0);
    const s = getGreetingState(p, d3, 10);
    expect(s.state).toBe('in-progress'); // no returning-late
    expect(s.reviewLesson).toBeNull();
  });

  it('complete gana sobre returning-late', () => {
    const p = emptyProgress('m1');
    p.completedLessons = [1, 2, 3];
    p.lastActiveDate = '2026-09-17';
    
    const d3 = new Date(2026, 8, 20, 12, 0);
    const s = getGreetingState(p, d3, 3);
    expect(s.state).toBe('complete');
  });

  it('lastActiveDate futuro', () => {
    const p = emptyProgress('m1');
    p.completedLessons = [1];
    p.lastActiveDate = '2030-01-01'; // futuro
    
    const d = new Date(2026, 0, 1);
    const s = getGreetingState(p, d, 10);
    expect(s.state).toBe('in-progress'); // Nunca un estado raro
  });

  it('userName: recortes y nulos', () => {
    const p = emptyProgress('m1');
    p.completedLessons = [1];
    
    p.userName = '';
    expect(getGreetingState(p, new Date(), 10).userName).toBeNull();
    
    p.userName = '   ';
    expect(getGreetingState(p, new Date(), 10).userName).toBeNull();
    
    p.userName = ' Mateo  ';
    expect(getGreetingState(p, new Date(), 10).userName).toBe('Mateo');
  });
});
