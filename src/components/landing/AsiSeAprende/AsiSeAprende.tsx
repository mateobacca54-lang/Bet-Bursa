'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger, gsap, registerGsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { poseCelulares, type Pose } from '@/lib/celularesFlotantes';
import '../landing.css';
import './asi-se-aprende.css';

interface Actividad {
  id: string;
  titulo: string;
  cuerpo: string;
  descripcion: string;
  poster: string;
  posterFin: string;
  webm: string;
  mp4: string;
}

// Las dos actividades reales del flujo predecir → interactuar → entender de la
// Lección 2 (temario.ts), grabadas tal cual se ven en la app.
const ACTIVIDADES: readonly [Actividad, Actividad] = [
  {
    id: 'almuerzo',
    titulo: 'Mueves el tiempo.',
    cuerpo: 'Arrastras los años y ves cuánto sube tu almuerzo.',
    descripcion:
      'Video de la actividad del almuerzo: se arrastra un control del año 2015 al año 2025, las barras del precio del almuerzo van creciendo, y al final aparece un aviso con un check que explica por qué sube: la inflación.',
    poster: '/landing/actividad-almuerzo-inicio.webp',
    posterFin: '/landing/actividad-almuerzo-fin.webp',
    webm: '/landing/actividad-almuerzo.webm',
    mp4: '/landing/actividad-almuerzo.mp4',
  },
  {
    id: 'interes',
    titulo: 'Predices y comparas.',
    cuerpo: 'Adivinas cuánto crece tu plata y ves cuánto crece de verdad.',
    descripcion:
      'Video de la actividad del interés: se arrastra una predicción de cuánto va a crecer la plata, encima se dibuja la curva real del interés compuesto, y aparece el mensaje "Muy cerca…" comparando las dos.',
    poster: '/landing/actividad-interes-inicio.webp',
    posterFin: '/landing/actividad-interes-fin.webp',
    webm: '/landing/actividad-interes.webm',
    mp4: '/landing/actividad-interes.mp4',
  },
] as const;

/** `translate() rotate()` a partir de una pose — mismo orden que compone GSAP internamente,
 * así el primer cuadro (sin JS) no salta al tomar el control `useGSAP`. */
function transformCss(pose: Pose): string {
  return `translate(${pose.x}%, ${pose.y}%) rotate(${pose.rotacion}deg)`;
}

const POSE_FINAL = poseCelulares(1);

/**
 * AsiSeAprende — capítulo "Así se aprende en Bursa.": dos celulares que flotan
 * delante de la cinta 3D de marca y, al bajar con el scroll, se apartan cada uno
 * hacia su lado inclinándose (referencia: la landing de Slush). Cada celular
 * reproduce en bucle un video de una actividad real de la app.
 *
 * Toda la geometría (posición, rotación, flotación, parallax de la cinta, opacidad
 * de los pies) sale de `poseCelulares(p)` en `lib/celularesFlotantes.ts` — este
 * componente no calcula ningún ángulo ni fracción, solo lee `p` del `ScrollTrigger`
 * anclado y aplica la pose con `gsap.set`. En escritorio, sin movimiento reducido, la
 * sección se ancla (patrón de `HeroGaleria`) mientras se recorre; en celular y con
 * movimiento reducido no hay pin ni scrub: la pose queda fija en p=1 (el estado
 * final, ya separado), que es también lo que renderiza el servidor antes de que
 * `useGSAP` tome el control, para que la hidratación no salte.
 */
export default function AsiSeAprende() {
  const reducirMovimiento = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const cintaRef = useRef<HTMLDivElement>(null);
  const celularARef = useRef<HTMLElement>(null);
  const celularBRef = useRef<HTMLElement>(null);
  const pieARef = useRef<HTMLElement>(null);
  const pieBRef = useRef<HTMLElement>(null);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  const [visible, setVisible] = useState(false);
  // `null` = el usuario todavía no tocó el botón: el estado de pausa lo decide
  // `reducirMovimiento` solo (los videos no arrancan solos bajo movimiento reducido).
  // En cuanto hay un clic, ese valor manda y ya no depende de la preferencia del
  // sistema. Derivado, no un efecto: así no hace falta sincronizar dos estados.
  const [pausadoManual, setPausadoManual] = useState<boolean | null>(null);
  const pausado = pausadoManual ?? reducirMovimiento;

  // La escena reproduce los videos solo mientras está en pantalla.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entrada]) => setVisible(entrada.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const deberianReproducirse = visible && !pausado;
    for (const ref of [videoARef, videoBRef]) {
      const video = ref.current;
      if (!video) continue;
      if (deberianReproducirse) {
        video.play().catch(() => {
          // Autoplay bloqueado (p. ej. ahorro de datos): el póster se queda quieto,
          // el botón de la pastilla sigue ofreciendo reproducir a mano.
        });
      } else {
        video.pause();
      }
    }
  }, [visible, pausado]);

  useGSAP(
    () => {
      registerGsap();

      const cinta = cintaRef.current;
      const a = celularARef.current;
      const b = celularBRef.current;
      const pieA = pieARef.current;
      const pieB = pieBRef.current;

      // `x`/`y` en 0, explícitos: antes de que GSAP toque el elemento, el HTML del
      // servidor ya trae un `transform: translate(%, %) rotate()` (para que la
      // hidratación arranque en la pose final). GSAP, al leerlo por primera vez,
      // interpreta ese `translate(%)` ya resuelto a píxeles como un `x`/`y` fijo
      // propio y lo sigue sumando a `xPercent`/`yPercent` en cada `.set()` — la pose
      // sale duplicada. Fijar `x`/`y` en 0 en el primer `.set()` anula ese residuo.
      const aplicar = (p: number) => {
        const pose = poseCelulares(p);
        if (a) gsap.set(a, { x: 0, y: 0, xPercent: pose.a.x, yPercent: pose.a.y, rotation: pose.a.rotacion });
        if (b) gsap.set(b, { x: 0, y: 0, xPercent: pose.b.x, yPercent: pose.b.y, rotation: pose.b.rotacion });
        if (cinta) gsap.set(cinta, { x: 0, y: 0, yPercent: pose.cinta.y });
        if (pieA) gsap.set(pieA, { opacity: pose.opacidadPie });
        if (pieB) gsap.set(pieB, { opacity: pose.opacidadPie });
      };

      const mm = gsap.matchMedia();
      mm.add(
        {
          // Solo aquí hay pin y scrub. Con movimiento reducido o en celular, la pose
          // queda fija en el estado final: es la misma "(reduce), (max-width: 899px)"
          // que ya usa CapituloCrece, solo que aquí no hay una versión "movil" con su
          // propio pin — en celular esta escena nunca se ancla.
          animada: '(prefers-reduced-motion: no-preference) and (min-width: 900px)',
          quieta: '(prefers-reduced-motion: reduce), (max-width: 899px)',
        },
        (context) => {
          const { animada = false } = context.conditions ?? {};

          if (!animada) {
            aplicar(1);
            return;
          }

          const section = sectionRef.current;
          const pin = pinRef.current;
          if (!section || !pin) {
            aplicar(1);
            return;
          }

          aplicar(0);

          const st = ScrollTrigger.create({
            trigger: section,
            start: () => `top ${Math.round(document.querySelector('.lp-nav')?.getBoundingClientRect().height ?? 0)}px`,
            end: () => `+=${Math.round(window.innerHeight * 1.35)}`,
            pin,
            pinSpacing: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => aplicar(self.progress),
          });
          aplicar(st.progress);

          // Otros capítulos de arriba (p. ej. HeroGaleria) crean su propio pin un
          // ciclo de React después del primer render, y ese pin-spacer tardío cambia
          // cuánto mide todo lo de ARRIBA de esta sección. `refresh()` una vez que la
          // página termina de cargar recalcula el ancla contra el alto ya definitivo;
          // es idempotente, así que no hace daño si ya estaba bien.
          const alCargarTodo = () => ScrollTrigger.refresh();
          window.addEventListener('load', alCargarTodo);

          return () => {
            window.removeEventListener('load', alCargarTodo);
            st.kill();
          };
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section id="como-aprendes-app" ref={sectionRef} className="lp-section asi-section" aria-labelledby="asi-titulo">
      <div ref={pinRef} className="asi-pin">
        <div className="lp-wrap asi-wrap">
          <div className="asi-heading">
            <h2 id="asi-titulo" className="lp-title">
              Así se aprende en Bursa.
            </h2>
            <p className="lp-lead">Cada lección es una actividad: mueves algo y ves qué le pasa a tu plata.</p>
          </div>

          <div className="asi-escena">
            <div ref={cintaRef} className="asi-cinta" style={{ transform: transformCss(POSE_FINAL.cinta) }} aria-hidden="true">
              <Image src="/landing/cinta.webp" alt="" fill sizes="100vw" quality={90} />
            </div>

            <div className="asi-celulares">
              {ACTIVIDADES.map((actividad, i) => {
                const esA = i === 0;
                const celularRef = esA ? celularARef : celularBRef;
                const pieRef = esA ? pieARef : pieBRef;
                const videoRef = esA ? videoARef : videoBRef;
                const pose = esA ? POSE_FINAL.a : POSE_FINAL.b;

                return (
                  <figure
                    key={actividad.id}
                    ref={celularRef}
                    className={`asi-celular asi-celular--${esA ? 'a' : 'b'}`}
                    style={{ transform: transformCss(pose) }}
                  >
                    {/* El marco (fondo oscuro) queda en este div, aparte del pie: si el
                        fondo del figure llegara hasta el pie, el texto (tinta oscura)
                        quedaría oscuro sobre oscuro. */}
                    <div className="asi-marco-celular">
                      <span className="asi-marco-celular-notch" aria-hidden="true" />
                      <div className="asi-marco-celular-pantalla">
                        <video
                          ref={videoRef}
                          className="asi-video"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          poster={reducirMovimiento ? actividad.posterFin : actividad.poster}
                          aria-hidden="true"
                          width={780}
                          height={1688}
                        >
                          <source src={actividad.webm} type="video/webm" />
                          <source src={actividad.mp4} type="video/mp4" />
                        </video>
                      </div>
                    </div>

                    <span className="lp-sr-only">{actividad.descripcion}</span>

                    <figcaption ref={pieRef} className="asi-pie" style={{ opacity: POSE_FINAL.opacidadPie }}>
                      <span className="asi-pie-titulo">{actividad.titulo}</span>
                      <span className="asi-pie-cuerpo">{actividad.cuerpo}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>

          {/* En celular los pies van como lista, aparte de cada celular (AGENTS.md: el
              texto nunca depende de que el JS haya calculado una pose). El de arriba
              (dentro de cada <figure>) es el mismo contenido pero se oculta <900px con
              CSS: nunca coexisten los dos visibles, así que un lector de pantalla no
              los lee dos veces. */}
          <ul className="asi-pies-lista">
            {ACTIVIDADES.map((actividad) => (
              <li key={actividad.id} className="asi-pies-lista-item">
                <span className="asi-pie-titulo">{actividad.titulo}</span>
                <span className="asi-pie-cuerpo">{actividad.cuerpo}</span>
              </li>
            ))}
          </ul>

          <div className="asi-pildora">
            <button
              type="button"
              className="asi-pausa"
              onClick={() => setPausadoManual(!pausado)}
              aria-pressed={pausado}
              aria-label={pausado ? 'Reproducir las actividades' : 'Pausar las actividades'}
            >
              {pausado ? <ReproducirIcono /> : <PausaIcono />}
            </button>
          </div>
        </div>
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
