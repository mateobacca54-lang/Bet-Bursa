'use client';

import { motion } from 'framer-motion';
import { formatCOP } from '@/lib/format';
import { DURATION, EASE_OUT_QUART } from '@/lib/motion';

interface BolsilloProps {
  /** Plata fija que vive en el bolsillo, en pesos (ej. 10000). */
  plata: number;
  /** Cuántas empanadas caben hoy, al precio del año seleccionado. */
  unidades: number;
  /** Cuántas fichas de empanada dibujar en total (el máximo histórico), para que el
   * bolsillo no cambie de tamaño al mover el año: las que ya no caben se apagan, no
   * desaparecen. */
  maxUnidades: number;
  /** Cuánta plata sobra después de comprar `unidades` empanadas al precio actual. */
  sobrante: number;
  /** Si el usuario pidió menos movimiento. */
  reducedMotion: boolean;
}

/** Un token de empanada: media luna plana, mismo trazo que `illus/Objetos` (empanada). */
function Empanada() {
  return (
    <g>
      <path d="M2 15a13 13 0 0 1 26 0z" fill="var(--gold-300)" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" />
      <path d="M6 15a9 9 0 0 1 18 0" fill="none" stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="2.5 3" opacity={0.7} />
    </g>
  );
}

/**
 * Bolsillo — la vista derecha de GraficaConectada: cuántas empanadas compra hoy la
 * plata fija (`plata`), al precio del año seleccionado, y cuánto sobra.
 *
 * Ocupa toda la altura de la fila (ver `.gc-bolsillo` en graficaConectada.css) para que
 * la guía punteada horizontal de la gráfica, que se mueve en Y con el precio, siempre
 * caiga dentro de esta caja sin importar qué año esté seleccionado.
 *
 * Las empanadas que ya no alcanzan no se quitan del dibujo: bajan de opacidad. Así la
 * pérdida se ve (siguen "ahí", pero fuera de alcance) en vez de simplemente faltar.
 */
export default function Bolsillo({ plata, unidades, maxUnidades, sobrante, reducedMotion }: BolsilloProps) {
  const total = Math.max(maxUnidades, unidades, 1);
  const fichas = Array.from({ length: total }, (_, i) => i);
  const columnas = Math.min(5, total);

  return (
    <div
      className="gc-bolsillo"
      role="img"
      aria-label={`Bolsillo con ${formatCOP(plata)}: alcanza para ${unidades} empanada${
        unidades === 1 ? '' : 's'
      } y sobran ${formatCOP(sobrante)}.`}
    >
      <p className="gc-bolsillo__titulo" aria-hidden="true">
        Tu bolsillo: {formatCOP(plata)}
      </p>

      <svg
        className="gc-bolsillo__grid"
        viewBox={`0 0 ${columnas * 34} ${Math.ceil(total / columnas) * 30}`}
        aria-hidden="true"
      >
        {fichas.map((i) => {
          const col = i % columnas;
          const fila = Math.floor(i / columnas);
          const alAlcance = i < unidades;
          return (
            <motion.g
              key={i}
              transform={`translate(${col * 34 + 1}, ${fila * 30 + 2})`}
              initial={false}
              animate={{ opacity: alAlcance ? 1 : 0.25 }}
              transition={reducedMotion ? { duration: 0 } : { duration: DURATION.element, ease: EASE_OUT_QUART }}
            >
              <Empanada />
            </motion.g>
          );
        })}
      </svg>

      <p className="gc-bolsillo__sobrante" aria-hidden="true">
        {sobrante > 0 ? `y te sobran ${formatCOP(sobrante)}` : 'sin nada de vuelto'}
      </p>
    </div>
  );
}
