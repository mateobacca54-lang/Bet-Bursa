'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO } from '@/lib/motion';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import './landing.css';
import './camino.css';

interface ModuloCamino {
  numero: number;
  titulo: string;
  descripcion?: string;
  estado: 'disponible' | 'preparacion';
  /** Referencia a un token de color (tinte de módulo, §2 de la spec) */
  tinte: string;
}

const MODULOS: ModuloCamino[] = [
  {
    numero: 1,
    titulo: 'La plata',
    descripcion: 'Qué es el dinero, por qué cambian los precios y cómo tomar mejores decisiones.',
    estado: 'disponible',
    tinte: 'var(--brand-100)',
  },
  { numero: 2, titulo: 'Hacerla crecer', estado: 'preparacion', tinte: 'var(--gold-100)' },
  { numero: 3, titulo: 'El mercado', estado: 'preparacion', tinte: 'var(--scene-blue-50)' },
  { numero: 4, titulo: 'Las empresas', estado: 'preparacion', tinte: 'var(--sand-100)' },
  { numero: 5, titulo: 'El mundo', estado: 'preparacion', tinte: 'var(--brand-50)' },
  { numero: 6, titulo: 'Tu criterio', estado: 'preparacion', tinte: 'var(--sand-200)' },
];

/**
 * CaminoParadas — "Un camino de seis paradas."
 *
 * Seis paradas en una lista ordenada (el número de parada es información real).
 * La línea que las une se dibuja con el scroll (decorativa, aria-hidden); con
 * reduced motion aparece completa de una vez. El Módulo 1 es la única parada
 * disponible y se despliega en los 10 temas literales del temario.
 */
export default function CaminoParadas() {
  const reduced = usePrefersReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const [temasAbiertos, setTemasAbiertos] = useState(false);
  // 'start start' / 'end end': el trazo va de 0 a 1 entre "la lista empieza a la altura
  // de la ventana" y "el final de la lista llega al final de la ventana". Con 'end center'
  // el trazo dependía de cuánto contenido viniera después en la página (podía quedarse
  // sin completar si la sección fuera la última); así siempre llega a 1 al final del scroll.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start start', 'end end'] });

  return (
    <section id="camino" className="lp-section cam-section" aria-labelledby="cam-titulo">
      <div className="lp-wrap">
        <h2 id="cam-titulo" className="lp-title">
          Un camino de seis paradas.
        </h2>
        <p className="lp-lead">
          Empieza con la plata de cada día. El primer módulo ya está disponible; los siguientes se están preparando.
        </p>

        <div className="cam-track">
          <svg className="cam-line" viewBox="0 0 24 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M12 0 L12 100" className="cam-line-base" />
            <motion.path
              d="M12 0 L12 100"
              className="cam-line-progreso"
              style={{ pathLength: reduced ? 1 : scrollYProgress }}
            />
          </svg>

          <ol className="cam-list" ref={listRef}>
            {MODULOS.map((m) =>
              m.numero === 1 ? (
                <li key={m.numero} className="cam-parada cam-parada--grande">
                  <span className="cam-dot" aria-hidden="true" />
                  <div className="cam-card" style={{ background: m.tinte }}>
                    <p className="cam-numero">Parada {m.numero}</p>
                    <h3 className="cam-titulo">{m.titulo}</h3>
                    {m.descripcion && <p className="cam-descripcion">{m.descripcion}</p>}
                    <span className="cam-estado cam-estado--on">Disponible</span>

                    <div className="cam-modulo1-acciones">
                      <button
                        type="button"
                        className="cam-temas-btn"
                        aria-expanded={temasAbiertos}
                        onClick={() => setTemasAbiertos((v) => !v)}
                      >
                        {temasAbiertos ? 'Ocultar los 10 temas' : 'Ver los 10 temas'}
                      </button>
                      <AnimatePresence initial={false}>
                        {temasAbiertos && (
                          <motion.div
                            className="cam-temas-wrap"
                            initial={reduced ? false : { height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={reduced ? undefined : { height: 0, opacity: 0 }}
                            transition={{ duration: reduced ? 0 : DURATION.element, ease: EASE_OUT_EXPO }}
                          >
                            <ol className="cam-temas">
                              {TEMARIO_MODULO_1.map((t) => (
                                <li key={t.number}>{t.title}</li>
                              ))}
                            </ol>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <Link href="/inicio" className="lp-btn lp-btn--primary">
                        Empieza gratis
                      </Link>
                    </div>
                  </div>
                </li>
              ) : (
                // Paradas 2-6: fila compacta (título y estado en la misma línea, sin
                // descripción — están en propuesta, SPEC §6). La parada 1 es la única grande.
                <li key={m.numero} className="cam-parada">
                  <span className="cam-dot" aria-hidden="true" />
                  <div className="cam-card cam-card--compacta" style={{ background: m.tinte }}>
                    <p className="cam-numero">Parada {m.numero}</p>
                    <div className="cam-compacta-fila">
                      <h3 className="cam-titulo">{m.titulo}</h3>
                      <span className="cam-estado">En preparación</span>
                    </div>
                  </div>
                </li>
              )
            )}
          </ol>
        </div>
      </div>
    </section>
  );
}
