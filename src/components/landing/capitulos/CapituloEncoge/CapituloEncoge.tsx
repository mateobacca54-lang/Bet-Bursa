'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { DURATION, ScrollTrigger, gsap, registerGsap } from '@/lib/gsap';
import { useIndicadores } from '@/components/widgets/DatoReal';
import { formatearPorcentaje } from '@/lib/indicadores/formato';
import { formatCOP } from '@/lib/format';
import { poderDeCompra } from '@/lib/crecimiento';
import { tiempoParaEscala } from '@/lib/videoEncoge';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import '../../landing.css';
import '../capitulos.css';

const MONTO_BASE = 100_000;
const ANIO_INICIO = 2026;
const ANIOS_TOTAL = 10;

/**
 * CapituloEncoge — "Tu plata se encoge" (docs/DIRECCION-LANDING.md §5.2).
 *
 * Capítulo oscuro anclado: al bajar, pasan los años de 2026 a 2036 y la moneda se
 * encoge sobre su pedestal (que no se mueve) mientras un contador dice cuánto compran
 * hoy $100.000 con la inflación real del Banco de la República. La moneda es un video
 * que el scroll recorre: cada año muestra el cuadro donde el ÁREA de la moneda es la
 * fracción de poder de compra que queda (`tiempoParaEscala`). El movimiento ES la explicación — más scroll, más años,
 * menos plata — así que con `prefers-reduced-motion` se salta directo al año 2036,
 * sin pin ni scrub, pero con la misma información.
 *
 * Los contadores se escriben con `textContent` sobre refs dentro de `onUpdate`, nunca
 * con estado de React en cada cuadro (regla de rendimiento de scroll de Bursa).
 */
export default function CapituloEncoge() {
  const inflacion = useIndicadores().inflacion;
  const inflacionDecimal = typeof inflacion.valor === 'number' ? inflacion.valor / 100 : 0;

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const anioRef = useRef<HTMLSpanElement>(null);
  const cifraRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      registerGsap();

      function aplicar(anios: number) {
        const valor = poderDeCompra(MONTO_BASE, inflacionDecimal, anios);
        if (anioRef.current) anioRef.current.textContent = String(Math.round(ANIO_INICIO + anios));
        if (cifraRef.current) cifraRef.current.textContent = formatCOP(Math.round(valor));
        const video = videoRef.current;
        if (video && video.readyState >= 1) {
          // El área de la moneda sigue al poder de compra; el video guarda la altura.
          const t = tiempoParaEscala(Math.sqrt(valor / MONTO_BASE));
          if (Math.abs(video.currentTime - t) > 0.004) video.currentTime = t;
        }
      }

      aplicar(0);

      // iOS no decodifica un video que nunca se reprodujo: se reproduce y pausa una vez
      // (va sin sonido, así que el navegador lo permite) y luego el scroll lo recorre.
      const video = videoRef.current;
      let alListo: (() => void) | undefined;
      if (video) {
        video.play().then(() => video.pause()).catch(() => {});
        alListo = () => ScrollTrigger.refresh();
        video.addEventListener('loadedmetadata', alListo);
      }

      const mm = gsap.matchMedia();
      mm.add(
        {
          escritorio: '(prefers-reduced-motion: no-preference) and (min-width: 800px)',
          movil: '(prefers-reduced-motion: no-preference) and (max-width: 799px)',
          reducido: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { escritorio = false, reducido = false } = context.conditions ?? {};

          // Sin movimiento: directo al final (2036), sin pin ni scrub, misma información.
          if (reducido) {
            aplicar(ANIOS_TOTAL);
            return;
          }

          const section = sectionRef.current;
          const pin = pinRef.current;
          if (!section || !pin) return;

          const st = ScrollTrigger.create({
            trigger: section,
            start: () => `top ${Math.round(document.querySelector('.lp-nav')?.getBoundingClientRect().height ?? 0)}px`,
            end: () => `+=${Math.round(window.innerHeight * (escritorio ? 1.5 : 1.2))}`,
            pin,
            pinSpacing: true,
            scrub: DURATION.scene,
            invalidateOnRefresh: true,
            onUpdate: (self) => aplicar(self.progress * ANIOS_TOTAL),
          });
          aplicar(st.progress * ANIOS_TOTAL);

          return () => st.kill();
        }
      );

      return () => {
        mm.revert();
        if (video && alListo) video.removeEventListener('loadedmetadata', alListo);
      };
    },
    { scope: sectionRef, dependencies: [inflacionDecimal, reduced] }
  );

  return (
    <section id="capitulo-encoge" ref={sectionRef} className="lp-section cap-encoge" aria-labelledby="cap-encoge-titulo">
      <div className="cap-encoge-pin" ref={pinRef}>
        <div className="lp-wrap cap-encoge-inner">
          <h2 id="cap-encoge-titulo" className="cap-title">
            Tu plata se encoge.
          </h2>

          <div className="cap-encoge-arte" aria-hidden="true">
            {reduced ? (
              <Image
                src="/landing/moneda-encoge-fin.webp"
                alt=""
                width={800}
                height={800}
                sizes="(max-width: 799px) 80vw, 480px"
                quality={90}
                draggable={false}
              />
            ) : (
              <video
                ref={videoRef}
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                disableRemotePlayback
                poster="/landing/moneda-encoge-inicio.webp"
                width={800}
                height={800}
                tabIndex={-1}
              >
                <source src="/landing/moneda-encoge.webm" type="video/webm" />
                <source src="/landing/moneda-encoge.mp4" type="video/mp4" />
              </video>
            )}
          </div>

          <div className="cap-encoge-datos">
            <p className="cap-encoge-anio" aria-hidden="true">
              Año <span ref={anioRef}>{ANIO_INICIO}</span>
            </p>
            <p className="cap-encoge-cifra" aria-hidden="true">
              <span ref={cifraRef}>{formatCOP(MONTO_BASE)}</span>
            </p>
            <p className="cap-encoge-explica">
              Eso es lo que compran hoy tus {formatCOP(MONTO_BASE)}, si la inflación —que los precios suban con el
              tiempo— sigue como ahora.
            </p>
          </div>

          <p className="lp-sr-only">
            Con la inflación de hoy, tus {formatCOP(MONTO_BASE)} de ahora compran cada vez menos: en el año{' '}
            {ANIO_INICIO + ANIOS_TOTAL} comprarían como {formatCOP(Math.round(poderDeCompra(MONTO_BASE, inflacionDecimal, ANIOS_TOTAL)))}{' '}
            de hoy.
          </p>
        </div>
      </div>

      {typeof inflacion.valor === 'number' && (
        <p className="lp-wrap cap-encoge-nota">
          Si la inflación se quedara en {formatearPorcentaje(inflacion.valor)} al año ({inflacion.periodo},{' '}
          {inflacion.fuente.split(',')[0]}), así verías encogerse tus {formatCOP(MONTO_BASE)} de hoy en una década.
        </p>
      )}
    </section>
  );
}
