import type { CSSProperties, ReactNode } from 'react';
import { Marca, Objeto } from '@/components/illus';

// ============================================================
// EjemploVisual — el dibujo que acompaña al párrafo de "Un ejemplo de tu día".
//
// La pantalla del ejemplo era solo texto y quedaba casi vacía. Aquí cada lección con
// contenido tiene un esquema hecho con los mismos objetos de las prácticas, para que el
// ejemplo se VEA antes de leerse entero. Decorativo: el párrafo dice lo mismo, por eso
// va con aria-hidden. Las cifras que aparecen salen del texto de la propia lección.
// ============================================================

const fila: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-3)' };

function Flecha() {
  return (
    <svg width="44" height="20" viewBox="0 0 44 20" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M3 10h34M29 3l8 7-8 7" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Etiqueta de precio colgando de un objeto */
function Precio({ children, sub }: { children: ReactNode; sub?: string }) {
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
      {children}
      {sub && <small style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--ink-secondary)' }}>{sub}</small>}
    </span>
  );
}

function Columna({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>{children}</div>;
}

const ESQUEMAS: Record<number, () => ReactNode> = {
  // L1 · el trueque no alcanza; el billete sí
  1: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div style={fila}>
        <Objeto id="bici" size={72} />
        <Flecha />
        <Objeto id="almuerzo" size={72} />
        <Marca tipo="no" />
      </div>
      <div style={fila}>
        <Objeto id="billete" size={72} />
        <Flecha />
        <Objeto id="almuerzo" size={72} />
        <Marca tipo="si" />
      </div>
    </div>
  ),

  // L2 · el mismo almuerzo, otro precio ($8.000 es la cifra del texto de la lección)
  2: () => (
    <div style={{ ...fila, gap: 'var(--space-4)' }}>
      <Columna>
        <Objeto id="almuerzo" size={88} />
        <Precio sub="2015">$8.000</Precio>
      </Columna>
      <Flecha />
      <Columna>
        <Objeto id="almuerzo" size={88} />
        <Precio sub="hoy">▲</Precio>
      </Columna>
    </div>
  ),

  // L3 · la recta y la curva que se despega
  3: () => (
    <div style={{ ...fila, gap: 'var(--space-4)' }}>
      <Objeto id="crecimiento" size={112} />
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--ink-secondary)' }}>
        <li style={fila}>
          <span aria-hidden="true" style={{ width: 20, borderTop: '3px dashed var(--ink)' }} />
          Interés simple
        </li>
        <li style={fila}>
          <span aria-hidden="true" style={{ width: 20, borderTop: '4px solid var(--brand-600)' }} />
          Interés compuesto
        </li>
      </ul>
    </div>
  ),
};

/** El esquema de la lección, o null si esa lección aún no tiene uno. */
export default function EjemploVisual({ lesson }: { lesson: number }) {
  const Esquema = ESQUEMAS[lesson];
  if (!Esquema) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'inline-block',
        marginTop: 'var(--space-8)',
        padding: 'var(--space-6)',
        background: 'var(--sand-100)',
        border: '1px solid var(--border-warm)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {Esquema()}
    </div>
  );
}
