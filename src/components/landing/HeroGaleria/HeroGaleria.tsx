'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger, registerGsap } from '@/lib/gsap';
import { useCtaProgreso } from '@/lib/useCtaProgreso';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import '../landing.css';
import './hero-galeria.css';

const ESCRITORIO = '(min-width: 900px)';

/**
 * HeroGaleria — la primera pantalla de la landing v3 (docs/PLAN-LANDING-V3.md §2 y §3).
 *
 * Una galería: el titular gigante arriba, la moneda de vidrio y oro sobre su pedestal en el
 * centro, y una cápsula flotante con lo único que hay que saber para empezar (es gratis y
 * son lecciones cortas). En escritorio el héroe se ancla y el scroll hace girar la moneda
 * hasta que te mira de frente: es la entrada a la galería, antes de recorrer sus pedestales.
 *
 * En celular, con movimiento reducido o con ahorro de datos no hay video ni ancla: se ve la
 * foto de la moneda, con la misma información. El titular es texto (lo primero que pinta la
 * página), nunca depende del video.
 */
export default function HeroGaleria() {
  const cta = useCtaProgreso();
  const reduced = usePrefersReducedMotion();
  const [conVideo, setConVideo] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const query = window.matchMedia(ESCRITORIO);
    const conexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const actualizar = () => setConVideo(query.matches && !reduced && !conexion?.saveData);
    actualizar();
    query.addEventListener('change', actualizar);
    return () => query.removeEventListener('change', actualizar);
  }, [reduced]);

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
        end: () => `+=${Math.round(window.innerHeight * 1.4)}`,
        pin,
        pinSpacing: true,
        invalidateOnRefresh: true,
        // Se crea después que los capítulos (espera a saber si hay video), pero está antes en
        // la página: se calcula primero para que los anclajes de abajo cuenten su espacio.
        refreshPriority: 1,
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
    <section ref={sectionRef} id="inicio" className="hg" aria-labelledby="hg-titulo">
      <div ref={pinRef} className="hg-pin">
        <div className="lp-wrap hg-contenido">
          <p className="hg-marca">Bursa · escuela de plata</p>
          <h1 id="hg-titulo" className="hg-titulo">
            Entiende tu <span className="lp-acento">plata</span>.
          </h1>

          <div className="hg-escena" aria-hidden="true">
            {conVideo ? (
              <video
                ref={videoRef}
                className="hg-media"
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                disableRemotePlayback
                tabIndex={-1}
                poster="/landing/moneda-gira-inicio.webp"
                width={1200}
                height={800}
              >
                <source src="/landing/moneda-gira.webm" type="video/webm" />
                <source src="/landing/moneda-gira.mp4" type="video/mp4" />
              </video>
            ) : (
              <Image
                className="hg-media hg-media--foto"
                src="/landing/moneda.webp"
                alt=""
                width={1800}
                height={1838}
                sizes="(max-width: 899px) 86vw, 600px"
                quality={90}
                priority
                draggable={false}
              />
            )}

            <div className="hg-capsula">
              <p className="hg-capsula-texto">
                <strong>Gratis</strong>
                <span>10 lecciones de 3 minutos</span>
              </p>
              <Link href={cta.href} className="lp-btn lp-btn--primary hg-capsula-cta">
                {cta.label}
              </Link>
            </div>
          </div>

          <div className="hg-pie">
            <p className="lp-lead hg-lead">
              Aprende con ejemplos de la vida diaria. Tú eliges qué crees que pasará y descubres por qué.
            </p>
            <p className="hg-confianza">
              <a href="#como-aprendes-app" className="hg-enlace">
                Ver cómo aprendes
              </a>
              <span aria-hidden="true">·</span> Hecho en Colombia <span aria-hidden="true">·</span> Con datos del
              Banco de la República
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
