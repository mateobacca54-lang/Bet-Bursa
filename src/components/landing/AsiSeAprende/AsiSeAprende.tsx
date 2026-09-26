'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger, registerGsap } from '@/lib/gsap';
import { pasoActivo } from '@/lib/pasoActivo';
import '../landing.css';
import './asi-se-aprende.css';

interface Paso {
  id: string;
  titulo: string;
  cuerpo: string;
  src: string;
  alt: string;
}

// Las tres pantallas son capturas reales de la Lección 2 (la inflación y el precio del
// almuerzo), tomadas del propio flujo predecir → interactuar → entender de WidgetShell.
// No se dibujan: son la app tal cual la ve quien la usa (DIRECCION-LANDING.md §5.5).
const PASOS: readonly Paso[] = [
  {
    id: 'predices',
    titulo: 'Predices.',
    cuerpo: 'Antes de ver la respuesta, eliges qué crees que va a pasar.',
    src: '/landing/app-predices.webp',
    alt: 'Pantalla de una lección de Bursa: antes de mover el slider, Monedita invita a predecir en qué año el almuerzo de $8.000 va a costar más de $15.000.',
  },
  {
    id: 'lo-ves',
    titulo: 'Lo ves.',
    cuerpo: 'Mueves algo real —un año, un peso— y el resultado cambia frente a tus ojos.',
    src: '/landing/app-lo-ves.webp',
    alt: 'La misma lección con el slider movido al año 2020: la gráfica de barras muestra cómo sube el precio del almuerzo a medida que pasan los años.',
  },
  {
    id: 'entiendes',
    titulo: 'Entiendes por qué.',
    cuerpo: 'Monedita te explica la respuesta con la pregunta todavía fresca.',
    src: '/landing/app-entiendes.webp',
    alt: 'La misma lección con la respuesta correcta: un aviso con un check y Monedita celebrando explican por qué la inflación hace que el almuerzo cueste más de $15.000 en 2025.',
  },
];

/**
 * AsiSeAprende — capítulo 5 de la landing: "Así se aprende en Bursa."
 *
 * En escritorio (≥900px) y sin `prefers-reduced-motion`, el capítulo se ancla una pantalla:
 * a la izquierda los tres momentos, a la derecha el celular. El scroll recorre los tres
 * (`pasoActivo`) y la pantalla del celular cruza a la captura de ese paso; el paso activo
 * se lee entero y los otros bajan de opacidad (jerarquía, no decoración). Cada paso es un
 * botón que lleva el scroll a su tramo, así que también se recorre con teclado.
 *
 * En móvil o con movimiento reducido no hay ancla: cada paso muestra su propia captura
 * (AGENTS.md — se quita el movimiento, nunca la información).
 */
export default function AsiSeAprende() {
  const [modoInmersivo, setModoInmersivo] = useState(false);
  const [activo, setActivo] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    const actualizar = () => setModoInmersivo(query.matches);
    actualizar();
    query.addEventListener('change', actualizar);
    return () => query.removeEventListener('change', actualizar);
  }, []);

  useGSAP(
    () => {
      if (!modoInmersivo) return;
      registerGsap();
      const section = sectionRef.current;
      const pin = pinRef.current;
      if (!section || !pin) return;

      let ultimo = -1;
      const st = ScrollTrigger.create({
        trigger: section,
        start: () => `top ${Math.round(document.querySelector('.lp-nav')?.getBoundingClientRect().height ?? 0)}px`,
        end: () => `+=${Math.round(window.innerHeight * 1.6)}`,
        pin,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = pasoActivo(self.progress, PASOS.length);
          if (i !== ultimo) {
            ultimo = i;
            setActivo(i);
          }
        },
      });
      triggerRef.current = st;
      return () => {
        st.kill();
        triggerRef.current = null;
      };
    },
    { scope: sectionRef, dependencies: [modoInmersivo] }
  );

  function irAPaso(i: number) {
    const st = triggerRef.current;
    if (!st) return;
    const destino = st.start + ((i + 0.5) / PASOS.length) * (st.end - st.start);
    window.scrollTo({ top: destino, behavior: 'smooth' });
  }

  return (
    <section ref={sectionRef} id="como-aprendes-app" className="lp-section asi-section" aria-labelledby="asi-titulo">
      <div ref={pinRef} className="asi-pin">
        <div className="lp-wrap asi-grid">
          <div className="asi-copy">
            <div className="asi-heading">
              <h2 id="asi-titulo" className="lp-title">
                Así se aprende en Bursa.
              </h2>
              <p className="lp-lead">Los tres momentos de una lección real, tal como se ven en tu pantalla.</p>
            </div>

            <ol className="asi-steps">
              {PASOS.map((paso, i) => (
                <li key={paso.id} className="asi-step" data-active={!modoInmersivo || activo === i}>
                  {modoInmersivo ? (
                    <button
                      type="button"
                      className="asi-step-boton"
                      aria-current={activo === i ? 'step' : undefined}
                      onClick={() => irAPaso(i)}
                    >
                      <span className="asi-step-num" aria-hidden="true">
                        0{i + 1}
                      </span>
                      <span className="asi-step-title">{paso.titulo}</span>
                      <span className="asi-step-body">{paso.cuerpo}</span>
                    </button>
                  ) : (
                    <>
                      <p className="asi-step-num" aria-hidden="true">
                        0{i + 1}
                      </p>
                      <h3 className="asi-step-title">{paso.titulo}</h3>
                      <p className="asi-step-body">{paso.cuerpo}</p>
                      <div className="asi-step-shot">
                        <Image
                          src={paso.src}
                          alt={paso.alt}
                          width={1170}
                          height={2532}
                          sizes="(min-width: 640px) 280px, 72vw"
                          quality={90}
                        />
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {modoInmersivo && (
            <div className="asi-phone-wrap">
              <div className="asi-phone" role="img" aria-label={PASOS[activo].alt}>
                <span className="asi-phone-notch" />
                <div className="asi-phone-screen">
                  {PASOS.map((paso, i) => (
                    <Image
                      key={paso.id}
                      src={paso.src}
                      alt=""
                      fill
                      sizes="360px"
                      quality={90}
                      className="asi-screen"
                      data-active={activo === i}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
