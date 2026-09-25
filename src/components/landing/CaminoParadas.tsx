'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO } from '@/lib/motion';
import { MODULOS } from '@/content/modulos';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import './landing.css';
import './camino.css';

// El tronco común (RUTA-DE-APRENDIZAJE.md §3): los cuatro módulos que ve todo el mundo,
// en el orden en que le sirven a cualquiera. El Módulo 1 es el único con temario propio.
const TRONCO = MODULOS.slice(0, 4);

// Las dos ramas nacen después del tronco: "ya estoy trabajando" (5-7) y "quiero que mi
// plata crezca" (8-10). Aquí solo se nombran — sus paradas llegan cuando tengan temario.
const RAMA_TRABAJO = MODULOS.slice(4, 7);
const RAMA_INVERSION = MODULOS.slice(7, 10);

/**
 * CaminoParadas — "Una ruta que empieza por lo que ya vives."
 *
 * Los cuatro módulos del tronco común, en una lista ordenada (el número de parada es
 * información real). La línea que las une se dibuja con el scroll (decorativa,
 * aria-hidden); con reduced motion aparece completa de una vez. El Módulo 1 es la única
 * parada disponible y se despliega en los 10 temas literales del temario. Debajo, las dos
 * ramas futuras se nombran por su nombre real de RUTA-DE-APRENDIZAJE.md, sin inventar
 * paradas que todavía no existen.
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
          Una ruta que empieza por lo que ya vives.
        </h2>
        <p className="lp-lead">
          Los primeros cuatro módulos son para cualquiera. Ya puedes empezar el primero; los demás se
          están preparando.
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
            {TRONCO.map((m) =>
              m.numero === 1 ? (
                <li key={m.numero} className="cam-parada cam-parada--grande">
                  <span className="cam-dot" aria-hidden="true" />
                  <div className="cam-card cam-card--disponible">
                    <p className="cam-numero">Parada {m.numero}</p>
                    <h3 className="cam-titulo">{m.nombre}</h3>
                    <p className="cam-descripcion">{m.pregunta}</p>
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
                      <Link href="/modulo/1" className="lp-btn lp-btn--primary">
                        Empieza gratis
                      </Link>
                    </div>
                  </div>
                </li>
              ) : (
                // Paradas 2-4: fila compacta (título y estado en la misma línea, sin
                // pregunta — están en preparación, sin relleno). Una sola superficie
                // neutra para las tres: nada de colores por módulo (SPEC §6).
                <li key={m.numero} className="cam-parada">
                  <span className="cam-dot" aria-hidden="true" />
                  <div className="cam-card cam-card--compacta">
                    <p className="cam-numero">Parada {m.numero}</p>
                    <div className="cam-compacta-fila">
                      <h3 className="cam-titulo">{m.nombre}</h3>
                      <span className="cam-estado">En preparación</span>
                    </div>
                  </div>
                </li>
              )
            )}
          </ol>
        </div>

        <div className="cam-ramas" data-aparece="subir">
          <p className="cam-ramas-intro">
            Después, dos ramas: si ya trabajas y si quieres que tu plata crezca.
          </p>
          <div className="cam-ramas-grid">
            <div className="cam-rama">
              <p className="cam-rama-eyebrow">Si ya trabajas</p>
              <ul className="cam-rama-lista">
                {RAMA_TRABAJO.map((m) => (
                  <li key={m.numero}>{m.nombre}</li>
                ))}
              </ul>
            </div>
            <div className="cam-rama">
              <p className="cam-rama-eyebrow">Si quieres que tu plata crezca</p>
              <ul className="cam-rama-lista">
                {RAMA_INVERSION.map((m) => (
                  <li key={m.numero}>{m.nombre}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
