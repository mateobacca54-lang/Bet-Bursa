import type { ProportionCategory } from './types';

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

/** Pasos de un punto porcentual: los límites decimales se redondean hacia dentro. */
function bounds(categories: readonly ProportionCategory[]) {
  const min = categories.map((c) => Math.ceil(c.minPercent ?? 0));
  const max = categories.map((c) => Math.floor(c.maxPercent ?? 100));
  if (!categories.length || new Set(categories.map((c) => c.id)).size !== categories.length ||
    categories.some((c, i) => !Number.isFinite(c.initialPercent) || c.initialPercent < 0 ||
      !Number.isFinite(min[i]) || !Number.isFinite(max[i]) || min[i] < 0 || max[i] > 100 || min[i] > max[i]) ||
    sum(min) > 100 || sum(max) < 100) {
    throw new RangeError('Las categorías deben permitir repartir 100 % en pasos enteros.');
  }
  return { min, max };
}

/** Reparte una diferencia proporcionalmente, redistribuyendo al alcanzar un límite.
 * Los restos mayores reciben los puntos sobrantes; los empates siguen el orden de configuración.
 * Si todos los receptores tienen cero, reciben partes iguales.
 */
function distribute(amount: number, weights: readonly number[], capacities: readonly number[]) {
  const shares = weights.map(() => 0);
  let remaining = amount;
  let available = weights.map((_, i) => i).filter((i) => capacities[i] > 0);
  while (remaining > 0 && available.length) {
    const weight = sum(available.map((i) => weights[i]));
    const proposal = (i: number) => remaining * (weight ? weights[i] / weight : 1 / available.length);
    const saturated = available.filter((i) => proposal(i) >= capacities[i]);
    if (!saturated.length) {
      for (const i of available) shares[i] = proposal(i);
      break;
    }
    for (const i of saturated) { shares[i] = capacities[i]; remaining -= capacities[i]; }
    available = available.filter((i) => !saturated.includes(i));
  }
  const result = shares.map(Math.floor);
  let rest = amount - sum(result);
  const order = shares.map((_, i) => i).sort((a, b) => (shares[b] - result[b]) - (shares[a] - result[a]) || a - b);
  for (const i of order) {
    if (rest && result[i] < capacities[i]) { result[i]++; rest--; }
  }
  return result;
}

export function initialProportions(categories: readonly ProportionCategory[]): number[] {
  const { min, max } = bounds(categories);
  const values = categories.map((c, i) => Math.min(max[i], Math.max(min[i], Math.round(c.initialPercent))));
  const delta = 100 - sum(values);
  const changes = distribute(Math.abs(delta), values, values.map((v, i) => delta > 0 ? max[i] - v : v - min[i]));
  return values.map((v, i) => v + Math.sign(delta) * changes[i]);
}

export function proportionLimits(categories: readonly ProportionCategory[], index: number) {
  const { min, max } = bounds(categories);
  if (!categories[index]) throw new RangeError('Categoría desconocida.');
  return {
    min: Math.max(min[index], 100 - sum(max.filter((_, i) => i !== index))),
    max: Math.min(max[index], 100 - sum(min.filter((_, i) => i !== index))),
  };
}

export function redistributeProportions(categories: readonly ProportionCategory[], current: readonly number[], index: number, requested: number): number[] {
  const { min, max } = bounds(categories);
  const limits = proportionLimits(categories, index);
  if (!Number.isFinite(requested) || current.length !== categories.length || sum(current) !== 100 ||
    current.some((v, i) => !Number.isInteger(v) || v < min[i] || v > max[i])) {
    throw new RangeError('El reparto actual debe sumar 100 % y respetar los límites.');
  }
  const target = Math.min(limits.max, Math.max(limits.min, Math.round(requested)));
  const delta = target - current[index];
  const capacities = current.map((v, i) => i === index ? 0 : delta > 0 ? v - min[i] : max[i] - v);
  const changes = distribute(Math.abs(delta), current, capacities);
  return current.map((v, i) => i === index ? target : v - Math.sign(delta) * changes[i]);
}

/** El contrato no tiene savingsCategoryId: se reserva el id `ahorro` (alias `savings`). */
export function savingsIndex(categories: readonly ProportionCategory[]): number {
  const matches = categories.map((c, i) => c.id === 'ahorro' || c.id === 'savings' ? i : -1).filter((i) => i >= 0);
  if (matches.length !== 1) throw new RangeError('Configura exactamente una categoría con id ahorro o savings.');
  return matches[0];
}
