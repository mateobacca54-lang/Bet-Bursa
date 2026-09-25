/** Un límite simple por dirección, para que nadie use esto de máquina de escribir. */
const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 5;
const vistos = new Map<string, number[]>();

export function pasaElLimite(clave: string): boolean {
  const ahora = Date.now();
  const previos = (vistos.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (previos.length >= MAX_POR_VENTANA) {
    vistos.set(clave, previos);
    return false;
  }
  previos.push(ahora);
  vistos.set(clave, previos);
  // No crecer sin límite en un servidor de larga vida
  if (vistos.size > 500) {
    for (const [k, v] of vistos) if (v.every((t) => ahora - t >= VENTANA_MS)) vistos.delete(k);
  }
  return true;
}

