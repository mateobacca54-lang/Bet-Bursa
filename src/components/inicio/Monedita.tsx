'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useAnimationControls } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { motionSafe, variants } from '@/lib/motion';
import { Reveal } from '@/components/motion';
import './inicio.css';

interface MoneditaProps {
  /**
   * Contador de reacciones: cada vez que sube, Monedita da un saltito.
   * Sirve para que reaccione a algo que el usuario hizo (p. ej. su apuesta).
   * En 0 no hace nada: no hay movimiento en reposo.
   */
  reaction?: number;
  /** Segundos antes de entrar (para escalonar con el resto de la pantalla) */
  delay?: number;
}

/**
 * Monedita — la moneda que guía al usuario en /inicio.
 *
 * Solo se mueve cuando ella entra y cuando reacciona a algo que causó el usuario
 * (variante `hop`). Al entrar saluda UNA vez (video de 5 s que termina en la misma pose
 * de la imagen fija, así que no hay salto) y se queda quieta: no hay movimiento en
 * reposo. Bajo prefers-reduced-motion no hay video ni salto: solo la imagen.
 */
export default function Monedita({ reaction = 0, delay = 0 }: MoneditaProps) {
  const reduced = usePrefersReducedMotion();
  const controls = useAnimationControls();
  // El video solo se monta en el cliente y si el sistema no pide menos movimiento:
  // así el HTML del servidor y el primer render del cliente son la misma imagen.
  const [saluda, setSaluda] = useState(false);
  useEffect(() => {
    try {
      setSaluda(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch {
      setSaluda(false);
    }
  }, []);

  useEffect(() => {
    if (reaction > 0) {
      void controls.start(motionSafe(variants, reduced).hop);
    }
  }, [reaction, reduced, controls]);

  return (
    <div className="ini-stage">
      <Reveal delay={delay} className="ini-monedita">
        <motion.div animate={controls}>
          {saluda && !reduced ? (
            <video
              className="ini-monedita-video"
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
              className="ini-monedita-video"
              src="/monedita/monedita-saluda-poster.webp"
              alt="Monedita, la moneda que te acompaña en Bursa"
              width={480}
              height={464}
              sizes="(min-width: 720px) 240px, 60vw"
              priority
              draggable={false}
            />
          )}
        </motion.div>
        <div className="ini-monedita-shadow" aria-hidden="true" />
      </Reveal>
    </div>
  );
}
