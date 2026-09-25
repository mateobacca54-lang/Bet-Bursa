'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO } from '@/lib/motion';
import './metodo.css';

const PASOS = [
  {
    id: 'ahorrar',
    accion: 'Ahorras',
    titulo: 'Apartas $100.000 al mes',
    cifra: '$1.200.000',
    explicacion: 'Después de 12 meses, la suma de tus aportes es $1.200.000. Tienes esa plata guardada para usarla cuando la necesites.',
  },
  {
    id: 'invertir',
    accion: 'Inviertes',
    titulo: 'Inviertes los mismos aportes',
    cifra: 'Puede subir o bajar',
    explicacion: 'Si esos mismos $100.000 mensuales van a una inversión, buscas que crezcan. El resultado no está asegurado: podrías terminar con más o con menos de lo que pusiste.',
  },
] as const;

/** Una escena transparente: los aportes pasan del ahorro a la inversión. */
function DineroIlustrado({ paso, reduced }: { paso: number; reduced: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { once: true, amount: 0.35 });
  const transition = reduced
    ? { duration: 0.1 }
    : { duration: DURATION.story, ease: EASE_OUT_EXPO };

  return (
    <div
      className="met-money-stage"
      ref={stageRef}
      role="img"
      aria-label={paso === 0
        ? 'Una alcancía transparente guarda tus aportes.'
        : 'Los mismos aportes pasan a una inversión cuyo valor puede cambiar.'}
    >
      <motion.div
        className="met-money-object met-money-object--saving"
        initial={false}
        animate={{ opacity: paso === 0 ? 1 : 0, x: paso === 0 ? 0 : '-32%', scale: paso === 0 ? 1 : 0.87 }}
        transition={transition}
        aria-hidden="true"
      >
        <div className="met-money-crop">
          <Image src="/illustrations/ahorro-inversion-bursa-v2.png" alt="" width={1536} height={1024} sizes="(max-width: 899px) 85vw, 44vw" draggable={false} />
        </div>
      </motion.div>
      <motion.div
        className="met-money-object met-money-object--investing"
        initial={false}
        animate={{ opacity: paso === 1 ? 1 : 0, x: paso === 1 ? 0 : '32%', scale: paso === 1 ? 1 : 0.87 }}
        transition={transition}
        aria-hidden="true"
      >
        <div className="met-money-crop">
          <Image src="/illustrations/ahorro-inversion-bursa-v2.png" alt="" width={1536} height={1024} sizes="(max-width: 899px) 85vw, 44vw" draggable={false} />
        </div>
      </motion.div>
      {!reduced && inView && paso === 1 && [0, 1, 2].map((index) => (
        <motion.span
          key={`aporte-${index}`}
          className="met-moving-coin"
          initial={{ opacity: 0, x: -100, y: 35, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], x: [-100, -35, 50, 125], y: [35, -30, -42, 28], scale: [0.8, 1, 1, 0.75] }}
          transition={{ duration: DURATION.story, delay: index * 0.1, ease: EASE_OUT_EXPO }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function MetodoDemo() {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [paso, setPaso] = useState(0);
  const [automatico, setAutomatico] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    const actualizar = () => setAutomatico(query.matches);
    actualizar();
    query.addEventListener('change', actualizar);
    return () => query.removeEventListener('change', actualizar);
  }, []);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (automatico) setPaso(Math.min(PASOS.length - 1, Math.floor(value * PASOS.length)));
  });

  const elegirPaso = (index: number) => {
    if (!automatico || !trackRef.current) {
      setPaso(index);
      return;
    }
    const track = trackRef.current;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const recorrido = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + recorrido * ((index + 0.5) / PASOS.length), behavior: 'smooth' });
  };

  return (
    <section id="como-aprendes" className="lp-section met-section" aria-labelledby="met-titulo">
      <div className="met-track" ref={trackRef}>
        <div className="met-sticky">
          <div className="lp-wrap met-sticky-inner">
            <div className="met-heading">
              <h2 id="met-titulo" className="lp-title">La misma plata, dos decisiones.</h2>
              <p className="lp-lead">Apartas $100.000 cada mes. Mira qué cambia cuando ahorras o inviertes.</p>
            </div>
            <div className="met-scene">
              <div className="met-steps" role="group" aria-label="Compara ahorrar e invertir">
                {PASOS.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className="met-step"
                    aria-pressed={paso === index}
                    onClick={() => elegirPaso(index)}
                  >
                    <span className="met-step-index" aria-hidden="true">{index + 1}</span>
                    {item.accion}
                  </button>
                ))}
              </div>
              <div className="met-visual">
                <DineroIlustrado paso={paso} reduced={reduced} />
                <p className="met-visual-caption">
                  {paso === 0 && 'Guardas los mismos 12 aportes en un solo lugar.'}
                  {paso === 1 && 'Los mismos aportes: su valor puede subir o bajar.'}
                </p>
              </div>
              <div className="met-copy">
                <p className="lp-sr-only" role="status" aria-live="polite">{PASOS[paso].accion}: {PASOS[paso].cifra}</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={PASOS[paso].id}
                    className="met-step-copy"
                    initial={reduced ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -12 }}
                    transition={reduced ? { duration: 0 } : { duration: DURATION.scene, ease: EASE_OUT_EXPO }}
                  >
                    <h3>{PASOS[paso].titulo}</h3>
                    <p className={`met-amount${paso === 1 ? ' met-amount--words' : ''}`}>{PASOS[paso].cifra}</p>
                    <p>{PASOS[paso].explicacion}</p>
                  </motion.div>
                </AnimatePresence>
                <p className="met-disclaimer">
                  {paso === 0 ? 'Suma de aportes, sin intereses.' : 'Una inversión puede dar ganancias o pérdidas.'}
                </p>
                <Link href="/inicio" className="lp-btn lp-btn--secondary met-cta">Empieza gratis</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lp-wrap met-context">
        <p className="met-context-label">En ambos caminos</p>
        <h3>Lo que puedes comprar también cambia.</h3>
        <p>Si los precios suben, la misma cantidad de plata puede alcanzarte para menos. Por eso importa mirar cuánto tienes y cuánto puedes comprar.</p>
      </div>
    </section>
  );
}
