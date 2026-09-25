'use client';

import { motion } from 'framer-motion';
import { formatCOP } from '@/lib/format';
import { GEOMETRIA_DEFAULT, escalaY, type PuntoGrafica } from '@/lib/graficaConectada';
import { SPRING_SOFT } from '@/lib/motion';

interface GraficaProps {
  /** Serie completa, año 0..anios, ya escalada al viewBox. */
  puntos: PuntoGrafica[];
  /** Tiquetes "lindos" del eje de precios (ver `dominioPrecios` en la librería). */
  ticks: number[];
  /** Año que el usuario tiene seleccionado ahora mismo. */
  anioSeleccionado: number;
  /** Si el usuario pidió menos movimiento. */
  reducedMotion: boolean;
}

export const { width: SVG_WIDTH, height: SVG_HEIGHT, padding: PADDING } = GEOMETRIA_DEFAULT;
/** Y del eje X (la base del área de la gráfica): ahí vive la manija del slider. */
export const EJE_X_Y = SVG_HEIGHT - PADDING.bottom;

/**
 * Grafica — la vista izquierda de GraficaConectada: precio de la empanada por año, con
 * ejes reales (como el ejemplo de canicas de Brilliant): una rejilla de precios a la
 * izquierda y los años abajo.
 *
 * Del punto activo salen DOS guías punteadas: una vertical hacia el eje X (donde vive
 * la manija del slider) y una horizontal hacia la derecha, hasta el borde de la
 * gráfica — el bolsillo, fuera de este componente, la sigue visualmente en pantallas
 * anchas (ver `.gc__conector` en GraficaConectada).
 *
 * Solo se anima `transform` (la posición del punto y sus guías, vía un <motion.g>) y
 * `opacity`. Nunca cx/cy directamente: cambiar un atributo SVG no es lo mismo que animar
 * transform, y AGENTS.md solo permite transform + opacity (+ pathLength).
 */
export default function Grafica({ puntos, ticks, anioSeleccionado, reducedMotion }: GraficaProps) {
  const seleccionado = puntos.find((p) => p.anio === anioSeleccionado) ?? puntos[0];
  const linea = puntos.map((p) => `${p.x},${p.y}`).join(' ');
  const transition = reducedMotion ? { duration: 0 } : SPRING_SOFT;
  const anios = puntos.at(-1)?.anio ?? 0;
  const dominio = { min: ticks[0], max: ticks.at(-1) ?? ticks[0] };

  // Con muchos años, poner una etiqueta debajo de cada marca satura el eje: se etiqueta
  // cada `pasoEtiqueta`-ésimo año y el resto solo lleva una marca corta.
  const pasoEtiqueta = anios > 6 ? 2 : 1;

  return (
    <svg
      className="gc-grafica"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      role="img"
      aria-label={`Precio de la empanada por año, de ${formatCOP(puntos[0]?.precio ?? 0)} hoy a ${formatCOP(
        puntos.at(-1)?.precio ?? 0
      )} en ${anios} años. Año seleccionado: ${seleccionado.anio}, precio ${formatCOP(seleccionado.precio)}.`}
    >
      {/* Rejilla de precios: líneas tenues en --border, con su etiqueta a la izquierda. */}
      {ticks.map((t) => {
        const y = escalaY(t, dominio);
        return (
          <g key={t}>
            <line x1={PADDING.left} y1={y} x2={SVG_WIDTH - PADDING.right} y2={y} stroke="var(--border)" strokeWidth={1} />
            <text x={PADDING.left - 8} y={y + 4} textAnchor="end" fill="var(--ink-secondary)" fontSize={10} fontFamily="var(--font-family)">
              {formatCOP(t)}
            </text>
          </g>
        );
      })}

      {/* Eje X: la base del área de la gráfica, con una marca y (a veces) etiqueta por año. */}
      <line x1={PADDING.left} y1={EJE_X_Y} x2={SVG_WIDTH - PADDING.right} y2={EJE_X_Y} stroke="var(--border)" strokeWidth={1} />
      {puntos.map((p) => {
        const etiqueta = p.anio % pasoEtiqueta === 0 || p.anio === anios;
        return (
          <g key={p.anio}>
            <line x1={p.x} y1={EJE_X_Y} x2={p.x} y2={EJE_X_Y + 4} stroke="var(--border)" strokeWidth={1} />
            {etiqueta && (
              <text
                x={p.x}
                y={EJE_X_Y + 16}
                textAnchor="middle"
                fill="var(--ink-secondary)"
                fontSize={10}
                fontFamily="var(--font-family)"
              >
                {p.anio === 0 ? 'Hoy' : p.anio}
              </text>
            )}
          </g>
        );
      })}

      {/* La serie completa, en tinta suave: el fondo sobre el que resalta el punto activo. */}
      <polyline points={linea} fill="none" stroke="var(--ink-secondary)" strokeWidth={1.5} opacity={0.35} />
      {puntos.map((p) => (
        <circle key={p.anio} cx={p.x} cy={p.y} r={p.anio === anioSeleccionado ? 0 : 3} fill="var(--ink-secondary)" opacity={0.4} />
      ))}

      {/* Grupo animado: se traslada al punto activo. Transform, nunca cx/cy. */}
      <motion.g animate={{ x: seleccionado.x, y: seleccionado.y }} transition={transition} initial={false}>
        {/* Guía vertical hacia el eje X: ahí, en ese mismo x, vive la manija del slider. */}
        <line x1={0} y1={0} x2={0} y2={EJE_X_Y - seleccionado.y} stroke="var(--brand-600)" strokeWidth={1.5} strokeDasharray="5 5" />
        {/* Guía horizontal hacia la derecha: el hilo que sigue hacia el bolsillo. */}
        <line
          x1={0}
          y1={0}
          x2={SVG_WIDTH - PADDING.right - seleccionado.x}
          y2={0}
          stroke="var(--brand-600)"
          strokeWidth={1.5}
          strokeDasharray="5 5"
        />
        <circle r={6} fill="var(--brand-600)" stroke="var(--surface-raised)" strokeWidth={2} />
        <text y={-12} textAnchor="middle" fill="var(--brand-700)" fontSize={12} fontFamily="var(--font-family)" fontWeight={600}>
          {formatCOP(seleccionado.precio)}
        </text>
      </motion.g>
    </svg>
  );
}
