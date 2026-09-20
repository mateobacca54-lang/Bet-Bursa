import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import './landing.css';

/**
 * ProductBento — el producto real, en piezas: una idea por pantalla, predecir antes de
 * ver, y ejemplos de tu vida. Las capturas son de la app (no ilustraciones).
 */
export default function ProductBento() {
  return (
    <section id="como-funciona" className="lp-section lp-light" aria-labelledby="producto-titulo">
      <div className="lp-wrap">
        <Reveal style={{ maxWidth: 720, marginBottom: 'var(--space-8)' }}>
          <p className="lp-eyebrow">Cómo funciona</p>
          <h2 id="producto-titulo" className="lp-title">
            Aprendes haciendo, no leyendo.
          </h2>
          <p className="lp-lead" style={{ marginTop: 'var(--space-3)' }}>
            Cada lección es una idea, un ejemplo y un ejercicio. Si te equivocas, te explicamos por qué y lo intentas otra vez.
          </p>
        </Reveal>

        <div className="lp-bento">
          <div className="lp-bento-side">
            <Reveal className="lp-tile lp-tile--brand">
              <span className="lp-pill">Simple</span>
              <h3>Una idea por pantalla.</h3>
            </Reveal>
            <Reveal delay={0.06} className="lp-tile lp-tile--ink">
              <span className="lp-pill">Interactivo</span>
              <h3>Predices antes de ver la respuesta.</h3>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lp-bento-stage">
            <div className="lp-device">
              <Image
                src="/landing/producto-escritorio-2.webp"
                alt="Lección 1 de Bursa en escritorio: se clasifican situaciones cotidianas entre «trueque» y «necesita dinero»"
                fill
                sizes="(min-width: 900px) 55vw, 92vw"
              />
            </div>
            <div className="lp-phone">
              <Image
                src="/landing/producto-movil.webp"
                alt="Lección 3 de Bursa en el celular: una gráfica compara el interés simple con el compuesto"
                fill
                sizes="(min-width: 900px) 19vw, 32vw"
              />
            </div>
          </Reveal>

          <Reveal delay={0.14} className="lp-tile lp-tile--white">
            <span className="lp-pill" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
              Tuyo
            </span>
            <h3>Con tu vida: la empanada, el bus, el arriendo.</h3>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
