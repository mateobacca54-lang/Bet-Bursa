'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import NumberFlow from '@number-flow/react';
import { Marca, Objeto } from '@/components/illus';
import { DURATION, DRAW_PATH_DURATION, EASE_OUT_EXPO, EASE_OUT_QUART, staggerDelay } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { pasoVisual } from '@/lib/leccion-pasos';

// ============================================================
// EjemploVisual — el dibujo que acompaña al párrafo de "Un ejemplo de tu día".
//
// DESIGN.md §8, paso 4: "el esquema se arma paso a paso". Cada lección con esquema
// (1-3 por ahora) entra en `step` etapas: cada toque en "Seguir" revela una más (filas
// que se escalonan, flechas que se dibujan con pathLength, marcas que aparecen con un
// pop). Antes de su etapa, cada pieza no existe en el DOM: nada de opacity:0 en reposo.
//
// Decorativo: el párrafo de al lado dice lo mismo, por eso todo va con aria-hidden.
// Las cifras que aparecen salen del texto de la propia lección, nunca se inventan.
// ============================================================

const fila: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-3)' };

function useEntrada(etapa: number, actual: number, reduced: boolean, index = 0) {
  const visible = actual >= etapa;
  return {
    visible,
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: visible ? (reduced ? { opacity: 1 } : { opacity: 1, y: 0 }) : (reduced ? { opacity: 0 } : { opacity: 0, y: 12 }),
    transition: reduced
      ? { duration: 0.1 }
      : { duration: DURATION.scene, ease: EASE_OUT_EXPO, delay: staggerDelay(index) },
  };
}

function Flecha({ dibujar }: { dibujar: boolean }) {
  const reduced = usePrefersReducedMotion();
  return (
    <svg width="44" height="20" viewBox="0 0 44 20" aria-hidden="true" style={{ flexShrink: 0 }}>
      <motion.path
        d="M3 10h34M29 3l8 7-8 7"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: dibujar ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : DRAW_PATH_DURATION, ease: EASE_OUT_EXPO }}
      />
    </svg>
  );
}

/** Un check o una equis que aparece con un pop (transform + opacity, DESIGN.md §7). */
function MarcaPop({ tipo, visible }: { tipo: 'si' | 'no'; visible: boolean }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.span
      style={{ display: 'inline-flex' }}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.5 }}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduced ? 1 : 0.5 }}
      transition={{
        duration: reduced ? 0.1 : DURATION.element,
        ease: EASE_OUT_QUART,
        delay: visible && !reduced ? DRAW_PATH_DURATION * 0.7 : 0,
      }}
    >
      <Marca tipo={tipo} />
    </motion.span>
  );
}

/** Etiqueta de precio colgando de un objeto. La cifra rueda con NumberFlow al aparecer. */
function Precio({ valor, sub, visible }: { valor: number; sub?: string; visible: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-1) var(--space-3)',
        background: 'var(--surface-raised)',
        border: '2px solid var(--ink)',
        borderRadius: 'var(--radius-md)',
        fontWeight: 'var(--font-weight-bold)',
        fontSize: 'var(--font-size-lg)',
        lineHeight: 'var(--line-height-tight)',
        color: 'var(--ink)',
      }}
    >
      <NumberFlow value={visible ? valor : 0} prefix="$" locales="es-CO" />
      {sub && <small style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--ink-secondary)' }}>{sub}</small>}
    </span>
  );
}

function Columna({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>{children}</div>;
}

/** Fila que se escalona: entra desde abajo con fadeUp cuando le toca su etapa. */
interface FilaEtapaProps {
  /** Etapa (1-based) en la que esta fila aparece. */
  etapa: number;
  actual: number;
  index: number;
  /** 'li' cuando la fila vive dentro de una lista (la leyenda de EsquemaCrecimiento). */
  as?: 'div' | 'li';
  children: ReactNode;
}

function FilaEtapa({ etapa, actual, index, as = 'div', children }: FilaEtapaProps) {
  const reduced = usePrefersReducedMotion();
  const entrada = useEntrada(etapa, actual, reduced, index);
  const Tag = as === 'li' ? motion.li : motion.div;
  return (
    <Tag style={fila} initial={entrada.initial} animate={entrada.animate} transition={entrada.transition}>
      {children}
    </Tag>
  );
}

// ─── Los tres esquemas con contenido hoy (leccion-pasos.ts § totalPasosEjemploVisual) ───

/** L1 · el trueque no alcanza; el billete sí. Etapa 1: fila del trueque. Etapa 2: fila del billete. */
function EsquemaTrueque({ paso }: { paso: number }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <FilaEtapa etapa={1} actual={paso} index={0}>
        <Objeto id="bici" size={72} />
        <Flecha dibujar={paso >= 1} />
        <Objeto id="almuerzo" size={72} />
        <MarcaPop tipo="no" visible={paso >= 1} />
      </FilaEtapa>
      <FilaEtapa etapa={2} actual={paso} index={1}>
        <Objeto id="billete" size={72} />
        <Flecha dibujar={paso >= 2} />
        <Objeto id="almuerzo" size={72} />
        <MarcaPop tipo="si" visible={paso >= 2} />
      </FilaEtapa>
    </div>
  );
}

/** L2 · el mismo almuerzo, otro precio. Etapa 1: columna de antes. Etapa 2: flecha + columna de hoy. */
function EsquemaPrecio({ paso }: { paso: number }) {
  const reduced = usePrefersReducedMotion();
  const col2 = useEntrada(2, paso, reduced, 1);
  return (
    <div style={{ ...fila, gap: 'var(--space-4)' }}>
      <FilaEtapa etapa={1} actual={paso} index={0}>
        <Columna>
          <Objeto id="almuerzo" size={88} />
          <Precio valor={8000} sub="2015" visible={paso >= 1} />
        </Columna>
      </FilaEtapa>
      <motion.div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }} initial={col2.initial} animate={col2.animate} transition={col2.transition}>
        <Flecha dibujar={paso >= 2} />
        <Columna>
          <Objeto id="almuerzo" size={88} />
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              padding: 'var(--space-1) var(--space-3)',
              background: 'var(--brand-50)',
              border: '2px solid var(--brand-600)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--brand-700)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--font-size-lg)',
            }}
          >
            ▲
          </span>
        </Columna>
      </motion.div>
    </div>
  );
}

/** L3 · la recta y la curva que se despega. Etapa 1: interés simple (raya). Etapa 2: interés compuesto (curva). */
function EsquemaCrecimiento({ paso }: { paso: number }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div style={{ ...fila, gap: 'var(--space-4)' }}>
      <svg width="112" height="112" viewBox="0 0 96 96" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M14 12v70h72" fill="none" stroke="var(--ink)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <motion.path
          d="M22 70L80 42"
          fill="none"
          stroke="var(--ink)"
          strokeWidth={3}
          strokeDasharray="6 7"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: paso >= 1 ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : DRAW_PATH_DURATION, ease: EASE_OUT_EXPO }}
        />
        <motion.path
          d="M22 70Q54 66 80 16"
          fill="none"
          stroke="var(--brand-600)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: paso >= 2 ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : DRAW_PATH_DURATION, ease: EASE_OUT_EXPO, delay: reduced ? 0 : 0.15 }}
        />
        <motion.circle
          cx={22}
          cy={70}
          r={7}
          fill="var(--gold-300)"
          stroke="var(--ink)"
          strokeWidth={3}
          initial={{ opacity: 0, scale: reduced ? 1 : 0.5 }}
          animate={paso >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduced ? 1 : 0.5 }}
          transition={{ duration: reduced ? 0.1 : DURATION.element, ease: EASE_OUT_QUART }}
        />
        <motion.circle
          cx={80}
          cy={16}
          r={6}
          fill="var(--brand-600)"
          stroke="var(--ink)"
          strokeWidth={3}
          initial={{ opacity: 0, scale: reduced ? 1 : 0.5 }}
          animate={paso >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduced ? 1 : 0.5 }}
          transition={{ duration: reduced ? 0.1 : DURATION.element, ease: EASE_OUT_QUART, delay: reduced ? 0 : 0.15 }}
        />
      </svg>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--ink-secondary)' }}>
        <FilaEtapa as="li" etapa={1} actual={paso} index={0}>
          <span aria-hidden="true" style={{ width: 20, borderTop: '3px dashed var(--ink)' }} />
          Interés simple
        </FilaEtapa>
        <FilaEtapa as="li" etapa={2} actual={paso} index={1}>
          <span aria-hidden="true" style={{ width: 20, borderTop: '4px solid var(--brand-600)' }} />
          Interés compuesto
        </FilaEtapa>
      </ul>
    </div>
  );
}

const ESQUEMAS: Record<number, (paso: number) => ReactNode> = {
  1: (paso) => <EsquemaTrueque paso={paso} />,
  2: (paso) => <EsquemaPrecio paso={paso} />,
  3: (paso) => <EsquemaCrecimiento paso={paso} />,
};

interface EjemploVisualProps {
  lesson: number;
  /** Cuántas etapas ya se revelaron (1-based). Lo controla el reproductor con el mismo
   * gesto de "Seguir" que revela las frases del párrafo (DESIGN.md §8). */
  step: number;
}

/** El esquema de la lección, o null si esa lección aún no tiene uno. */
export default function EjemploVisual({ lesson, step }: EjemploVisualProps) {
  const Esquema = ESQUEMAS[lesson];
  if (!Esquema) return null;
  const paso = pasoVisual(step, lesson);
  return (
    <div
      aria-hidden="true"
      style={{
        // Bloque hundido a todo lo ancho, con el esquema al centro (DESIGN.md §4): pegado a la
        // izquierda dejaba media pantalla vacía y se leía como una imagen suelta.
        display: 'flex',
        justifyContent: 'center',
        marginTop: 'var(--space-8)',
        padding: 'var(--space-8) var(--space-6)',
        background: 'var(--paper-sunk)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {Esquema(paso)}
    </div>
  );
}
