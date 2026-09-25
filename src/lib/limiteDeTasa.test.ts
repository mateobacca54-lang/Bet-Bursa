import { afterEach, expect, it, vi } from 'vitest';
import { pasaElLimite } from './limiteDeTasa';
afterEach(() => vi.useRealTimers());
it('permite cinco envíos por IP y vuelve a permitirlos al minuto', () => {
  vi.useFakeTimers();
  for (let i = 0; i < 5; i++) expect(pasaElLimite('ip-prueba')).toBe(true);
  expect(pasaElLimite('ip-prueba')).toBe(false);
  expect(pasaElLimite('otra-ip')).toBe(true);
  vi.advanceTimersByTime(60_000);
  expect(pasaElLimite('ip-prueba')).toBe(true);
});
