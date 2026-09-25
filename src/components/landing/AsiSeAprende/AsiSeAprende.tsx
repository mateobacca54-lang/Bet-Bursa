'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
 * En escritorio (≥900px) y sin `prefers-reduced-motion`, el celular queda fijo (sticky) y
 * su pantalla cruza en opacidad a la captura del paso activo, decidido por qué paso ocupa
 * el centro de la ventana (IntersectionObserver). En móvil o con movimiento reducido, cada
 * paso muestra su propia captura, sin scroll fijo ni cruce (AGENTS.md: bajo reduced motion
 * se quita el movimiento, nunca la información).
 */
export default function AsiSeAprende() {
  const [modoInmersivo, setModoInmersivo] = useState(false);
  const [activo, setActivo] = useState(0);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    const actualizar = () => setModoInmersivo(query.matches);
    actualizar();
    query.addEventListener('change', actualizar);
    return () => query.removeEventListener('change', actualizar);
  }, []);

  useEffect(() => {
    if (!modoInmersivo) return;
    const elementos = stepRefs.current.filter((el): el is HTMLLIElement => el !== null);
    if (elementos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibles = entries.filter((entry) => entry.isIntersecting);
        if (visibles.length === 0) return;
        const masVisible = visibles.reduce((a, b) => (a.intersectionRatio >= b.intersectionRatio ? a : b));
        const indice = elementos.indexOf(masVisible.target as HTMLLIElement);
        if (indice !== -1) setActivo(indice);
      },
      // Banda central: un paso se vuelve activo cuando cruza el medio de la ventana.
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elementos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [modoInmersivo]);

  return (
    <section id="como-aprendes-app" className="lp-section asi-section" aria-labelledby="asi-titulo">
      <div className="lp-wrap asi-grid">
        <div className="asi-copy">
          <div className="asi-heading">
            <h2 id="asi-titulo" className="lp-title">
              Así se aprende en Bursa.
            </h2>
            <p className="lp-lead">Mira los tres momentos de una lección real, tal como se ven en tu pantalla.</p>
          </div>

          <ol className="asi-steps">
            {PASOS.map((paso, i) => (
              <li
                key={paso.id}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="asi-step"
                data-aparece="subir"
              >
                <p className="asi-step-num" aria-hidden="true">
                  0{i + 1}
                </p>
                <h3 className="asi-step-title">{paso.titulo}</h3>
                <p className="asi-step-body">{paso.cuerpo}</p>

                {!modoInmersivo && (
                  <div className="asi-step-shot">
                    <Image src={paso.src} alt={paso.alt} width={390} height={844} sizes="(min-width: 640px) 260px, 68vw" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>

        {modoInmersivo && (
          <div className="asi-phone-wrap">
            <div className="asi-phone" aria-hidden="true">
              <span className="asi-phone-notch" />
              <div className="asi-phone-screen">
                {PASOS.map((paso, i) => (
                  <Image
                    key={paso.id}
                    src={paso.src}
                    alt=""
                    fill
                    sizes="300px"
                    className="asi-screen"
                    data-active={activo === i}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
