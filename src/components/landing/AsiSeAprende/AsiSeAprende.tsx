'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger, registerGsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { acercar, cuadroParaProgreso } from '@/lib/secuencia';
import '../landing.css';
import './asi-se-aprende.css';

const ESCRITORIO = '(min-width: 900px)';

/** Cuánto de la distancia que falta recorre el suavizado en cada cuadro (0..1). */
const FACTOR_SUAVIZADO = 0.18;
/** Bajo esta diferencia (segundos) no vale la pena reasignar video.currentTime. */
const UMBRAL_SEEK = 1 / 48;
/** Cuántos cuadros de la secuencia se descargan a la vez (ver scripts/secuencia-celulares.mjs). */
const CONCURRENCIA_CARGA = 6;
/** Cuadros que tiene public/landing/celulares-movil/ (generados por ese mismo script). */
const TOTAL_CUADROS_MOVIL = 185;

const ACTIVIDADES = [
  { id: 'almuerzo', titulo: 'Mueves el tiempo.', cuerpo: 'Arrastras los años y ves cuánto sube tu almuerzo.' },
  { id: 'interes', titulo: 'Predices y comparas.', cuerpo: 'Adivinas cuánto crece tu plata y ves cuánto crece de verdad.' },
] as const;

const VIDEO_ESCRITORIO = { mp4: '/landing/celulares.mp4', webm: '/landing/celulares.webm' } as const;
const POSTER = {
  escritorio: '/landing/celulares-poster.webp',
  movil: '/landing/celulares-movil-poster.webp',
} as const;

/** Ruta del cuadro `indice` (0-based) de la secuencia móvil: 0 → 0001.webp. */
function cuadroSrc(indice: number): string {
  return `/landing/celulares-movil/${String(indice + 1).padStart(4, '0')}.webp`;
}

/**
 * AsiSeAprende — capítulo "Así se aprende en Bursa.": dos celulares con pantallas
 * reales de la app flotan y giran sobre la cinta de la marca (referencia: la landing
 * de Slush). La sección se queda quieta al llegar y el scroll recorre tres giros
 * (generados con Higgsfield) de principio a fin; al terminar, la página sigue.
 * Con movimiento reducido o ahorro de datos se ve un cuadro fijo, con la misma
 * información.
 *
 * En escritorio se usa el video entero: se descarga como blob antes de conectarlo
 * (Safari no deja saltar a un cuadro que no ha bajado) y el scroll mueve
 * `video.currentTime`. En celular un video no sirve: cada seek en un H.264 con un
 * cuadro clave cada 0,5 s obliga a decodificar hasta 11 cuadros, e iOS encola esos
 * seeks — se ve a tirones. Por eso en celular se usa una SECUENCIA DE IMÁGENES
 * (public/landing/celulares-movil/, generada por scripts/secuencia-celulares.mjs)
 * dibujada a mano en un <canvas>: cada cuadro es independiente, no hay nada que
 * decodificar de más.
 *
 * En los dos casos el progreso del scroll es solo un OBJETIVO: un bucle
 * requestAnimationFrame (activo solo mientras la sección está pineada) lo persigue
 * con `acercar()` (src/lib/secuencia.ts) en vez de aplicarlo en crudo, para que un
 * scroll brusco no salte de golpe. En escritorio esto además evita encolar seeks:
 * solo se reasigna `video.currentTime` si el video no está buscando ya y la
 * diferencia importa.
 */
export default function AsiSeAprende() {
  const reducirMovimiento = usePrefersReducedMotion();
  const [conVideo, setConVideo] = useState(false);
  const [esEscritorio, setEsEscritorio] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const query = window.matchMedia(ESCRITORIO);
    const conexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const actualizar = () => {
      setEsEscritorio(query.matches);
      setConVideo(!reducirMovimiento && !conexion?.saveData);
    };
    actualizar();
    query.addEventListener('change', actualizar);
    return () => query.removeEventListener('change', actualizar);
  }, [reducirMovimiento]);

  useGSAP(
    () => {
      if (!conVideo) return;
      registerGsap();
      // iOS cambia el alto del viewport al ocultar/mostrar la barra de direcciones;
      // sin esto ScrollTrigger se recalcula solo por eso y el pin salta.
      ScrollTrigger.config({ ignoreMobileResize: true });

      const section = sectionRef.current;
      const pin = pinRef.current;
      if (!section || !pin) return;

      let vivo = true;
      let activo = false;
      let rafId: number | null = null;
      let objetivoProgreso = 0;

      const detener = () => {
        activo = false;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };
      // Al soltarse la sección, el bucle sigue hasta alcanzar el cuadro final (o el
      // inicial, al subir) y ahí se apaga: si se corta de golpe, un scroll rápido deja
      // la animación congelada a medias.
      const soltar = () => {
        activo = false;
      };

      const opcionesScroll = {
        trigger: section,
        start: () => `top ${Math.round(document.querySelector('.lp-nav')?.getBoundingClientRect().height ?? 0)}px`,
        end: () => `+=${Math.round(window.innerHeight * 2.5)}`,
        pin,
        pinSpacing: true,
        invalidateOnRefresh: true,
        anticipatePin: 1 as const,
      };

      // === Escritorio: <video>, con el mismo suavizado pero sin cambiar de fuente ===
      if (esEscritorio) {
        const video = videoRef.current;
        if (!video) return;
        let tiempoActual = 0;
        let objeto: string | null = null;

        const tick = () => {
          let llego = true;
          if (video.readyState >= 1 && Number.isFinite(video.duration)) {
            const objetivoTiempo = objetivoProgreso * video.duration;
            tiempoActual = acercar(tiempoActual, objetivoTiempo, FACTOR_SUAVIZADO);
            if (!video.seeking && Math.abs(video.currentTime - tiempoActual) > UMBRAL_SEEK) {
              video.currentTime = tiempoActual;
            }
            llego =
              tiempoActual === objetivoTiempo &&
              !video.seeking &&
              Math.abs(video.currentTime - objetivoTiempo) <= UMBRAL_SEEK;
          }
          if (!activo && llego) {
            rafId = null;
            return;
          }
          rafId = requestAnimationFrame(tick);
        };
        const iniciar = () => {
          if (activo) return;
          activo = true;
          if (rafId === null) {
            tiempoActual = video.currentTime;
            rafId = requestAnimationFrame(tick);
          }
        };

        // Descarga entera antes de conectar el video: Safari en iPhone no deja saltar a
        // un cuadro que no ha bajado, y recorrerlo con el dedo lo exige.
        const url = video.canPlayType('video/mp4; codecs="avc1.640028"') ? VIDEO_ESCRITORIO.mp4 : VIDEO_ESCRITORIO.webm;
        fetch(url)
          .then((r) => r.blob())
          .then((blob) => {
            if (!vivo) return;
            objeto = URL.createObjectURL(blob);
            video.src = objeto;
          })
          .catch(() => {
            // Sin red: queda el póster, con la misma información.
          });

        const st = ScrollTrigger.create({
          ...opcionesScroll,
          onUpdate: (self) => {
            objetivoProgreso = self.progress;
            // Un salto que cruza la sección entera no la activa: igual hay que ir al cuadro nuevo.
            if (rafId === null) rafId = requestAnimationFrame(tick);
          },
          onToggle: (self) => {
            if (self.isActive) iniciar();
            else soltar();
          },
        });
        ScrollTrigger.sort();
        ScrollTrigger.refresh();

        return () => {
          vivo = false;
          detener();
          if (objeto) URL.revokeObjectURL(objeto);
          st.kill();
        };
      }

      // === Celular: <canvas> con la secuencia de imágenes ===
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bitmaps: (ImageBitmap | null)[] = new Array(TOTAL_CUADROS_MOVIL).fill(null);
      const controladores: AbortController[] = [];
      let cuadroDibujado = -1;
      let progresoActual = 0;

      /** Dibuja el cuadro `indice`, o el cargado más cercano si ese todavía no llegó. */
      const dibujar = (indice: number) => {
        let mejor = bitmaps[indice] ? indice : -1;
        for (let d = 1; mejor === -1 && d < TOTAL_CUADROS_MOVIL; d++) {
          const abajo = indice - d;
          const arriba = indice + d;
          if (abajo >= 0 && bitmaps[abajo]) mejor = abajo;
          else if (arriba < TOTAL_CUADROS_MOVIL && bitmaps[arriba]) mejor = arriba;
        }
        if (mejor === -1) return;
        const bitmap = bitmaps[mejor];
        if (!bitmap) return;
        const cw = canvas.width;
        const ch = canvas.height;
        if (cw === 0 || ch === 0) return;
        const escala = Math.min(cw / bitmap.width, ch / bitmap.height);
        const w = bitmap.width * escala;
        const h = bitmap.height * escala;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(bitmap, (cw - w) / 2, (ch - h) / 2, w, h);
      };

      const redimensionar = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = Math.max(1, Math.round(rect.width * dpr));
        const h = Math.max(1, Math.round(rect.height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          if (cuadroDibujado >= 0) dibujar(cuadroDibujado);
        }
      };
      redimensionar();
      const observador = new ResizeObserver(redimensionar);
      observador.observe(canvas);

      const cargarCuadro = async (indice: number) => {
        const controller = new AbortController();
        controladores.push(controller);
        try {
          const resp = await fetch(cuadroSrc(indice), { signal: controller.signal });
          const blob = await resp.blob();
          if (!vivo) return;
          const bitmap = await createImageBitmap(blob);
          if (!vivo) {
            bitmap.close();
            return;
          }
          bitmaps[indice] = bitmap;
          if (cuadroDibujado === -1) {
            cuadroDibujado = indice;
            canvas.dataset.cuadro = String(indice);
          }
          dibujar(cuadroDibujado);
        } catch {
          // Cancelado al desmontar, o sin red: se queda con el cuadro más cercano ya cargado.
        }
      };

      const cargarConLimite = async (indices: number[], limite: number) => {
        let cursor = 0;
        const trabajador = async () => {
          while (vivo && cursor < indices.length) {
            const i = indices[cursor++];
            await cargarCuadro(i);
          }
        };
        await Promise.all(Array.from({ length: Math.min(limite, indices.length) }, trabajador));
      };

      // Primero el cuadro 1 (para dibujar algo ya), luego el resto en orden.
      cargarCuadro(0).then(() => {
        if (!vivo) return;
        const restantes = Array.from({ length: TOTAL_CUADROS_MOVIL - 1 }, (_, i) => i + 1);
        cargarConLimite(restantes, CONCURRENCIA_CARGA);
      });

      const tick = () => {
        progresoActual = acercar(progresoActual, objetivoProgreso, FACTOR_SUAVIZADO);
        const indice = cuadroParaProgreso(progresoActual, TOTAL_CUADROS_MOVIL);
        if (indice !== cuadroDibujado) {
          cuadroDibujado = indice;
          canvas.dataset.cuadro = String(indice);
          dibujar(indice);
        }
        if (!activo && progresoActual === objetivoProgreso) {
          rafId = null;
          return;
        }
        rafId = requestAnimationFrame(tick);
      };
      const iniciar = () => {
        if (activo) return;
        activo = true;
        if (rafId === null) rafId = requestAnimationFrame(tick);
      };

      const st = ScrollTrigger.create({
        ...opcionesScroll,
        onUpdate: (self) => {
          objetivoProgreso = self.progress;
          // Un salto que cruza la sección entera no la activa: igual hay que ir al cuadro nuevo.
          if (rafId === null) rafId = requestAnimationFrame(tick);
        },
        onToggle: (self) => {
          if (self.isActive) iniciar();
          else soltar();
        },
      });
      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      return () => {
        vivo = false;
        detener();
        observador.disconnect();
        controladores.forEach((c) => c.abort());
        bitmaps.forEach((b) => b?.close());
        st.kill();
      };
    },
    { scope: sectionRef, dependencies: [conVideo, esEscritorio] }
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
            esEscritorio ? (
              <video
                ref={videoRef}
                className="asi-media"
                muted
                playsInline
                preload="none"
                disablePictureInPicture
                disableRemotePlayback
                tabIndex={-1}
                poster={POSTER.escritorio}
                width={1920}
                height={1080}
                aria-hidden="true"
              />
            ) : (
              <canvas ref={canvasRef} className="asi-media" width={720} height={720} aria-hidden="true" />
            )
          ) : (
            <picture>
              <source media="(min-width: 900px)" srcSet={POSTER.escritorio} />
              <Image
                className="asi-media"
                src={POSTER.movil}
                alt=""
                width={1080}
                height={1080}
                sizes="100vw"
                unoptimized
              />
            </picture>
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
