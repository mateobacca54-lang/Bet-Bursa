'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import FondoVelas from '../FondoVelas';
import '../landing.css';
import './cierre.css';

/**
 * Cierre — última pantalla de la landing: "Tu primera lección dura tres minutos."
 *
 * Monedita saluda UNA vez, cuando la sección entra en pantalla (IntersectionObserver):
 * el mismo video de 5 s, silencioso, que ya usa /inicio, y que termina en la misma pose
 * que su póster (no hay salto al terminar). Bajo `prefers-reduced-motion` no se monta
 * observador ni video: solo el póster, quieto (AGENTS.md — se quita el movimiento, nunca
 * la información). Detrás, FondoVelas pone un campo de velas casi invisible que
 * reacciona muy sutil al puntero.
 *
 * A propósito conserva las clases `lp-closing` / `lp-closing-inner` / `lp-closing-avatar`
 * de landing.css: ApareceAlBajar (de A, fuera de esta tarea) ya trae una secuencia de
 * entrada propia para ese selector — Monedita rebota, el título se dibuja por líneas, el
 * botón sube — y así la hereda tal cual, sin duplicarla.
 */
export default function Cierre() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [saludar, setSaludar] = useState(false);

  useEffect(() => {
    if (reduced) return; // sin observador bajo movimiento reducido: solo el póster, quieto
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setSaludar(true);
          obs.disconnect(); // saluda una sola vez
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <section ref={sectionRef} id="cierre" className="lp-section lp-closing cie-section" aria-labelledby="cierre-titulo">
      <FondoVelas />
      <div className="lp-wrap lp-closing-inner">
        <div className="lp-closing-avatar cie-avatar">
          {saludar && !reduced ? (
            <video
              className="cie-avatar-media"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/monedita/monedita-saluda-poster.webp"
              aria-label="Monedita, la moneda que te acompaña en Bursa, te saluda"
              width={480}
              height={464}
            >
              <source src="/monedita/monedita-saluda.webm" type="video/webm" />
              <source src="/monedita/monedita-saluda.mp4" type="video/mp4" />
            </video>
          ) : (
            <Image
              className="cie-avatar-media"
              src="/monedita/monedita-saluda-poster.webp"
              alt="Monedita, la moneda que te acompaña en Bursa"
              width={480}
              height={464}
              draggable={false}
            />
          )}
        </div>

        <h2 id="cierre-titulo" className="lp-title">
          Tu primera lección dura tres minutos.
        </h2>

        <Link href="/inicio" className="lp-btn lp-btn--primary" data-aparece="subir">
          Empieza gratis
        </Link>
      </div>
    </section>
  );
}
