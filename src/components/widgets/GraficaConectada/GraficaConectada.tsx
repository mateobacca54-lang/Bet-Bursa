'use client';

import { useId, useMemo, useState, useCallback } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { formatCOP } from '@/lib/format';
import { precioEnAnio, unidadesQueAlcanzan, sobrante as sobranteDe, puntosGrafica, dominioPrecios } from '@/lib/graficaConectada';
import Grafica, { SVG_WIDTH, SVG_HEIGHT, PADDING, EJE_X_Y } from './Grafica';
import Bolsillo from './Bolsillo';
import './graficaConectada.css';

export interface GraficaConectadaProps {
  /** Precio de hoy de una empanada, en pesos. */
  precioInicial?: number;
  /** Inflación anual, en PORCENTAJE (ej. 6.24, tal como llega de `RESPALDO.inflacion.valor`). */
  inflacionAnual: number;
  /** Plata fija con la que se compran empanadas, en pesos. */
  plata?: number;
  /** Cuántos años hacia adelante muestra la gráfica. */
  anios?: number;
}

const pluralizar = (n: number, singular: string, plural: string) => (n === 1 ? singular : plural);

// La manija vive exactamente bajo el eje X: mismo left/width que el área de datos de la
// gráfica (padding.left..width-padding.right), así el thumb del <input> cae en el mismo
// x que el punto para cualquier año. El top se ancla a la línea del eje X.
const SLIDER_LEFT_PCT = (PADDING.left / SVG_WIDTH) * 100;
const SLIDER_WIDTH_PCT = ((SVG_WIDTH - PADDING.left - PADDING.right) / SVG_WIDTH) * 100;
const SLIDER_TOP_PCT = (EJE_X_Y / SVG_HEIGHT) * 100;

/**
 * GraficaConectada — dos vistas conectadas (RUTA-DE-APRENDIZAJE §4.2): una gráfica de
 * precio y un objeto concreto que cambian juntos al mover un año.
 *
 * Inspirado en el ejemplo de Brilliant que enlaza un punto de una gráfica con un vaso
 * de canicas mediante una línea punteada: acá el punto es el precio de una empanada en
 * un año dado, y el objeto es el bolsillo con la plata fija de hoy, mostrando cuántas
 * empanadas alcanza a comprar a ese precio y cuánto sobra.
 */
export default function GraficaConectada({
  precioInicial = 2500,
  inflacionAnual,
  plata = 10000,
  anios = 10,
}: GraficaConectadaProps) {
  const [anio, setAnio] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const sliderId = useId();

  const dominio = useMemo(() => dominioPrecios(precioInicial, inflacionAnual, anios), [precioInicial, inflacionAnual, anios]);

  const puntos = useMemo(
    () => puntosGrafica(precioInicial, inflacionAnual, anios),
    [precioInicial, inflacionAnual, anios]
  );

  const puntoActual = useMemo(() => puntos.find((p) => p.anio === anio) ?? puntos[0], [puntos, anio]);

  const precioActual = useMemo(
    () => precioEnAnio(precioInicial, inflacionAnual, anio),
    [precioInicial, inflacionAnual, anio]
  );

  const unidadesHoy = useMemo(() => unidadesQueAlcanzan(plata, precioInicial), [plata, precioInicial]);
  const unidadesActuales = useMemo(() => unidadesQueAlcanzan(plata, precioActual), [plata, precioActual]);
  const sobranteActual = useMemo(() => sobranteDe(plata, precioActual), [plata, precioActual]);

  // El bolsillo no cambia de tamaño al mover el año: se dibuja con el máximo histórico
  // de fichas (normalmente el de hoy, si la inflación es positiva) y las que ya no
  // alcanzan se apagan en vez de desaparecer.
  const maxUnidades = useMemo(
    () => Math.max(...puntos.map((p) => unidadesQueAlcanzan(plata, p.precio)), 1),
    [puntos, plata]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAnio(Number(e.target.value));
  }, []);

  const etiquetaAnio = anio === 0 ? 'Hoy' : `En ${anio} ${pluralizar(anio, 'año', 'años')}`;

  const frase =
    anio === 0
      ? `Con ${formatCOP(plata)} hoy compras ${unidadesHoy} ${pluralizar(unidadesHoy, 'empanada', 'empanadas')}.`
      : `Con ${formatCOP(plata)} hoy compras ${unidadesHoy} ${pluralizar(unidadesHoy, 'empanada', 'empanadas')}; en ${anio} ${pluralizar(anio, 'año', 'años')}, ${unidadesActuales}.`;

  // Dónde cae, en % de la altura de la fila, la guía horizontal punteada que sigue
  // hacia el bolsillo (ver `.gc__conector-linea` en graficaConectada.css). La fila mide
  // lo mismo que la gráfica, así que este % coincide con el % del viewBox.
  const conectorTopPct = (puntoActual.y / SVG_HEIGHT) * 100;

  return (
    <div className="gc">
      <label htmlFor={sliderId} className="gc__year-label">
        {etiquetaAnio}
      </label>

      <div className="gc__vistas">
        <div className="gc-grafica-wrap">
          <Grafica puntos={puntos} ticks={dominio.ticks} anioSeleccionado={anio} reducedMotion={reducedMotion} />

          {/* La manija: un <input type="range"> nativo, overlaid exactamente sobre el
              área de datos del eje X, así su thumb queda siempre en el mismo x que el
              punto resaltado. Sigue siendo un input real: teclado y lector de pantalla
              funcionan igual que cualquier slider. */}
          <input
            id={sliderId}
            className="gc__slider"
            style={{ left: `${SLIDER_LEFT_PCT}%`, width: `${SLIDER_WIDTH_PCT}%`, top: `${SLIDER_TOP_PCT}%` }}
            type="range"
            min={0}
            max={anios}
            step={1}
            value={anio}
            onChange={handleChange}
            aria-label="Años desde hoy"
            aria-valuemin={0}
            aria-valuemax={anios}
            aria-valuenow={anio}
            aria-valuetext={etiquetaAnio}
          />
        </div>

        {/* Conector visible solo en pantallas anchas (ver CSS): el tramo de línea
            punteada entre la gráfica y el bolsillo, a la altura del punto activo. En
            angosto la guía de la propia gráfica ya termina en su borde derecho. */}
        <div className="gc__conector" aria-hidden="true">
          <div className="gc__conector-linea" style={{ top: `${conectorTopPct}%` }} />
        </div>

        <Bolsillo plata={plata} unidades={unidadesActuales} maxUnidades={maxUnidades} sobrante={sobranteActual} reducedMotion={reducedMotion} />
      </div>

      {/* Región viva: la frase completa, visible para todos y anunciada de nuevo cada
          vez que cambia el año para quien usa lector de pantalla y no ve la gráfica ni
          el bolsillo. */}
      <p className="gc__frase" role="status" aria-live="polite">
        {frase}
      </p>
    </div>
  );
}
