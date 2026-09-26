'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useCtaProgreso } from '@/lib/useCtaProgreso';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import '../landing.css';
import './cierre.css';

const PRIMERA = TEMARIO_MODULO_1[0];

/**
 * Cierre — última pantalla de la landing: "Tu primera lección dura tres minutos."
 *
 * Monedita saluda UNA vez, cuando la sección entra en pantalla (IntersectionObserver):
 * el mismo video de 5 s, silencioso, que ya usa /inicio, y que termina en la misma pose
 * que su póster. Bajo `prefers-reduced-motion` no se monta observador ni video: solo el
 * póster, quieto. El video no es un control: sin imagen en imagen, sin puntero.
 *
 * Debajo, la tarjeta de esa primera lección (título y gancho literales del temario):
 * lo que de verdad te llevas al hacer clic, en vez de un fondo decorativo.
 *
 * Conserva las clases `lp-closing` / `lp-closing-inner` / `lp-closing-avatar` de
 * landing.css: ApareceAlBajar ya trae la secuencia de entrada para ese selector.
 */
export default function Cierre() {
  const reduced = usePrefersReducedMotion();
  const cta = useCtaProgreso();
  const sectionRef = useRef<HTMLElement>(null);
  const [saludar, setSaludar] = useState(false);

  useEffect(() => {
    if (reduced) return;
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
      <div className="lp-wrap lp-closing-inner">
        <div className="lp-closing-avatar cie-avatar">
          {saludar && !reduced ? (
            <video
              className="cie-avatar-media"
              autoPlay
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              tabIndex={-1}
              poster="/monedita/monedita-saluda-poster.webp"
              aria-label="Monedita, la moneda que te acompaña en Bursa, te saluda"
              width={480}
              height={480}
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
              height={480}
              sizes="192px"
              draggable={false}
            />
          )}
        </div>

        <h2 id="cierre-titulo" className="lp-title">
          Tu primera lección dura tres minutos.
        </h2>

        <div className="cie-leccion">
          <p className="cie-leccion-meta">Lección 1 · 3 minutos</p>
          <p className="cie-leccion-titulo">{PRIMERA.title}</p>
          <p className="cie-leccion-gancho">{PRIMERA.hook}</p>
        </div>

        <Link href={cta.href} className="lp-btn lp-btn--primary" data-aparece="subir">
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
