'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/motion';
import { useTapaAyuda } from '@/lib/useEvitarAyuda';

interface PruebaCheckpointProps {
  moduleName: string;
  href: string;
  /** Segundos de espera antes de entrar */
  delay?: number;
}

/**
 * PruebaCheckpoint — la tarjeta que aparece bajo el camino cuando las 10 lecciones ya están
 * hechas pero la prueba de paso, no.
 *
 * Es "visualmente distinta de una lección" (07-PLAN.md, ola 2) a propósito: un diamante con
 * bandera, no un círculo numerado, para que no se confunda con un nodo más del camino. Vive
 * como tarjeta aparte y no como un 11.º punto dentro del SVG — así el camino y su sistema de
 * colisiones (path-geometry.ts) no cambian de forma para este módulo.
 *
 * El botón de ayuda (fijo, misma esquina en toda la app) puede coincidir con esta tarjeta
 * sin haber desplazado la página — medido con scripts/medir-solapes.mjs. Como es una tarjeta
 * simple, sin varias posiciones candidatas entre las que elegir, la regla de REGLAS.md §6
 * se aplica tal cual: si no cabe sin que Ayuda la tape, no se muestra.
 *
 * "No se muestra" es `visibility: hidden`, no desmontarla: si desapareciera del documento,
 * useEvitarAyuda ya no tendría contra qué medir, "tapada" volvería a false, la tarjeta
 * reaparecería tapada, y así en bucle. Oculta pero presente, se puede seguir midiendo.
 */
export default function PruebaCheckpoint({ moduleName, href, delay = 0 }: PruebaCheckpointProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const tapada = useTapaAyuda(ref);

  return (
    <Reveal delay={delay} style={{ marginTop: 'var(--space-6)' }}>
      <Link
        ref={ref}
        href={href}
        aria-hidden={tapada || undefined}
        tabIndex={tapada ? -1 : undefined}
        style={{
          visibility: tapada ? 'hidden' : 'visible',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          padding: 'var(--space-5) var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-raised)',
          border: '2px solid var(--brand-600)',
          boxShadow: 'var(--shadow-md)',
          textDecoration: 'none',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            transform: 'rotate(45deg)',
            background: 'var(--brand-600)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: 'rotate(-45deg)' }}>
            <path
              d="M5 3v14M5 3h9l-2.5 3L14 9H5"
              fill="none"
              stroke="var(--on-brand)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span style={{ flex: 1 }}>
          <span
            className="uppercase-tracking"
            style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--brand-700)' }}
          >
            Prueba de {moduleName}
          </span>
          <span style={{ display: 'block', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--ink)' }}>
            Ya viste las 10 lecciones. Falta comprobar qué tanto quedó.
          </span>
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--brand-600)' }}>
          <path d="M5 12h14m-5-6 6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </Reveal>
  );
}
