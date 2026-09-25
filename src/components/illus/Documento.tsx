import type { CSSProperties } from 'react';

// ============================================================
// Documento — los papeles que se usan en el arquetipo "Señalar" (buscar un dato
// dentro de un documento real: M1L7 la tasa en un extracto, M1L9 la trampa de un
// crédito). Ver 03-EJERCICIOS.md "Señalar" y REGLAS.md §4.
//
// POR QUÉ ES UN SISTEMA APARTE DE ESTAMPA: una estampa es decorativa y nunca lleva
// datos dentro del dibujo (el texto va en el pie). Un documento es lo contrario:
// TIENE que llevar texto legible, porque encontrar ese texto es el ejercicio. Por
// eso Documento tiene sus propias reglas, no las de Estampa:
//
//   1. Mismo trazo que el resto del sistema: contorno de 4 px en `--ink`, uniones
//      redondas. Las líneas internas (separadores de fila) van en 2 px.
//   2. Hasta CUATRO rellenos (uno más que una estampa): fondo del papel, la banda
//      del encabezado, el resaltado de una fila y, si hace falta, un acento.
//      Todos de tokens.css.
//   3. Lienzo 400×320, siempre en filas de ancho completo — así cualquier
//      documento nuevo encaja en la misma cuadrícula y sus zonas (Señalar.tsx)
//      son siempre franjas horizontales, fáciles de definir y de tocar.
//   4. Las cifras son un EJEMPLO de práctica, igual que "$500.000" en la lección 1
//      o "$600.000" en la lección 6: no se presentan como un dato real de
//      Colombia, así que no necesitan fuente (REGLAS §1 exige fuente para cifras
//      que se afirman como verdaderas, no para escenarios de ejercicio).
//   5. Sin nombre de banco real, sin logo, sin dato de una persona real.
// ============================================================

const INK = 'var(--ink)';
const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const divisor = { stroke: 'var(--border-warm, var(--border))', strokeWidth: 2 } as const;

export type DocumentoId = 'extracto-bancario' | 'simulacion-credito';

export const DOCUMENTOS: readonly DocumentoId[] = ['extracto-bancario', 'simulacion-credito'];

const ANCHO = 400;
const ALTO = 320;
const FILA_ALTO = 44;
const FILA_Y = [60, 104, 148, 192, 236];

interface FilaProps {
  y: number;
  etiqueta: string;
  valor: string;
  /** Resalta la fila (para la oferta llamativa de la simulación de crédito) */
  destacada?: boolean;
  /** Texto más chico (para la letra pequeña) */
  chica?: boolean;
}

/**
 * Una fila del documento: etiqueta a la izquierda, valor a la derecha. La etiqueta
 * puede partirse en varias líneas con "\n" — a este ancho (352 px útiles) una frase
 * larga en letra chica NO cabe en una sola línea y quedaría cortada por el borde.
 */
function Fila({ y, etiqueta, valor, destacada, chica }: FilaProps) {
  const lineas = etiqueta.split('\n');
  const altoLinea = chica ? 15 : 20;
  // Con una sola línea, centrada verticalmente; con varias, arranca más arriba
  // para que el bloque completo quede centrado en la fila.
  const primeraY = y + FILA_ALTO / 2 - ((lineas.length - 1) * altoLinea) / 2 + 5;
  const centroValor = y + FILA_ALTO / 2 + 5;
  return (
    <g>
      {destacada && <rect x={4} y={y} width={ANCHO - 8} height={FILA_ALTO} fill="var(--gold-100, var(--gold-300))" />}
      <text x={24} fill={destacada ? INK : 'var(--ink-secondary, var(--ink))'} style={{ font: `${chica ? '500 12px' : '600 15px'} var(--font-family)` }}>
        {lineas.map((linea, i) => (
          <tspan key={i} x={24} y={primeraY + i * altoLinea}>
            {linea}
          </tspan>
        ))}
      </text>
      {valor && (
        <text
          x={ANCHO - 24}
          y={centroValor}
          textAnchor="end"
          fill={INK}
          style={{ font: `${chica ? '600 13px' : '700 18px'} var(--font-family)` }}
        >
          {valor}
        </text>
      )}
      {y > FILA_Y[0] && <line x1={16} y1={y} x2={ANCHO - 16} y2={y} {...divisor} />}
    </g>
  );
}

/** El encabezado del papel: un ícono genérico + el título del documento. */
function Encabezado({ titulo, icono }: { titulo: string; icono: 'banco' | 'porcentaje' }) {
  return (
    <g>
      <rect x={0} y={0} width={ANCHO} height={52} fill="var(--ink)" />
      {icono === 'banco' ? (
        <g transform="translate(20 12)">
          <path d="M2 12 L14 3 L26 12 Z" fill="var(--brand-300)" stroke="var(--surface-raised)" strokeWidth={2} strokeLinejoin="round" />
          <rect x={4} y={12} width={20} height={14} fill="none" stroke="var(--surface-raised)" strokeWidth={2} />
          <line x1={0} y1={26} x2={28} y2={26} stroke="var(--surface-raised)" strokeWidth={2} strokeLinecap="round" />
        </g>
      ) : (
        <g transform="translate(20 12)">
          <circle cx={14} cy={14} r={13} fill="none" stroke="var(--surface-raised)" strokeWidth={2.5} />
          <text x={14} y={19} textAnchor="middle" fill="var(--surface-raised)" style={{ font: '700 15px var(--font-family)' }}>
            %
          </text>
        </g>
      )}
      <text x={58} y={32} fill="var(--surface-raised)" style={{ font: '700 17px var(--font-family)' }}>
        {titulo}
      </text>
    </g>
  );
}

function ExtractoBancario() {
  return (
    <g>
      <rect x={2} y={2} width={ANCHO - 4} height={ALTO - 4} rx={10} fill="var(--sand-50, var(--surface))" {...line} />
      <Encabezado titulo="Extracto de cuenta" icono="banco" />
      <Fila y={FILA_Y[0]} etiqueta="Titular" valor="C. Ramírez" />
      <Fila y={FILA_Y[1]} etiqueta="Cuenta" valor="•••• 4821" />
      <Fila y={FILA_Y[2]} etiqueta="Saldo disponible" valor="$1.240.000" />
      <Fila y={FILA_Y[3]} etiqueta="Tasa de interés efectiva anual" valor="3,2 %" />
      <Fila y={FILA_Y[4]} etiqueta="Fecha de corte" valor="05 de cada mes" />
    </g>
  );
}

function SimulacionCredito() {
  return (
    <g>
      <rect x={2} y={2} width={ANCHO - 4} height={ALTO - 4} rx={10} fill="var(--sand-50, var(--surface))" {...line} />
      <Encabezado titulo="Simulación de crédito" icono="porcentaje" />
      <Fila y={FILA_Y[0]} etiqueta="Tu cuota" valor="Desde $120.000/mes" destacada />
      <Fila y={FILA_Y[1]} etiqueta="Monto solicitado" valor="$3.000.000" />
      <Fila y={FILA_Y[2]} etiqueta="Plazo" valor="24 meses" />
      <Fila y={FILA_Y[3]} etiqueta="Tasa de interés" valor="1,8 % mensual" />
      <Fila
        y={FILA_Y[4]}
        etiqueta={'Período de gracia: 6 meses.\nEl interés no pagado se suma al saldo.'}
        valor=""
        chica
      />
    </g>
  );
}

const DIBUJOS: Record<DocumentoId, () => React.ReactElement> = {
  'extracto-bancario': ExtractoBancario,
  'simulacion-credito': SimulacionCredito,
};

interface DocumentoProps {
  id: DocumentoId;
  className?: string;
  style?: CSSProperties;
}

/**
 * Documento — el papel de fondo de un ejercicio "Señalar". Es decorativo en el
 * sentido de que no reacciona por sí solo: las zonas clicables van ENCIMA, en
 * Señalar.tsx, alineadas a esta misma cuadrícula de filas.
 */
export default function Documento({ id, className, style }: DocumentoProps) {
  const Dibujo = DIBUJOS[id];
  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      className={`documento${className ? ` ${className}` : ''}`}
      data-documento={id}
      style={{ display: 'block', width: '100%', height: 'auto', ...style }}
      aria-hidden="true"
      focusable="false"
    >
      <Dibujo />
    </svg>
  );
}

/** Las 5 franjas horizontales del documento, en fracciones 0-1 del lienzo (para Señalar.tsx). */
export const FILAS_RELATIVAS = FILA_Y.map((y) => ({
  y: y / ALTO,
  height: FILA_ALTO / ALTO,
}));
