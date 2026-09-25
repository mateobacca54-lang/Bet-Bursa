'use client';

import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO, staggerDelay } from '@/lib/motion';
import Reveal from '@/components/motion/Reveal';
import { HOW_SCENES, type HowScene, type HowTile } from './landing-data';
import './landing.css';

const LAST = HOW_SCENES.length - 1;
/** Desplazamiento de las tarjetas al relevarse (px). Los lados viajan en sentidos opuestos. */
const SWAP = 44;

const SCENE_PALETTES = [
  { accent: 'var(--brand-600)', wash: 'var(--brand-50)', onAccent: 'var(--on-brand)' },
  { accent: 'var(--gold-500)', wash: 'var(--gold-100)', onAccent: 'var(--ink)' },
  { accent: 'var(--scene-blue-500)', wash: 'var(--scene-blue-50)', onAccent: 'var(--surface-raised)' },
] as const;

function Tile({ tile, center = false }: { tile: HowTile; center?: boolean }) {
  return (
    <div className={`lp-tile lp-tile--${tile.tone}${center ? ' lp-tile--center' : ''}`}>
      <span className="lp-pill" style={tile.tone === 'white' ? { background: 'var(--brand-50)', color: 'var(--brand-700)' } : undefined}>
        {tile.pill}
      </span>
      <p className="lp-tile-text">{tile.text}</p>
    </div>
  );
}

/** Una escena reemplaza a la otra dentro de un área fija, sin desplazar el producto central. */
function SwapGroup({
  id,
  direction,
  side,
  palette,
  children,
}: {
  id: string;
  direction: 1 | -1;
  side: 'left' | 'right';
  palette: (typeof SCENE_PALETTES)[number];
  children: ReactNode;
}) {
  const travel = (side === 'left' ? 1 : -1) * direction;
  const style = {
    '--scene-accent': palette.accent,
    '--scene-wash': palette.wash,
    '--scene-on-accent': palette.onAccent,
  } as CSSProperties;
  return (
    <motion.div
      key={id}
      className="lp-how-group"
      style={style}
      initial={{ opacity: 0, y: travel * SWAP, rotate: travel * 1.8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1, transition: { duration: DURATION.scene + 0.08, ease: EASE_OUT_EXPO } }}
      exit={{ opacity: 0, y: -travel * SWAP, rotate: -travel * 1.2, scale: 0.97, transition: { duration: DURATION.element, ease: 'easeIn' } }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ProductBento — "Aprendes haciendo".
 *
 * El dispositivo del centro queda ESTÁTICO. Con el scroll, las tarjetas de los lados se relevan
 * (salen unas, entran otras, en sentidos opuestos) y van explicando cómo funciona la página, en
 * tres escenas. Es lo único de la landing ligado al scroll: aquí el movimiento explica algo.
 *
 * Lo que sale y entra NO es información exclusiva: la lista completa de escenas está siempre en
 * el DOM. Se ve en móvil y con prefers-reduced-motion (sin sticky ni movimiento), y en
 * escritorio queda oculta a la vista pero legible para lectores de pantalla.
 */
export default function ProductBento() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const selectStep = useCallback((next: number) => {
    const safeStep = Math.min(LAST, Math.max(0, next));
    setStep((current) => {
      if (safeStep === current) return current;
      setDirection(safeStep > current ? 1 : -1);
      return safeStep;
    });
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    selectStep(Math.floor(v * HOW_SCENES.length));
  });

  const scene: HowScene = HOW_SCENES[step];
  const palette = SCENE_PALETTES[step];

  /** Lleva la página a la mitad del tramo de una escena (para quien prefiere pulsar a hacer scroll). */
  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const travel = el.offsetHeight - window.innerHeight;
    selectStep(i);
    window.scrollTo({ top: top + (travel * (i + 0.5)) / HOW_SCENES.length, behavior: reduced ? 'auto' : 'smooth' });
  }

  return (
    <section
      id="como-funciona"
      ref={ref}
      className={`lp-section lp-how${reduced ? ' lp-how--static' : ''}`}
      aria-labelledby="producto-titulo"
    >
      <div className="lp-how-stage">
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

          <div className="lp-bento lp-how-grid">
            {/* Lado izquierdo: dos tarjetas que se relevan (solo escritorio con movimiento) */}
            <div className="lp-bento-side lp-how-side" aria-hidden="true">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <SwapGroup id={scene.id} direction={direction} side="left" palette={palette}>
                  {scene.left.map((t, i) => (
                    <motion.div
                      key={t.pill}
                      initial={{ opacity: 0, y: 12, rotate: i === 0 ? -1.2 : 1.2 }}
                      animate={{ opacity: 1, y: 0, rotate: 0, transition: { delay: staggerDelay(i) + 0.08, duration: DURATION.scene, ease: EASE_OUT_EXPO } }}
                    >
                      <Tile tile={t} />
                    </motion.div>
                  ))}
                </SwapGroup>
              </AnimatePresence>
            </div>

            {/* Centro: el producto, siempre quieto */}
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

            {/* Lado derecho: una tarjeta alta que se releva en sentido contrario */}
            <div className="lp-how-side lp-how-side--right" aria-hidden="true">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <SwapGroup id={scene.id} direction={direction} side="right" palette={palette}>
                  <Tile tile={scene.right} center />
                </SwapGroup>
              </AnimatePresence>
            </div>
          </div>

          {/* Indicador de escena: también permite avanzar sin hacer scroll (teclado, toque) */}
          <div className="lp-how-steps" role="group" aria-label="Escenas de cómo funciona">
            {HOW_SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className="lp-how-step"
                aria-current={i === step ? 'step' : undefined}
                onClick={() => goTo(i)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Todas las escenas, completas: móvil, reduced-motion y lectores de pantalla */}
          <div className="lp-how-list">
            {HOW_SCENES.map((s) => (
              <div key={s.id} className="lp-how-scene">
                <h3 className="lp-how-scene-title">{s.label}</h3>
                <div className="lp-how-scene-tiles">
                  {s.left.map((t) => (
                    <Tile key={t.pill} tile={t} />
                  ))}
                  <Tile tile={s.right} center />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
