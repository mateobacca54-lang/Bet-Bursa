'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { anteriorIndice, clampIndice, debeAvanzarAuto, siguienteIndice } from '@/lib/carrusel';
import '../landing.css';
import './asi-se-aprende.css';

interface Paso {
  id: string;
  titulo: string;
  cuerpo: string;
  srcEscritorio: string;
  srcCelular: string;
  alt: string;
}

const AVANCE_AUTO_MS = 6000;

// Las capturas son reales, tomadas del propio flujo predecir → interactuar → entender de
// WidgetShell en la Lección 2 (la inflación y el precio del almuerzo). No se dibujan: son
// la app tal cual la ve quien la usa (DIRECCION-LANDING.md §5.5).
const PASOS: readonly Paso[] = [
  {
    id: 'predices',
    titulo: 'Predices.',
    cuerpo: 'Antes de ver la respuesta, eliges qué crees que va a pasar.',
    srcEscritorio: '/landing/app-escritorio-predices.webp',
    srcCelular: '/landing/app-predices.webp',
    alt: 'Una lección de Bursa en escritorio y en celular: antes de mover el slider, Monedita invita a predecir en qué año el almuerzo de $8.000 va a costar más de $15.000.',
  },
  {
    id: 'lo-ves',
    titulo: 'Lo ves.',
    cuerpo: 'Mueves algo real —un año, un peso— y el resultado cambia frente a tus ojos.',
    srcEscritorio: '/landing/app-escritorio-lo-ves.webp',
    srcCelular: '/landing/app-lo-ves.webp',
    alt: 'La misma lección en escritorio y en celular con el slider movido al año 2020: la gráfica de barras muestra cómo sube el precio del almuerzo a medida que pasan los años.',
  },
  {
    id: 'entiendes',
    titulo: 'Entiendes por qué.',
    cuerpo: 'Monedita te explica la respuesta con la pregunta todavía fresca.',
    srcEscritorio: '/landing/app-escritorio-entiendes.webp',
    srcCelular: '/landing/app-entiendes.webp',
    alt: 'La misma lección en escritorio y en celular con la respuesta correcta: un aviso con un check y Monedita celebrando explican por qué la inflación hace que el almuerzo cueste más de $15.000 en 2025.',
  },
];

/**
 * AsiSeAprende — capítulo "Así se aprende en Bursa.": un carrusel horizontal de
 * tarjetas grandes, al estilo "Highlights" de Apple (PLAN-LANDING-V3.md §3 fila 6).
 *
 * El scroll horizontal nativo (`scroll-snap`) es la fuente de verdad: funciona con touch
 * y trackpad sin JS. Un `IntersectionObserver` sobre las tarjetas lee cuál está más
 * visible para marcar el punto activo y mover el foco de los controles; los controles
 * (puntos, flechas) mueven el scroll con `scrollTo`. El avance automático es un cambio de
 * estado más: usa el mismo camino que un clic en "siguiente".
 */
export default function AsiSeAprende() {
  const reducirMovimiento = usePrefersReducedMotion();
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [seccionVisible, setSeccionVisible] = useState(false);
  const [interactuando, setInteractuando] = useState(false);

  const pistaRef = useRef<HTMLDivElement>(null);
  const tarjetasRef = useRef<Array<HTMLDivElement | null>>([]);
  const activoRef = useRef(0);
  const desplazandoRef = useRef(false);

  useEffect(() => {
    activoRef.current = activo;
  }, [activo]);

  const irA = useCallback(
    (i: number) => {
      const pista = pistaRef.current;
      const tarjeta = tarjetasRef.current[i];
      if (!pista || !tarjeta) return;
      desplazandoRef.current = true;
      pista.scrollTo({
        left: tarjeta.offsetLeft - pista.offsetLeft,
        behavior: reducirMovimiento ? 'auto' : 'smooth',
      });
      setActivo(i);
      // El scroll suave dispara varios eventos de IntersectionObserver mientras viaja;
      // se ignoran hasta que termine, para no pisar el índice que el usuario eligió.
      window.setTimeout(() => {
        desplazandoRef.current = false;
      }, reducirMovimiento ? 50 : 500);
    },
    [reducirMovimiento]
  );

  // Paso activo: la tarjeta más visible dentro de la pista, según IntersectionObserver.
  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;

    const observer = new IntersectionObserver(
      (entradas) => {
        if (desplazandoRef.current) return;
        let mejor: IntersectionObserverEntry | null = null;
        for (const entrada of entradas) {
          if (!mejor || entrada.intersectionRatio > mejor.intersectionRatio) {
            mejor = entrada;
          }
        }
        if (mejor && mejor.intersectionRatio > 0) {
          const i = tarjetasRef.current.indexOf(mejor.target as HTMLDivElement);
          if (i >= 0) setActivo(i);
        }
      },
      { root: pista, threshold: [0.5, 0.75, 1] }
    );

    for (const tarjeta of tarjetasRef.current) {
      if (tarjeta) observer.observe(tarjeta);
    }
    return () => observer.disconnect();
  }, []);

  // La sección cuenta como "visible" (para el avance automático) al 50% o más en pantalla.
  useEffect(() => {
    const pista = pistaRef.current;
    const section = pista?.closest('section');
    if (!section) return;
    const observer = new IntersectionObserver(([entrada]) => setSeccionVisible(entrada.isIntersecting), {
      threshold: 0.5,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Avance automático: cada AVANCE_AUTO_MS, solo si la sección está visible, sin
  // movimiento reducido, sin pausa manual y sin puntero/foco dentro del carrusel. Se
  // detiene solo al llegar al último paso (PLAN §3 fila 6, AGENTS.md movimiento).
  useEffect(() => {
    if (reducirMovimiento || pausado || interactuando || !seccionVisible) return;
    if (!debeAvanzarAuto(activo, PASOS.length)) return;

    const id = window.setTimeout(() => {
      irA(siguienteIndice(activoRef.current, PASOS.length));
    }, AVANCE_AUTO_MS);
    return () => window.clearTimeout(id);
  }, [activo, reducirMovimiento, pausado, interactuando, seccionVisible, irA]);

  function alTeclado(evento: React.KeyboardEvent<HTMLDivElement>) {
    if (evento.key === 'ArrowRight') {
      evento.preventDefault();
      irA(siguienteIndice(activo, PASOS.length));
    } else if (evento.key === 'ArrowLeft') {
      evento.preventDefault();
      irA(anteriorIndice(activo, PASOS.length));
    }
  }

  return (
    <section id="como-aprendes-app" className="lp-section asi-section" aria-labelledby="asi-titulo">
      <div className="lp-wrap asi-wrap">
        <div className="asi-heading">
          <h2 id="asi-titulo" className="lp-title">
            Así se aprende en Bursa.
          </h2>
          <p className="lp-lead">Los tres momentos de una lección real, tal como se ven en tu pantalla.</p>
        </div>

        <div
          ref={pistaRef}
          className="asi-pista"
          role="region"
          aria-roledescription="carrusel"
          aria-label="Así se aprende en Bursa"
          tabIndex={0}
          onKeyDown={alTeclado}
          onPointerEnter={() => setInteractuando(true)}
          onPointerLeave={() => setInteractuando(false)}
          onFocus={() => setInteractuando(true)}
          onBlur={() => setInteractuando(false)}
          onPointerDown={() => setPausado(true)}
        >
          {PASOS.map((paso, i) => (
            <div
              key={paso.id}
              ref={(el) => {
                tarjetasRef.current[i] = el;
              }}
              className="asi-tarjeta"
              role="group"
              aria-roledescription="paso"
              aria-label={`${i + 1} de ${PASOS.length}`}
            >
              <p className="asi-tarjeta-num" aria-hidden="true">
                0{i + 1}
              </p>
              <h3 className="asi-tarjeta-titulo">{paso.titulo}</h3>
              <p className="asi-tarjeta-cuerpo">{paso.cuerpo}</p>

              <div className="asi-capturas">
                <div className="asi-marco-escritorio" aria-hidden="true">
                  <div className="asi-marco-barra">
                    <span className="asi-marco-punto" />
                    <span className="asi-marco-punto" />
                    <span className="asi-marco-punto" />
                  </div>
                  <div className="asi-marco-pantalla">
                    <Image
                      src={paso.srcEscritorio}
                      alt=""
                      width={2000}
                      height={1800}
                      sizes="(min-width: 900px) min(760px, 62vw), 0px"
                      quality={90}
                    />
                  </div>
                </div>

                <div className="asi-marco-celular" role="img" aria-label={paso.alt}>
                  <span className="asi-marco-celular-notch" />
                  <div className="asi-marco-celular-pantalla">
                    <Image
                      src={paso.srcCelular}
                      alt=""
                      width={1170}
                      height={2532}
                      sizes="(min-width: 900px) 180px, 62vw"
                      quality={90}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="asi-controles">
          <button
            type="button"
            className="asi-flecha"
            onClick={() => irA(anteriorIndice(activo, PASOS.length))}
            disabled={activo === 0}
            aria-label="Paso anterior"
          >
            <FlechaIcono direccion="izquierda" />
          </button>

          <div className="asi-pildora">
            {PASOS.map((paso, i) => (
              <button
                key={paso.id}
                type="button"
                className="asi-punto"
                data-active={activo === i}
                aria-current={activo === i ? 'true' : undefined}
                aria-label={`Ir al paso ${i + 1}: ${paso.titulo}`}
                onClick={() => irA(clampIndice(i, PASOS.length))}
              />
            ))}
            <button
              type="button"
              className="asi-pausa"
              onClick={() => setPausado((p) => !p)}
              aria-label={pausado ? 'Reanudar avance automático' : 'Pausar avance automático'}
              aria-pressed={pausado}
            >
              {pausado ? <ReproducirIcono /> : <PausaIcono />}
            </button>
          </div>

          <button
            type="button"
            className="asi-flecha"
            onClick={() => irA(siguienteIndice(activo, PASOS.length))}
            disabled={activo === PASOS.length - 1}
            aria-label="Paso siguiente"
          >
            <FlechaIcono direccion="derecha" />
          </button>
        </div>
      </div>
    </section>
  );
}

function FlechaIcono({ direccion }: { direccion: 'izquierda' | 'derecha' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d={direccion === 'izquierda' ? 'M11 3l-6 6 6 6' : 'M7 3l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
