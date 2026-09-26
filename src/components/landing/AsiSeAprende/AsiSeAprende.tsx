'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger, registerGsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import '../landing.css';
import './asi-se-aprende.css';

const ESCRITORIO = '(min-width: 900px)';

const ACTIVIDADES = [
  { id: 'almuerzo', titulo: 'Mueves el tiempo.', cuerpo: 'Arrastras los años y ves cuánto sube tu almuerzo.' },
  { id: 'interes', titulo: 'Predices y comparas.', cuerpo: 'Adivinas cuánto crece tu plata y ves cuánto crece de verdad.' },
] as const;

/**
 * AsiSeAprende — capítulo "Así se aprende en Bursa.": dos celulares con pantallas
 * reales de la app flotan y giran sobre la cinta de la marca (referencia: la landing
 * de Slush). El video (tres giros generados con Higgsfield) avanza con el scroll, igual
 * que la moneda de HeroGaleria: en escritorio la sección se ancla y el progreso del
 * scroll fija el cuadro. En celular, con movimiento reducido o ahorro de datos se ve el
 * último cuadro como imagen fija, con la misma información.
 */
export default function AsiSeAprende() {
  const reducirMovimiento = usePrefersReducedMotion();
  const [conVideo, setConVideo] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const query = window.matchMedia(ESCRITORIO);
    const conexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const actualizar = () => setConVideo(query.matches && !reducirMovimiento && !conexion?.saveData);
    actualizar();
    query.addEventListener('change', actualizar);
    return () => query.removeEventListener('change', actualizar);
  }, [reducirMovimiento]);

  useGSAP(
    () => {
      if (!conVideo) return;
      registerGsap();
      const section = sectionRef.current;
      const pin = pinRef.current;
      const video = videoRef.current;
      if (!section || !pin || !video) return;

      const aplicar = (progreso: number) => {
        if (video.readyState < 1 || !Number.isFinite(video.duration)) return;
        const t = progreso * video.duration;
        if (Math.abs(video.currentTime - t) > 0.01) video.currentTime = t;
      };

      const st = ScrollTrigger.create({
        trigger: section,
        start: () => `top ${Math.round(document.querySelector('.lp-nav')?.getBoundingClientRect().height ?? 0)}px`,
        end: () => `+=${Math.round(window.innerHeight * 2.5)}`,
        pin,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => aplicar(self.progress),
      });
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      const alListo = () => aplicar(st.progress);
      video.addEventListener('loadedmetadata', alListo);
      return () => {
        video.removeEventListener('loadedmetadata', alListo);
        st.kill();
      };
    },
    { scope: sectionRef, dependencies: [conVideo] }
  );

  return (
    <section id="como-aprendes-app" ref={sectionRef} className="lp-section asi-section" aria-labelledby="asi-titulo">
      <div ref={pinRef} className="asi-pin" data-video={conVideo}>
        <div className="lp-wrap asi-encabezado">
          <h2 id="asi-titulo" className="lp-title">
            Así se aprende en Bursa.
          </h2>
          <p className="lp-lead">Cada lección es una actividad: mueves algo y ves qué le pasa a tu plata.</p>
        </div>

        <div className="asi-escena">
          {conVideo ? (
            <video
              ref={videoRef}
              className="asi-media"
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              tabIndex={-1}
              poster="/landing/celulares-poster.webp"
              width={1600}
              height={900}
              aria-hidden="true"
            >
              <source src="/landing/celulares.webm" type="video/webm" />
              <source src="/landing/celulares.mp4" type="video/mp4" />
            </video>
          ) : (
            <Image
              className="asi-media"
              src="/landing/celulares-poster.webp"
              alt=""
              width={1920}
              height={1080}
              sizes="100vw"
              quality={85}
            />
          )}
          <p className="lp-sr-only">
            Dos celulares con la app de Bursa flotan y giran sobre una cinta naranja. Uno muestra cuánto sube el precio
            del almuerzo entre 2015 y 2025; el otro compara una predicción con la curva real del interés compuesto.
          </p>
        </div>
      </div>

      <div className="lp-wrap">
        <ul className="asi-actividades">
          {ACTIVIDADES.map((a) => (
            <li key={a.id} className="asi-actividad">
              <span className="asi-actividad-titulo">{a.titulo}</span>
              <span className="asi-actividad-cuerpo">{a.cuerpo}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
