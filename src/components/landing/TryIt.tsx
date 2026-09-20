'use client';

import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { AnimatedComparator } from '@/components/widgets/AnimatedComparator';
import { leccion03Config } from '@/content/modulo-1/leccion-03-interes';
import './landing.css';

/**
 * TryIt — la lección 3 real, incrustada. Predice el interés compuesto antes de verlo:
 * la persona prueba el producto sin registrarse ni salir de la página.
 */
export default function TryIt() {
  return (
    <section id="pruebalo" className="lp-section" style={{ background: 'var(--ink)' }} aria-labelledby="pruebalo-titulo">
      <div className="lp-wrap lp-try">
        <Reveal>
          <p className="lp-eyebrow">Pruébalo ahora</p>
          <h2 id="pruebalo-titulo" className="lp-title">
            ¿Cuánto crece tu plata con el tiempo? Adivina.
          </h2>
          <p className="lp-lead" style={{ marginTop: 'var(--space-3)' }}>
            Esta es una lección de verdad. No necesitas cuenta.
          </p>
          <ol className="lp-steps">
            <li>Mira cómo crece con interés simple.</li>
            <li>Arrastra el punto donde crees que llegará con interés compuesto.</li>
            <li>Descubre cuánto te acercaste.</li>
          </ol>
          <div style={{ marginTop: 'var(--space-8)' }}>
            <Link href="/modulo/1" className="lp-btn lp-btn--primary">
              Sigue con el Módulo 1
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <AnimatedComparator config={leccion03Config} />
        </Reveal>
      </div>
    </section>
  );
}
