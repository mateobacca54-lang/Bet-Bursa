'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import Reveal from '@/components/motion/Reveal';
import LearningPath from '@/components/path/LearningPath';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import './landing.css';

/**
 * PathPreview — el camino real del Módulo 1. Se monta cuando entra en pantalla, para que
 * su dibujo (la línea que sube) ocurra delante de quien lo mira y no fuera de vista.
 */
export default function PathPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: '0px 0px -25% 0px' });

  return (
    <section className="lp-section lp-light" aria-labelledby="camino-landing-titulo">
      <div className="lp-wrap">
        <Reveal style={{ maxWidth: 720 }}>
          <p className="lp-eyebrow">Módulo 1 · Fundamentos del dinero</p>
          <h2 id="camino-landing-titulo" className="lp-title">
            Diez temas. Un camino.
          </h2>
          <p className="lp-lead" style={{ marginTop: 'var(--space-3)' }}>
            Empiezas por qué es el dinero y llegas a leer la letra pequeña de un crédito. Pasa el cursor (o toca) un tema para ver la pregunta con la que arranca.
          </p>
        </Reveal>

        <div ref={ref} className="lp-path-frame">
          {visible && (
            <LearningPath
              lessons={TEMARIO_MODULO_1}
              completedLessons={[]}
              nextLesson={1}
              hrefFor={(n) => `/modulo/1/leccion/${n}`}
            />
          )}
        </div>
      </div>
    </section>
  );
}
