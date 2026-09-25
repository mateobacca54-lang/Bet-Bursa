'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_IN_OUT, REDUCED_DURATION, staggerDelay } from '@/lib/motion';
import Reveal from '@/components/motion/Reveal';
import { Estampa } from '@/components/illus';
import { HERO_LEFT, HERO_RIGHT, type LandingCard } from './landing-data';
import TopicSheet from './TopicSheet';
import './landing.css';

/** Inclinación de las tarjetas (grados): alternan para que el borde forme un arco */
const TILT = [-14, -4, -18];
/** Amplitud de la flotación en reposo, en px (misma que los papeles del camino: ±6) */
const DRIFT = 18;
/**
 * Las tarjetas de arriba de cada columna (slot 0 y 3) flotan menos que las demás: con su
 * Y_OFFSET tan negativo, la deriva de ±18 las llevaba detrás de la barra fija (~65 px),
 * medido con scripts/medir-solapes.mjs. Las demás mantienen el DRIFT normal.
 */
const DRIFT_POR_SLOT = [8, DRIFT, DRIFT, 8, DRIFT, DRIFT];
/** Segundos por ciclo de flotación. Distintos por tarjeta para que no floten al unísono. */
const PERIOD = [7.5, 9, 6.5, 8, 7, 9.5];
const X_OFFSETS = [160, -10, 140, -160, 20, -140];
/**
 * Desplazamiento de cada tarjeta respecto a su sitio en la columna. El recorrido total
 * (de la más alta a la más baja) tiene que caber DENTRO del héroe: `.lp-stage` recorta
 * lo que se sale (`overflow: hidden`) y, desde que lo de abajo es papel (2026-09-26),
 * ese recorte se ve como un tajo. Antes no se notaba porque debajo también era negro.
 */
const Y_OFFSETS = [-14, -10, 24, -12, 20, 20];

interface FloatCardProps {
  card: LandingCard;
  tilt: number;
  /** Posición entre las 6 tarjetas: decide su periodo y cuándo entra */
  slot: number;
  /**
   * En el riel de móvil las tarjetas van en fila, no flotando a los lados. Sin esto
   * heredaban los desplazamientos de las columnas (±160 px en horizontal) y se montaban
   * unas sobre otras, además de quedar al 80 % dentro de su propio hueco.
   */
  enRiel?: boolean;
  onOpen: (card: LandingCard, button: HTMLButtonElement) => void;
}

/**
 * Una tarjeta de tema. Es un <button>: al tocarla se abre el panel con lo básico del tema.
 * En reposo FLOTA (deriva lenta de ±6 px, desfasada de sus vecinas); con prefers-reduced-motion
 * se queda quieta, pero sigue siendo tocable. Al pasar el cursor se endereza, como en /modulo/1.
 */
function FloatCard({ card, tilt, slot, enRiel = false, onOpen }: FloatCardProps) {
  const reduced = usePrefersReducedMotion();
  const delay = 0.15 + staggerDelay(slot);

  const entrada = enRiel
    ? { opacity: 0, y: 12, x: 0, scale: 1 }
    : { opacity: 0, y: Y_OFFSETS[slot] + 20, x: X_OFFSETS[slot], scale: 0.8 };

  // En el riel solo entra y se queda quieta: una tarjeta que flota dentro de un carrusel
  // con scroll-snap pelea con el dedo de quien lo desliza.
  const reposo = enRiel
    ? { opacity: 1, y: 0, x: 0, scale: 1, transition: { duration: DURATION.scene, delay } }
    : {
        opacity: 1,
        y: [Y_OFFSETS[slot], Y_OFFSETS[slot] - DRIFT_POR_SLOT[slot], Y_OFFSETS[slot]],
        scale: 0.8,
        x: X_OFFSETS[slot],
        transition: {
          opacity: { duration: DURATION.scene, delay },
          y: { duration: PERIOD[slot % PERIOD.length], delay, ease: EASE_IN_OUT, repeat: Infinity },
        },
      };

  return (
    <motion.button
      type="button"
      className="lp-card"
      aria-haspopup="dialog"
      aria-label={`${card.title}. ${card.available ? 'Disponible' : 'Pronto'}. Abrir para ver de qué trata.`}
      style={{ rotate: tilt }}
      initial={entrada}
      animate={reduced ? { opacity: 1, y: 0, transition: { duration: REDUCED_DURATION } } : reposo}
      whileHover={reduced ? undefined : { rotate: 0, scale: 0.88, zIndex: 10, transition: { duration: DURATION.element } }}
      onClick={(e) => onOpen(card, e.currentTarget)}
    >
      <Estampa scene={card.scene} />
      <span className="lp-card-more" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M7 2v10M2 7h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="lp-card-cap">
        <span className={`lp-pill${card.available ? ' lp-pill--on' : ''}`}>{card.available ? 'Disponible' : 'Pronto'}</span>
        {card.title}
      </span>
    </motion.button>
  );
}

/**
 * Héroe de la landing: el titular al centro y, a los lados, las tarjetas de los temas del
 * módulo, quietas y flotando. Tocar una abre un panel con lo básico del tema.
 *
 * Antes las columnas viajaban con el scroll (sticky + parallax). Se quitó: el movimiento
 * ligado al scroll es ahora de "Aprendes haciendo", donde sí explica algo.
 * En pantallas < 900 px: titular y un riel horizontal de tarjetas (scroll nativo).
 */
export default function StickyHero() {
  const [open, setOpen] = useState<{ card: LandingCard; x: number; y: number; width: number } | null>(null);
  // Quien abrió el panel recupera el foco al cerrarlo
  const opener = useRef<HTMLButtonElement | null>(null);

  function handleOpen(card: LandingCard, button: HTMLButtonElement) {
    const r = button.getBoundingClientRect();
    opener.current = button;
    setOpen({ card, x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width });
  }

  return (
    <section className="lp-hero" aria-labelledby="hero-titulo">
      <div className="lp-stage" style={{ position: "relative", overflowX: "hidden" }}>
        
        <div className="lp-col lp-col--right">
          {HERO_RIGHT.map((c, i) => (
            <FloatCard key={c.lesson} card={c} tilt={Math.abs(TILT[i % TILT.length])} slot={i + 3} onOpen={handleOpen} />
          ))}
        </div>

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
            <p className="lp-lead" style={{ color: "var(--ink-secondary)" }}>
              Lecciones cortas e interactivas para jóvenes en Colombia. Ejemplos en pesos, sin jerga.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="lp-actions">
              <Link href="/inicio" className="lp-btn lp-btn--primary">
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
        <div className="lp-rail">
          {[...HERO_LEFT, ...HERO_RIGHT].map((c, i) => (
            <FloatCard key={c.lesson} card={c} tilt={0} slot={i} enRiel onOpen={handleOpen} />
          ))}
        </div>
      </div>

      <AnimatePresence onExitComplete={() => opener.current?.focus()}>
        {open && <TopicSheet key={open.card.lesson} card={open.card} origin={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  );
}




