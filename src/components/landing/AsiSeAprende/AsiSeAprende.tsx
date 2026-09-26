'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import '../landing.css';
import './asi-se-aprende.css';

const ACTIVIDADES = [
  { id: 'almuerzo', titulo: 'Mueves el tiempo.', cuerpo: 'Arrastras los años y ves cuánto sube tu almuerzo.' },
  { id: 'interes', titulo: 'Predices y comparas.', cuerpo: 'Adivinas cuánto crece tu plata y ves cuánto crece de verdad.' },
] as const;

/**
 * AsiSeAprende — capítulo "Así se aprende en Bursa.": dos celulares con pantallas
 * reales de la app flotan y giran sobre la cinta de la marca (referencia: la landing
 * de Slush). Es un video (tres giros generados con Higgsfield, unidos en un bucle) con
 * la cinta y el papel ya en el cuadro: la sección solo lo reproduce a sangre, en
 * bucle, mientras está en pantalla.
 *
 * Con movimiento reducido el video no arranca solo: queda el póster (los dos celulares
 * con las actividades resueltas) y el botón para reproducirlo a mano.
 */
export default function AsiSeAprende() {
  const reducirMovimiento = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  // `null` = el usuario no ha tocado el botón: manda la preferencia del sistema.
  const [pausadoManual, setPausadoManual] = useState<boolean | null>(null);
  const pausado = pausadoManual ?? reducirMovimiento;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entrada]) => setVisible(entrada.isIntersecting), { threshold: 0.25 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && !pausado) {
      video.play().catch(() => {
        // Autoplay bloqueado (p. ej. ahorro de datos): queda el póster y el botón.
      });
    } else {
      video.pause();
    }
  }, [visible, pausado]);

  return (
    <section id="como-aprendes-app" ref={sectionRef} className="lp-section asi-section" aria-labelledby="asi-titulo">
      <div className="asi-escena">
        <video
          ref={videoRef}
          className="asi-video"
          muted
          loop
          playsInline
          preload="metadata"
          poster="/landing/celulares-poster.webp"
          width={1920}
          height={1080}
          aria-hidden="true"
        >
          <source src="/landing/celulares.webm" type="video/webm" />
          <source src="/landing/celulares.mp4" type="video/mp4" />
        </video>
        <p className="lp-sr-only">
          Dos celulares con la app de Bursa flotan y giran sobre una cinta naranja. Uno muestra cuánto sube el precio
          del almuerzo entre 2015 y 2025; el otro compara una predicción con la curva real del interés compuesto.
        </p>

        <div className="lp-wrap asi-encabezado">
          <h2 id="asi-titulo" className="lp-title">
            Así se aprende en Bursa.
          </h2>
          <p className="lp-lead">Cada lección es una actividad: mueves algo y ves qué le pasa a tu plata.</p>
        </div>
      </div>

      <div className="lp-wrap asi-pie">
        <ul className="asi-actividades">
          {ACTIVIDADES.map((a) => (
            <li key={a.id} className="asi-actividad">
              <span className="asi-actividad-titulo">{a.titulo}</span>
              <span className="asi-actividad-cuerpo">{a.cuerpo}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="asi-pausa"
          onClick={() => setPausadoManual(!pausado)}
          aria-pressed={pausado}
          aria-label={pausado ? 'Reproducir el video' : 'Pausar el video'}
        >
          {pausado ? <ReproducirIcono /> : <PausaIcono />}
        </button>
      </div>
    </section>
  );
}

function PausaIcono() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}

function ReproducirIcono() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 1.5v11l9-5.5-9-5.5z" fill="currentColor" />
    </svg>
  );
}
