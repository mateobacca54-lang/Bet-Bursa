'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_IN_OUT, SPRING_SOFT } from '@/lib/motion';
import './floating-papers.css';

/** Desplazamiento máximo del parallax, en px (PLAN §4.2: tope de 12) */
const MAX_SHIFT = 12;
/** Amplitud de la deriva en reposo, en px (PLAN §4.2: ±6) */
const DRIFT = 6;

interface PaperProps {
  name: 'statement' | 'candles' | 'receipt' | 'headline';
  /** Cuánto se mueve con el cursor: 0 = nada, 1 = el máximo */
  depth: number;
  /** Inclinación en grados (PLAN §4.2: entre −6° y 6°) */
  tilt: number;
  /** Segundos que dura un ciclo de deriva (6–9) */
  period: number;
  /** Segundos de espera antes de entrar */
  delay: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  children: ReactNode;
}

const sheet: CSSProperties = {
  background: 'var(--surface-raised)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  boxShadow: 'var(--shadow-md)',
  padding: 'var(--space-3)',
  fontSize: 'var(--font-size-xs)',
  whiteSpace: 'nowrap',
  lineHeight: 'var(--line-height-normal)',
  color: 'var(--ink-secondary)',
};

const row: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' };

function Paper({ name, depth, tilt, period, delay, pointerX, pointerY, children }: PaperProps) {
  const x = useTransform(pointerX, (v) => v * MAX_SHIFT * depth);
  const y = useTransform(pointerY, (v) => v * MAX_SHIFT * depth);

  return (
    // Capa 1: parallax con el cursor. Capa 2: entrada + deriva. Se separan para que sus
    // transformaciones no se pisen.
    <motion.div className={`bursa-paper bursa-paper--${name}`} style={{ x, y }}>
      <motion.div
        initial={{ opacity: 0, rotate: tilt * 1.8 }}
        animate={{
          opacity: 1,
          rotate: tilt,
          y: [0, -DRIFT, 0],
          transition: {
            opacity: { duration: DURATION.story, delay },
            rotate: { duration: DURATION.story, delay },
            y: { duration: period, delay, ease: EASE_IN_OUT, repeat: Infinity },
          },
        }}
        whileHover={{ rotate: 0, scale: 1.02, transition: { duration: DURATION.element } }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── Los cinco papeles: información financiera de la vida cotidiana ───
// Son decorativos e ilustrativos; ninguna cifra pretende ser un dato real.

function Statement() {
  return (
    <div style={{ ...sheet, width: 196 }}>
      <div className="uppercase-tracking" style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--ink)' }}>
        Cuenta de ahorros
      </div>
      <div style={{ margin: 'var(--space-2) 0', fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--ink)' }}>
        $1.250.000
      </div>
      <div style={row}><span>Rendimientos</span><span>+ $3.120</span></div>
      <div style={row}><span>Retiro</span><span>− $80.000</span></div>
      <div style={{ ...row, borderTop: '1px dashed var(--border)', marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
        <span>Tasa E.A.</span><span style={{ color: 'var(--brand-700)', fontWeight: 'var(--font-weight-semibold)' }}>8,5 %</span>
      </div>
    </div>
  );
}

const CANDLES = [
  { o: 26, c: 46, h: 52, l: 20 }, { o: 46, c: 36, h: 50, l: 30 }, { o: 36, c: 60, h: 66, l: 32 },
  { o: 60, c: 50, h: 64, l: 44 }, { o: 50, c: 74, h: 80, l: 46 }, { o: 74, c: 64, h: 82, l: 58 },
  { o: 64, c: 90, h: 96, l: 60 },
];

function Candles() {
  const W = 172;
  const H = 100;
  const step = W / CANDLES.length;
  const y = (v: number) => H - (v / 100) * H;

  return (
    <div style={{ ...sheet, width: 196 }}>
      <div className="uppercase-tracking" style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
        Precio · 7 días
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ display: 'block' }}>
        {CANDLES.map((k, i) => {
          const cx = step * i + step / 2;
          const up = k.c >= k.o;
          const color = up ? 'var(--brand-600)' : 'var(--ink)';
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={y(k.h)} y2={y(k.l)} stroke={color} strokeWidth={2} strokeLinecap="round" />
              <rect x={cx - 8} width={16} y={y(Math.max(k.o, k.c))} height={Math.max(Math.abs(y(k.o) - y(k.c)), 3)} rx={2} fill={color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Receipt() {
  return (
    <div style={{ ...sheet, width: 148, fontVariantNumeric: 'tabular-nums' }}>
      <div className="uppercase-tracking" style={{ textAlign: 'center', fontWeight: 'var(--font-weight-semibold)', color: 'var(--ink)' }}>
        La Esquina
      </div>
      <div style={{ borderTop: '1px dashed var(--border)', margin: 'var(--space-2) 0' }} />
      <div style={row}><span>Empanada</span><span>$3.500</span></div>
      <div style={row}><span>Gaseosa</span><span>$4.500</span></div>
      <div style={{ ...row, borderTop: '1px dashed var(--border)', marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', color: 'var(--ink)', fontWeight: 'var(--font-weight-bold)' }}>
        <span>Total</span><span>$8.000</span>
      </div>
    </div>
  );
}

function Headline() {
  return (
    <div style={{ ...sheet, width: 200, whiteSpace: 'normal' }}>
      <div className="uppercase-tracking" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-700)', fontWeight: 'var(--font-weight-semibold)' }}>
        Titular del día
      </div>
      <div style={{ margin: 'var(--space-1) 0 var(--space-2)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', lineHeight: 'var(--line-height-tight)', color: 'var(--ink)' }}>
        Suben los precios del almuerzo corriente
      </div>
      <div style={{ height: 5, borderRadius: 'var(--radius-pill)', background: 'var(--border)', width: '100%' }} />
      <div style={{ height: 5, borderRadius: 'var(--radius-pill)', background: 'var(--border)', width: '70%', marginTop: 'var(--space-1)' }} />
    </div>
  );
}

/**
 * FloatingPapers — fragmentos de información financiera que flotan tras el saludo.
 *
 * Es la traducción a Bursa de las cards inclinadas del hero de Platzi: en lugar de
 * cursos, lo que ves todos los días y aún no sabes leer (un recibo, un extracto, un
 * precio). Decorativo: aria-hidden. Parallax con el cursor (tope 12 px, solo con
 * puntero fino) y deriva en reposo. Bajo prefers-reduced-motion se DESMONTA entero.
 * Debe colocarse dentro de un contenedor con position: relative.
 *
 * REGLA: un papel decorativo NUNCA tapa información. Viven solo en los huecos laterales del
 * saludo (que mide máx. 600 px), dentro de los límites del héroe, y solo se muestran si el
 * hueco los aloja con margen para inclinación, deriva y parallax (floating-papers.css).
 * Si no caben, no se muestran.
 */
export default function FloatingPapers() {
  const reduced = usePrefersReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: SPRING_SOFT.stiffness, damping: SPRING_SOFT.damping };
  const smoothX = useSpring(pointerX, spring);
  const smoothY = useSpring(pointerY, spring);

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const onMove = (e: PointerEvent) => {
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, pointerX, pointerY]);

  if (reduced) return null;

  const shared = { pointerX: smoothX, pointerY: smoothY };

  return (
    <div className="bursa-papers" aria-hidden="true">
      <Paper name="statement" depth={0.9} tilt={-5} period={7.5} delay={0.5} {...shared}><Statement /></Paper>
      <Paper name="candles" depth={1} tilt={4} period={6.5} delay={0.6} {...shared}><Candles /></Paper>
      <Paper name="receipt" depth={0.7} tilt={-6} period={8} delay={0.8} {...shared}><Receipt /></Paper>
      <Paper name="headline" depth={0.4} tilt={-3} period={8.5} delay={0.7} {...shared}><Headline /></Paper>
    </div>
  );
}
