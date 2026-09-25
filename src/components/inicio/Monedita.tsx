'use client';

import { useEffect } from 'react';
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
 * (variante `hop`). Bajo prefers-reduced-motion aparece con un cross-fade y no salta.
 */
export default function Monedita({ reaction = 0, delay = 0 }: MoneditaProps) {
  const reduced = usePrefersReducedMotion();
  const controls = useAnimationControls();

  useEffect(() => {
    if (reaction > 0) {
      void controls.start(motionSafe(variants, reduced).hop);
    }
  }, [reaction, reduced, controls]);

  return (
    <div className="ini-stage">
      <Reveal delay={delay} className="ini-monedita">
        <motion.div animate={controls}>
          <Image
            src="/monedita/monedita.webp"
            alt="Monedita, la moneda que te acompaña en Bursa"
            width={600}
            height={640}
            sizes="(min-width: 720px) 240px, 60vw"
            priority
            draggable={false}
          />
        </motion.div>
        <div className="ini-monedita-shadow" aria-hidden="true" />
      </Reveal>
    </div>
  );
}
