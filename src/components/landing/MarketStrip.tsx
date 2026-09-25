'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useScroll, useTransform } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Estampa } from '@/components/illus';
import { MARKET_SHOTS } from './landing-data';
import './landing.css';

/** Margen que queda a la derecha de la última imagen al terminar el recorrido (px) */
const END_GAP = 32;

/**
 * MarketStrip — el texto queda fijo a la izquierda y las imágenes del mundo real pasan por
 * el lado (solo transform, ligado al scroll). El recorrido se mide en píxeles para que la
 * última imagen termine justo dentro de la pantalla, sea cual sea su ancho.
 * En móvil es un carrusel de scroll nativo; con reduced-motion no hay sticky.
 */
export default function MarketStrip() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const overflow = useMotionValue(0);
  // En móvil (y con reduced-motion) la pista se recorre a mano: debe poder enfocarse con teclado.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const scrollable = narrow || reduced;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  // Se expone como variable CSS: solo el escritorio la usa (ver landing.css).
  const trackX = useTransform([scrollYProgress, overflow], ([p, o]: number[]) => `${-o * p}px`);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = () => {
      overflow.set(Math.max(0, track.scrollWidth - (viewport.clientWidth - END_GAP)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);
    return () => ro.disconnect();
  }, [overflow]);

  return (
    <section ref={sectionRef} className={`lp-market lp-light${reduced ? ' lp-market--static' : ''}`} aria-labelledby="mercado-titulo">
      <div className="lp-market-stage">
        <div className="lp-market-text">
          <p className="lp-eyebrow" style={{ margin: 0 }}>
            El mercado que ya conoces
          </p>
          <h2 id="mercado-titulo" className="lp-title">
            La plaza, la tienda y la bolsa son lo mismo.
          </h2>
          <p className="lp-lead">
            Un mercado es cualquier sitio donde alguien vende, alguien compra y los dos aceptan un precio. Cambia el tamaño y la velocidad; el trato es el mismo.
          </p>
        </div>

        <div ref={viewportRef} className="lp-track-viewport">
        <motion.div
          ref={trackRef}
          className="lp-track"
          {...(scrollable ? { tabIndex: 0, role: 'group', 'aria-label': 'Imágenes de mercados: desliza para ver más' } : {})}
          style={reduced ? undefined : ({ '--track-x': trackX } as Record<string, unknown>)}
        >
          {MARKET_SHOTS.map((s) => (
            <figure key={s.scene} className="lp-shot">
              <Estampa scene={s.scene} className="lp-shot-art" />
              <figcaption>{s.caption}</figcaption>
            </figure>
          ))}
        </motion.div>
        </div>
      </div>
    </section>
  );
}
