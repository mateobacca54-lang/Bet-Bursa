// ============================================================
// graficaConectada.ts — Lógica pura del widget GraficaConectada.
//
// Dos vistas conectadas (PLAN §4.2 / RUTA-DE-APRENDIZAJE §4): una gráfica de precio
// por año y un objeto concreto (el bolsillo) que muestra cuántas empanadas compra esa
// plata. Todo lo que se puede calcular sin DOM vive aquí, con test en vitest.
// ============================================================

export interface GeometriaGrafica {
  /** Ancho del viewBox SVG. */
  width: number;
  /** Alto del viewBox SVG. */
  height: number;
  /** Margen interno: dejar sitio a los precios del eje Y, los años del eje X y el
   * punto resaltado con su etiqueta. */
  padding: { top: number; right: number; bottom: number; left: number };
}

/**
 * Geometría por defecto de la gráfica: proporción 4∶3 (como pide el segundo pase),
 * con margen suficiente para etiquetas de precio a la izquierda ($4.000 cabe sin
 * recortarse) y para los años + la manija del slider abajo.
 */
export const GEOMETRIA_DEFAULT: GeometriaGrafica = {
  width: 360,
  height: 270,
  padding: { top: 28, right: 20, bottom: 40, left: 60 },
};

export interface PuntoGrafica {
  /** Años desde hoy (0 = hoy). */
  anio: number;
  /** Precio de la empanada ese año, en pesos. */
  precio: number;
  /** Coordenada x en el viewBox de la gráfica. */
  x: number;
  /** Coordenada y en el viewBox de la gráfica (crece hacia abajo, como SVG). */
  y: number;
}

/**
 * precioEnAnio — precio compuesto por inflación, redondeado a la moneda más cercana
 * que de verdad circula: $50.
 *
 * @param precio      — precio de hoy (año 0), en pesos
 * @param inflacion   — tasa anual en PORCENTAJE (ej. 6.24, no 0.0624)
 * @param anio        — años desde hoy
 */
export function precioEnAnio(precio: number, inflacion: number, anio: number): number {
  const tasa = inflacion / 100;
  const bruto = precio * Math.pow(1 + tasa, anio);
  return Math.round(bruto / 50) * 50;
}

/**
 * unidadesQueAlcanzan — cuántas empanadas completas compra esa plata a ese precio.
 * Nunca negativo; un precio de 0 o menos no alcanza a calcularse y devuelve 0.
 */
export function unidadesQueAlcanzan(plata: number, precio: number): number {
  if (precio <= 0 || plata <= 0) return 0;
  return Math.floor(plata / precio);
}

/**
 * sobrante — cuánta plata queda en el bolsillo después de comprar todas las empanadas
 * completas que alcanzan. Nunca negativo.
 */
export function sobrante(plata: number, precio: number): number {
  if (plata <= 0) return 0;
  if (precio <= 0) return plata;
  return plata - unidadesQueAlcanzan(plata, precio) * precio;
}

/**
 * tiquetesEje — "tiquetes lindos" para un eje numérico: pasos de 1, 2, 5 o 10 (por
 * potencia de 10), como hacen D3 y la mayoría de librerías de gráficas. Cubren todo el
 * rango [valorMin, valorMax] y suelen quedar 3 a 6 tiquetes.
 */
export function tiquetesEje(valorMin: number, valorMax: number, cantidadObjetivo = 4): number[] {
  if (!Number.isFinite(valorMin) || !Number.isFinite(valorMax)) return [0];
  if (valorMax <= valorMin) return [Math.round(valorMin)];

  const rango = valorMax - valorMin;
  const pasoBruto = rango / Math.max(cantidadObjetivo - 1, 1);
  const magnitud = Math.pow(10, Math.floor(Math.log10(pasoBruto)));
  const residuo = pasoBruto / magnitud;

  let pasoNormalizado: number;
  if (residuo >= 5) pasoNormalizado = 10;
  else if (residuo >= 2) pasoNormalizado = 5;
  else if (residuo >= 1) pasoNormalizado = 2;
  else pasoNormalizado = 1;

  const paso = pasoNormalizado * magnitud;
  const inicio = Math.floor(valorMin / paso) * paso;
  const fin = Math.ceil(valorMax / paso) * paso;

  const tiquetes: number[] = [];
  for (let v = inicio; v <= fin + paso * 0.5; v += paso) {
    tiquetes.push(Math.round(v));
  }
  return tiquetes;
}

export interface DominioPrecios {
  /** Precio más bajo del tiquete del eje (puede ser menor al precio real más bajo). */
  min: number;
  /** Precio más alto del tiquete del eje (puede ser mayor al precio real más alto). */
  max: number;
  /** Los tiquetes en sí, para dibujar la rejilla y sus etiquetas. */
  ticks: number[];
}

/**
 * dominioPrecios — el rango del eje Y para una serie de precios, ya redondeado a
 * tiquetes lindos. Tanto `puntosGrafica` como el eje de la gráfica usan este mismo
 * dominio, así el punto queda siempre a la altura correcta entre las líneas de la rejilla.
 */
export function dominioPrecios(
  precioInicial: number,
  inflacionAnual: number,
  anios: number,
  cantidadTicks = 4
): DominioPrecios {
  const precios = Array.from({ length: anios + 1 }, (_, anio) => precioEnAnio(precioInicial, inflacionAnual, anio));
  const minReal = Math.min(...precios);
  const maxReal = Math.max(...precios);
  const ticks = tiquetesEje(minReal, maxReal, cantidadTicks);
  return { min: ticks[0], max: ticks.at(-1) ?? maxReal, ticks };
}

/**
 * escalaY — convierte un precio a coordenada Y del viewBox, dado el dominio del eje.
 * La misma función que usa `puntosGrafica` para el punto la usa la gráfica para las
 * líneas de la rejilla: nunca hay dos fórmulas de escala que puedan desalinearse.
 */
export function escalaY(
  precio: number,
  dominio: Pick<DominioPrecios, 'min' | 'max'>,
  geometria: GeometriaGrafica = GEOMETRIA_DEFAULT
): number {
  const rango = Math.max(dominio.max - dominio.min, 1);
  const { height, padding } = geometria;
  const chartHeight = height - padding.top - padding.bottom;
  return padding.top + chartHeight - ((precio - dominio.min) / rango) * chartHeight;
}

/**
 * puntosGrafica — la serie completa (año 0..anios) ya escalada a coordenadas del
 * viewBox, para dibujar el punto y la línea sin que el componente haga geometría.
 */
export function puntosGrafica(
  precioInicial: number,
  inflacionAnual: number,
  anios: number,
  geometria: GeometriaGrafica = GEOMETRIA_DEFAULT
): PuntoGrafica[] {
  const precios = Array.from({ length: anios + 1 }, (_, anio) => ({
    anio,
    precio: precioEnAnio(precioInicial, inflacionAnual, anio),
  }));

  const dominio = dominioPrecios(precioInicial, inflacionAnual, anios);
  const { width, padding } = geometria;
  const chartWidth = width - padding.left - padding.right;

  return precios.map(({ anio, precio }) => ({
    anio,
    precio,
    x: anios === 0 ? padding.left : padding.left + (anio / anios) * chartWidth,
    y: escalaY(precio, dominio, geometria),
  }));
}
