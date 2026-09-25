'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { calcularGeometriaVelas, distancia, generarVelas, intensidadPorProximidad } from '@/lib/velas';
import './fondo-velas.css';

// Lienzo lógico fijo (unidades de viewBox): el propio <svg> lo estira con CSS a
// cualquier tamaño real (preserveAspectRatio="none"), así que estos números no son px.
const VIEW_W = 1000;
const VIEW_H = 360;
const CONTEO_VELAS = 52;
const SEED = 20260925; // fecha de la dirección de la landing: fija, no decorativa
const RADIO_PROXIMIDAD = VIEW_W * 0.17;
const OPACIDAD_BASE = 0.08;
const OPACIDAD_ACTIVA = 0.22;

/**
 * FondoVelas — un campo de velas de mercado, casi invisible, en el cierre.
 *
 * Deterministas (misma seed siempre) y en reposo casi no se ven (opacidad 0.06–0.10):
 * son textura, no protagonistas. Cuando el puntero se mueve sobre la sección que las
 * contiene, las velas cercanas suben de opacidad y se levantan unos px — nunca al
 * revés: sin puntero, no pasa nada (AGENTS.md: el movimiento explica o no existe; aquí
 * explica "hay mercado debajo de este texto", nada más). Nada en táctil, nada bajo
 * `prefers-reduced-motion`, sin bucle en reposo.
 */
export default function FondoVelas() {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [punto, setPunto] = useState<{ x: number; y: number } | null>(null);

  const velas = useMemo(() => generarVelas({ count: CONTEO_VELAS, seed: SEED, startValue: 100, volatility: 0.05 }), []);
  const geometria = useMemo(
    () => calcularGeometriaVelas(velas, { width: VIEW_W, height: VIEW_H, gap: 0.32, paddingY: 0.14 }),
    [velas]
  );

  useEffect(() => {
    if (reduced) return; // estático bajo movimiento reducido: ni observadores ni listeners
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return; // nada en táctil

    const seccion = wrapRef.current?.closest('section') ?? wrapRef.current;
    if (!seccion) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (rafRef.current !== null) return; // ya hay un cuadro pendiente: no se apilan
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const svg = wrapRef.current?.querySelector('svg');
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        setPunto({
          x: ((e.clientX - rect.left) / rect.width) * VIEW_W,
          y: ((e.clientY - rect.top) / rect.height) * VIEW_H,
        });
      });
    };
    const onLeave = () => setPunto(null);

    seccion.addEventListener('pointermove', onMove);
    seccion.addEventListener('pointerleave', onLeave);
    return () => {
      seccion.removeEventListener('pointermove', onMove);
      seccion.removeEventListener('pointerleave', onLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  return (
    <div className="fv-wrap" ref={wrapRef} aria-hidden="true">
      <svg className="fv-svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" focusable="false">
        {geometria.map((g, i) => {
          const dist = punto ? distancia(g.centroX, g.centroY, punto.x, punto.y) : Infinity;
          const intensidad = intensidadPorProximidad(dist, RADIO_PROXIMIDAD);
          const opacidad = OPACIDAD_BASE + (OPACIDAD_ACTIVA - OPACIDAD_BASE) * intensidad;
          const color = g.sube ? 'var(--brand-600)' : 'var(--ink)';
          return (
            <g key={i} className="fv-vela" style={{ opacity: opacidad, transform: `translateY(${-4 * intensidad}px)` }}>
              <line x1={g.centroX} x2={g.centroX} y1={g.mechaY1} y2={g.mechaY2} stroke={color} strokeWidth={1} />
              <rect x={g.x} y={g.cuerpoY} width={g.ancho} height={g.cuerpoAlto} fill={color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
