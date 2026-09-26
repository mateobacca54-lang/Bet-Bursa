import type { CSSProperties } from 'react';
import Image from 'next/image';

// ============================================================
// Objetos — los dibujitos chicos de Bursa: las cosas de las que hablan las prácticas.
//
// Mismo trazo que las estampas (contorno de 4 px en --ink, máximo tres rellenos de tokens,
// sin degradados ni sombras), pero en un lienzo CUADRADO de 96 × 96 y sin fondo: se usan a
// 32–72 px dentro de una tarjeta, una ficha o al lado de un texto. A ese tamaño el detalle
// se pierde, así que cada objeto es UNA silueta reconocible y nada más.
//
// Son decorativos: el texto de al lado siempre dice lo mismo que el dibujo, así que van
// con aria-hidden. Nada aquí pretende ser un dato real.
// ============================================================

const INK = 'var(--ink)';
const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const thin = { ...line, strokeWidth: 3 };

export type ObjetoId =
  | 'bici'
  | 'bus'
  | 'cromos'
  | 'profesor'
  | 'empanada'
  | 'casa'
  | 'almuerzo'
  | 'billete'
  | 'crecimiento';

export const OBJETOS: readonly ObjetoId[] = [
  'bici',
  'bus',
  'cromos',
  'profesor',
  'empanada',
  'casa',
  'almuerzo',
  'billete',
  'crecimiento',
];

export const esObjeto = (id: string | undefined): id is ObjetoId => !!id && (OBJETOS as readonly string[]).includes(id);

const DIBUJOS: Record<Exclude<ObjetoId, 'almuerzo'>, () => React.ReactElement> = {
  // Cambiar tu bici por el celular de un amigo
  bici: () => (
    <g>
      <circle cx={24} cy={62} r={17} fill="var(--sand-200)" {...line} />
      <circle cx={72} cy={62} r={17} fill="var(--sand-200)" {...line} />
      <path d="M24 62L38 36H62L72 62M38 36L50 62H24M50 62L62 36" fill="none" {...line} />
      <path d="M30 30h14" fill="none" {...line} strokeWidth={5} stroke="var(--brand-600)" />
      <path d="M62 36l-4-10h12" fill="none" {...line} strokeWidth={5} stroke="var(--brand-600)" />
      <circle cx={50} cy={62} r={4} fill="var(--brand-200)" {...thin} />
    </g>
  ),

  // Pagar el bus para ir al colegio
  bus: () => (
    <g>
      <rect x={10} y={18} width={76} height={52} rx={10} fill="var(--brand-200)" {...line} />
      <rect x={18} y={28} width={16} height={16} rx={3} fill="var(--surface-raised)" {...thin} />
      <rect x={40} y={28} width={16} height={16} rx={3} fill="var(--surface-raised)" {...thin} />
      <rect x={62} y={28} width={16} height={16} rx={3} fill="var(--surface-raised)" {...thin} />
      <path d="M10 54h76" fill="none" {...thin} />
      <circle cx={30} cy={72} r={9} fill="var(--sand-200)" {...line} />
      <circle cx={66} cy={72} r={9} fill="var(--sand-200)" {...line} />
    </g>
  ),

  // Cambiar cromos repetidos con una compañera
  cromos: () => (
    <g>
      <g transform="rotate(-12 34 52)">
        <rect x={12} y={22} width={38} height={54} rx={5} fill="var(--brand-200)" {...line} />
        <circle cx={31} cy={44} r={9} fill="var(--surface-raised)" {...thin} />
        <path d="M20 62h22" fill="none" {...thin} />
      </g>
      <g transform="rotate(10 64 46)">
        <rect x={44} y={16} width={38} height={54} rx={5} fill="var(--gold-300)" {...line} />
        <polygon
          points="63,27 67,37 78,38 70,45 72,56 63,50 54,56 56,45 48,38 59,37"
          fill="var(--surface-raised)"
          {...thin}
        />
      </g>
    </g>
  ),

  // Pagarle a tu profesor particular de inglés
  profesor: () => (
    <g>
      <rect x={10} y={14} width={76} height={48} rx={6} fill={INK} {...line} />
      <rect x={15} y={19} width={66} height={38} rx={3} fill="none" stroke="var(--brand-200)" strokeWidth={3} />
      <text x={48} y={47} textAnchor="middle" fill="var(--surface-raised)" style={{ font: '700 24px var(--font-family)' }}>
        ABC
      </text>
      <path d="M30 62v22M66 62v22M20 62h56" fill="none" {...line} />
    </g>
  ),

  // Cambiar tu empanada por la arepa de un compañero
  empanada: () => (
    <g>
      <ellipse cx={48} cy={72} rx={40} ry={9} fill="var(--surface-raised)" {...line} />
      <path d="M14 68a34 34 0 0 1 68 0z" fill="var(--gold-300)" {...line} />
      <path d="M22 68a26 26 0 0 1 52 0" fill="none" {...thin} strokeDasharray="5 7" />
    </g>
  ),

  // Pagar el arriendo
  casa: () => (
    <g>
      <rect x={66} y={18} width={9} height={18} fill="var(--sand-200)" {...line} />
      <path d="M8 48L48 14l40 34z" fill="var(--brand-200)" {...line} />
      <rect x={16} y={48} width={64} height={36} fill="var(--sand-200)" {...line} />
      <rect x={42} y={60} width={14} height={24} fill="var(--brand-200)" {...line} />
      <rect x={22} y={56} width={13} height={13} fill="var(--surface-raised)" {...thin} />
      <rect x={62} y={56} width={13} height={13} fill="var(--surface-raised)" {...thin} />
    </g>
  ),

  // El billete con el que se paga
  billete: () => (
    <g>
      <rect x={8} y={26} width={80} height={46} rx={7} fill="var(--brand-200)" {...line} />
      <rect x={15} y={33} width={66} height={32} rx={4} fill="none" {...thin} />
      <circle cx={32} cy={49} r={10} fill="var(--sand-100)" {...thin} />
      <text x={32} y={55} textAnchor="middle" fill={INK} style={{ font: '700 15px var(--font-family)' }}>
        $
      </text>
      <path d="M50 43h24M50 50h24M50 57h14" fill="none" {...thin} />
    </g>
  ),

  // Interés simple (recta) frente a interés compuesto (curva que se despega)
  crecimiento: () => (
    <g>
      <path d="M14 12v70h72" fill="none" {...thin} />
      <path d="M22 70L80 42" fill="none" {...thin} strokeDasharray="6 7" />
      <path d="M22 70Q54 66 80 16" fill="none" {...line} stroke="var(--brand-600)" />
      <circle cx={80} cy={16} r={6} fill="var(--brand-600)" {...thin} />
      <circle cx={22} cy={70} r={7} fill="var(--gold-300)" {...thin} />
    </g>
  ),
};

interface ObjetoProps {
  id: ObjetoId;
  /** Lado en px. Por defecto 56 */
  size?: number;
  className?: string;
  style?: CSSProperties;
}

// Objetos que ya tienen imagen generada en public/objetos/: se muestran como imagen, no dibujados.
const IMAGENES: Record<'almuerzo', string> = {
  almuerzo: '/objetos/almuerzo.webp',
};

/** Un dibujito cuadrado y sin fondo, para acompañar un texto. Decorativo (aria-hidden). */
export default function Objeto({ id, size = 56, className, style }: ObjetoProps) {
  if (id === 'almuerzo') {
    const imagen = IMAGENES[id];
    return (
      <Image
        src={imagen}
        alt=""
        width={size}
        height={size}
        className={`objeto${className ? ` ${className}` : ''}`}
        data-objeto={id}
        style={{ display: 'block', flexShrink: 0, ...style }}
        aria-hidden="true"
        draggable={false}
      />
    );
  }
  const Dibujo = DIBUJOS[id];
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={`objeto${className ? ` ${className}` : ''}`}
      data-objeto={id}
      style={{ display: 'block', flexShrink: 0, ...style }}
      aria-hidden="true"
      focusable="false"
    >
      <Dibujo />
    </svg>
  );
}

/**
 * Pila — una torre de monedas con `count` monedas. Sirve para que un número se VEA: dos pilas
 * lado a lado (interés simple y compuesto) hacen visible la diferencia sin leer una cifra.
 * Todas las pilas comparten la misma escala, así que su altura es comparable de una a otra.
 */
export function Pila({ count, scale = 1.5, className }: { count: number; scale?: number; className?: string }) {
  const n = Math.max(1, Math.round(count));
  const STEP = 9;
  const H = n * STEP + 26;
  return (
    <svg
      viewBox={`0 0 64 ${H}`}
      width={64 * scale}
      height={H * scale}
      className={className}
      data-pila={n}
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {Array.from({ length: n }, (_, i) => (
        <ellipse
          key={i}
          cx={32}
          cy={H - 14 - i * STEP}
          rx={26}
          ry={9}
          fill={i === n - 1 ? 'var(--gold-300)' : 'var(--gold-500)'}
          {...thin}
        />
      ))}
    </svg>
  );
}

/** Marca de "sí" (✓) o "no" (✗) para los dibujos de ejemplo: una decisión, no un adorno. */
export function Marca({ tipo, size = 32 }: { tipo: 'si' | 'no'; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx={16} cy={16} r={13} fill={tipo === 'si' ? 'var(--gold-300)' : 'var(--sand-200)'} {...thin} />
      {tipo === 'si' ? (
        <path d="M9 17l5 5 10-11" fill="none" {...line} />
      ) : (
        <path d="M10 10l12 12M22 10L10 22" fill="none" {...line} />
      )}
    </svg>
  );
}
