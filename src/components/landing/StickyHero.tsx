'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import Reveal from '@/components/motion/Reveal';
import { HERO_LEFT, HERO_RIGHT, type LandingCard } from './landing-data';
import './landing.css';

/**
 * Cuánto se desplazan las columnas laterales durante el scroll del héroe (en % del alto de
 * la ventana). Van en sentidos opuestos: mientras una sube, la otra baja, y el centro queda fijo.
 */
const TRAVEL = 34;
/** Inclinación de las tarjetas (grados): alternan para que el borde forme un arco */
const TILT = [-8, -5, -9];

function TopicCard({ card, tilt, sizes }: { card: LandingCard; tilt: number; sizes: string }) {
  return (
    <figure className="lp-card" style={{ transform: `rotate(${tilt}deg)`, '--ar': card.aspect } as React.CSSProperties}>
      <Image
        src={card.src}
        alt=""
        fill
        sizes={sizes}
        style={{ objectPosition: card.position }}
        priority={card.lesson === 2 || card.lesson === 3}
      />
      <figcaption>
        <span className={`lp-pill${card.available ? ' lp-pill--on' : ''}`}>{card.available ? 'Disponible' : 'Pronto'}</span>
        {card.title}
      </figcaption>
    </figure>
  );
}

function Column({
  cards,
  side,
  progress,
  from,
  to,
  reduced,
}: {
  cards: readonly LandingCard[];
  side: 'left' | 'right';
  progress: MotionValue<number>;
  from: number;
  to: number;
  reduced: boolean;
}) {
  const y = useTransform(progress, [0, 1], [`${from}vh`, `${to}vh`]);
  const sign = side === 'left' ? 1 : -1;
  return (
    <motion.div className={`lp-col lp-col--${side}`} style={reduced ? undefined : { y }} aria-hidden="true">
      {cards.map((c, i) => (
        <TopicCard key={c.lesson} card={c} tilt={sign * -Math.abs(TILT[i % TILT.length])} sizes="(min-width: 900px) 22vw, 60vw" />
      ))}
    </motion.div>
  );
}

/**
 * StickyHero — el titular queda fijo en el centro mientras las columnas de tarjetas de los
 * lados se desplazan en sentidos opuestos (solo transform, ligadas al scroll).
 * En pantallas < 900 px no hay sticky: titular y un riel horizontal de tarjetas (scroll nativo).
 * Con reduced-motion no se mueve nada.
 */
export default function StickyHero() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section ref={ref} className={`lp-hero${reduced ? ' lp-hero--static' : ''}`} aria-labelledby="hero-titulo">
      <div className="lp-stage">
        <Column cards={HERO_LEFT} side="left" progress={scrollYProgress} from={-4} to={-TRAVEL} reduced={reduced} />
        <Column cards={HERO_RIGHT} side="right" progress={scrollYProgress} from={-TRAVEL} to={-4} reduced={reduced} />

        <div className="lp-center">
          <Reveal>
            <p className="lp-eyebrow" style={{ margin: 0 }}>
              Escuela de dinero y mercados
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 id="hero-titulo" className="lp-display">
              Entiende tu <span className="lp-accent">plata</span>. Y los mercados donde se mueve.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="lp-lead">
              Lecciones cortas e interactivas para jóvenes en Colombia. Ejemplos en pesos, sin jerga.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="lp-actions">
              <Link href="/modulo/1" className="lp-btn lp-btn--primary">
                Empieza el Módulo 1
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M3 9h11M10 4l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#como-funciona" className="lp-btn lp-btn--ghost">
                Cómo funciona
              </a>
            </div>
          </Reveal>
        </div>

        {/* Móvil: riel con scroll nativo */}
        <div className="lp-rail" aria-hidden="true">
          {[...HERO_LEFT, ...HERO_RIGHT].map((c) => (
            <TopicCard key={c.lesson} card={c} tilt={0} sizes="240px" />
          ))}
        </div>
      </div>
    </section>
  );
}
