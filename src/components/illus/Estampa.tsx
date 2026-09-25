import type { CSSProperties } from 'react';
import './estampa.css';
import { Presupuesto, Banco, Birrete, Semilla } from './EstampasExtra';

// ============================================================
// Estampa — el sistema de ilustración de Bursa.
//
// POR QUÉ EXISTE: la landing usaba fotos de archivo de Wall Street, la bolsa de Madrid y
// billetes de dólar. Contradecían la única promesa clara del producto ("ejemplos en pesos"),
// le hablaban a un público que no es el nuestro, y no compartían nada con Monedita.
//
// REGLAS DEL SISTEMA (romperlas es lo que hace que un set de ilustraciones se vea comprado):
//   1. Contorno de 4 px en `--ink`, uniones y puntas redondas. Es el trazo de Monedita.
//   2. Máximo TRES rellenos por escena, todos de tokens.css. Sin degradados ni sombras.
//   3. Un objeto protagonista, grande. Estas estampas se ven a ~260 px: el detalle se pierde.
//   4. Objetos de la vida en Colombia (la empanada, la alcancía), no símbolos de finanzas.
//   5. Lienzo 4:3 (320×240) para todas, así el conjunto se lee como un sistema.
//
// Son decorativas: el texto siempre va en el pie de la tarjeta, nunca dentro del dibujo.
// Por eso el <svg> lleva aria-hidden y ningún dato aquí pretende ser real.
// ============================================================

const INK = 'var(--ink)';

/** Trazo común: el contorno grueso y redondeado que comparten todas las estampas. */
const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const thin = { ...line, strokeWidth: 3 };

// Raster solo para escenas decorativas. Símbolos y datos siguen siendo SVG/HTML.
const GENERATED: Partial<Record<EstampaScene, string>> = {
  empanada: '/illustrations/empanada-v2.webp',
  presupuesto: '/illustrations/presupuesto-v2.webp',
  alcancia: '/illustrations/alcancia-v2.webp',
};

export type EstampaScene =
  | 'billete'
  | 'empanada'
  | 'monedas'
  | 'alcancia'
  | 'tarjeta'
  | 'porcentaje'
  | 'plaza'
  | 'tienda'
  | 'pantalla'
  | 'presupuesto'
  | 'banco'
  | 'birrete'
  | 'semilla';

/** Billete de pesos: el objeto base del sistema. Se reutiliza en varias escenas. */
function Billete({ x = 0, y = 0, rotate = 0 }: { x?: number; y?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate} 100 62)`}>
      <rect x={8} y={8} width={184} height={108} rx={12} fill="var(--brand-200)" {...line} />
      <rect x={22} y={22} width={156} height={80} rx={6} fill="none" {...thin} />
      <circle cx={62} cy={62} r={22} fill="var(--sand-100)" {...line} />
      {/* el «$» va como texto: un trazo dibujado a mano a este tamaño sale deforme */}
      <text x={62} y={75} textAnchor="middle" fill={INK} style={{ font: '700 32px var(--font-family)' }}>
        $
      </text>
      <path d="M116 52h46M116 66h46M116 80h28" {...thin} />
    </g>
  );
}

/** 1 · ¿Qué es el dinero? — el billete y dos flechas que dicen que circula: pasa de mano en mano. */
function Dinero() {
  return (
    <g>
      {/* El billete va más chico y al centro para que los dos arcos lo RODEEN sin tocarlo:
          el de arriba va, el de abajo vuelve. Cada punta queda a la vista, fuera del billete. */}
      <path d="M46 124C48 34 272 34 274 124" fill="none" {...line} strokeDasharray="10 12" />
      <path d="M260 110l14 16 14-16" fill="none" {...line} />
      <path d="M274 136C272 226 48 226 46 136" fill="none" {...line} strokeDasharray="10 12" />
      <path d="M32 150l14-16 14 16" fill="none" {...line} />
      <g transform="translate(82 72) scale(0.78)">
        <Billete rotate={-3} />
      </g>
    </g>
  );
}

/** 2 · ¿Por qué tu plata vale menos? — la empanada y la etiqueta con el precio de antes tachado. */
function Empanada() {
  return (
    <g>
      {/* la empanada: media luna de pie, con el repulgue sobre el lomo */}
      <path d="M28 196a80 80 0 0 1 160 0z" fill="var(--gold-300)" {...line} />
      <path d="M44 196a64 64 0 0 1 128 0" fill="none" {...thin} strokeDasharray="7 9" />
      {/* los dos precios, en la etiqueta: el de antes tachado y el de hoy */}
      <path d="M200 44v18" fill="none" {...thin} />
      <g transform="rotate(6 242 116)">
        <rect x={186} y={62} width={112} height={108} rx={12} fill="var(--surface-raised)" {...line} />
        <circle cx={202} cy={80} r={5} fill={INK} />
        <text x={242} y={112} textAnchor="middle" fill={INK} style={{ font: '700 22px var(--font-family)' }}>
          $1.500
        </text>
        <path d="M202 104h80" {...thin} stroke="var(--brand-600)" />
        <text x={242} y={150} textAnchor="middle" fill={INK} style={{ font: '700 30px var(--font-family)' }}>
          $3.500
        </text>
      </g>
    </g>
  );
}

/** 3 · Interés simple vs. compuesto — tres pilas que no crecen parejo: la curva se ve sola. */
function Monedas() {
  const stacks = [
    { x: 66, n: 2 },
    { x: 160, n: 4 },
    { x: 254, n: 7 },
  ];
  return (
    <g>
      <path d="M66 126q84 6 188-76" fill="none" {...line} stroke="var(--brand-600)" strokeDasharray="8 10" />
      {stacks.map(({ x, n }) =>
        Array.from({ length: n }, (_, i) => (
          <ellipse
            key={`${x}-${i}`}
            cx={x}
            cy={196 - i * 17}
            rx={36}
            ry={12}
            fill={i === n - 1 ? 'var(--gold-300)' : 'var(--gold-500)'}
            {...line}
          />
        ))
      )}
    </g>
  );
}

/** 4 · Ahorrar ≠ invertir — la alcancía guarda; la matera crece. El signo ≠ hace el resto. */
function Alcancia() {
  return (
    <g transform="translate(-8 0)">
      {/* alcancía */}
      <g>
        <ellipse cx={82} cy={150} rx={54} ry={42} fill="var(--brand-200)" {...line} />
        {/* la oreja, caída sobre la frente */}
        <path d="M104 116q4-26 24-24 2 20-10 28z" fill="var(--brand-300)" {...line} />
        {/* la ranura de las monedas, en el lomo */}
        <path d="M56 124l30-10" {...line} strokeWidth={8} />
        <ellipse cx={128} cy={156} rx={15} ry={12} fill="var(--brand-300)" {...line} />
        <circle cx={131} cy={154} r={2.5} fill={INK} />
        <circle cx={104} cy={140} r={4} fill={INK} />
        <path d="M58 188v12M104 188v12" {...line} />
      </g>
      {/* ≠ */}
      <path d="M178 126h30M178 148h30M206 114l-26 46" {...line} />
      {/* matera con brote */}
      <path d="M240 152h68l-8 46h-52z" fill="var(--sand-200)" {...line} />
      <path d="M274 152V96" fill="none" {...line} />
      <path d="M274 116c-22 0-30-14-30-14s16-8 26 2 4 12 4 12z" fill="var(--gold-300)" {...line} />
      <path d="M274 100c18-4 24-18 24-18s-14-8-24 2-4 16 0 16z" fill="var(--gold-300)" {...line} />
    </g>
  );
}

/** 5 · Deuda buena vs. deuda mala — la misma tarjeta, dos caminos. */
function Tarjeta() {
  return (
    <g>
      <rect x={30} y={96} width={140} height={90} rx={12} fill="var(--surface-raised)" {...line} />
      <rect x={30} y={116} width={140} height={18} fill={INK} />
      <path d="M46 156h30M92 156h16" {...thin} />
      {/* camino que sube */}
      <path d="M182 128q40-2 60-48" fill="none" {...line} stroke="var(--brand-600)" />
      <path d="M232 68l12 14-18 6" fill="none" {...line} stroke="var(--brand-600)" />
      {/* camino que baja */}
      <path d="M182 154q40 2 60 48" fill="none" {...line} strokeDasharray="8 10" />
      <path d="M232 214l12-14-18-6" fill="none" {...line} />
    </g>
  );
}

/** 7 · ¿Qué es una tasa de interés? — el porcentaje como protagonista, dentro del billete y girado con él. */
function Porcentaje() {
  return (
    <g transform="translate(52 78) rotate(-5 108 84)">
      <rect x={0} y={0} width={216} height={132} rx={14} fill="var(--brand-200)" {...line} />
      <rect x={14} y={14} width={188} height={104} rx={8} fill="none" {...thin} />
      {/* el «%» va como texto (dibujado a mano no se lee) y cabe DENTRO del marco interior:
          84 px de alto de fuente ≈ 60 px de glifo, sobre un marco de 104 */}
      <text x={108} y={94} textAnchor="middle" fill={INK} style={{ font: '700 84px var(--font-family)' }}>
        %
      </text>
    </g>
  );
}

/** Plaza de mercado: el primer mercado que cualquiera pisó. */
function Plaza() {
  return (
    <g>
      {/* el toldo, con su borde ondeado */}
      <rect x={44} y={56} width={232} height={30} rx={6} fill="var(--brand-200)" {...line} />
      <path
        d="M44 86q14 20 29 0 14 20 29 0 14 20 29 0 14 20 29 0 14 20 29 0 14 20 29 0 14 20 29 0"
        fill="var(--brand-200)"
        {...line}
      />
      {/* los parales */}
      <path d="M56 106v100M264 106v100" {...line} />
      {/* el cajón y la fruta encima */}
      <rect x={82} y={150} width={156} height={56} rx={8} fill="var(--sand-200)" {...line} />
      <path d="M122 150v56M198 150v56" {...thin} />
      <circle cx={112} cy={132} r={18} fill="var(--gold-300)" {...line} />
      <circle cx={158} cy={128} r={22} fill="var(--gold-300)" {...line} />
      <circle cx={206} cy={132} r={18} fill="var(--gold-300)" {...line} />
    </g>
  );
}

/** Tienda de barrio: el mostrador donde de verdad se negocia el precio. */
function Tienda() {
  return (
    <g>
      <rect x={48} y={72} width={224} height={40} rx={8} fill="var(--brand-200)" {...line} />
      <rect x={48} y={112} width={224} height={96} rx={8} fill="var(--sand-200)" {...line} />
      <path d="M48 104q28 24 56 0 28 24 56 0 28 24 56 0 28 24 56 0" fill="var(--brand-200)" {...line} />
      <path d="M64 200h192" fill="none" {...line} />
      <rect x={96} y={136} width={48} height={22} rx={5} fill="var(--surface-raised)" {...line} />
      <rect x={176} y={136} width={48} height={22} rx={5} fill="var(--surface-raised)" {...line} />
      <rect x={96} y={172} width={48} height={22} rx={5} fill="var(--gold-300)" {...line} />
      <rect x={176} y={172} width={48} height={22} rx={5} fill="var(--gold-300)" {...line} />
    </g>
  );
}

/** El mismo mercado, en el bolsillo. */
function Pantalla() {
  return (
    <g>
      <rect x={98} y={44} width={124} height={172} rx={18} fill="var(--surface-raised)" {...line} />
      <path d="M144 60h32" {...line} />
      <path d="M118 176l26-32 22 18 38-56" fill="none" {...line} stroke="var(--brand-600)" strokeWidth={6} />
      <circle cx={204} cy={106} r={7} fill="var(--brand-600)" {...thin} />
      <path d="M118 196h84" {...thin} />
    </g>
  );
}

const SCENES: Record<EstampaScene, () => React.ReactElement> = {
  billete: Dinero,
  empanada: Empanada,
  monedas: Monedas,
  alcancia: Alcancia,
  tarjeta: Tarjeta,
  porcentaje: Porcentaje,
  plaza: Plaza,
  tienda: Tienda,
  pantalla: Pantalla,
  presupuesto: Presupuesto,
  banco: Banco,
  birrete: Birrete,
  semilla: Semilla,
};

interface EstampaProps {
  scene: EstampaScene;
  className?: string;
  style?: CSSProperties;
}

/**
 * Estampa — una escena ilustrada de Bursa, en lienzo 4:3.
 *
 * Decorativa por definición: el significado siempre lo carga el texto que la acompaña,
 * así que va con aria-hidden y nunca lleva texto que haga falta leer.
 */
export default function Estampa({ scene, className, style }: EstampaProps) {
  const Scene = SCENES[scene];
  const illustration = GENERATED[scene];
  return (
    <svg
      viewBox="0 0 320 240"
      className={`estampa${className ? ` ${className}` : ''}`}
      style={style}
      data-escena={scene}
      aria-hidden="true"
      focusable="false"
    >
      {illustration ? (
        <g>
          <image href={illustration} x={0} y={0} width={320} height={240} preserveAspectRatio="xMidYMid meet" />
          {scene === 'alcancia' && (
            <path d="M151 127h26M151 147h26M175 115l-22 44" fill="none" {...line} />
          )}
        </g>
      ) : <Scene />}
    </svg>
  );
}
