'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { DURATION, ScrollTrigger, gsap, registerGsap } from '@/lib/gsap';
import { useIndicadores } from '@/components/widgets/DatoReal';
import { formatearPorcentaje } from '@/lib/indicadores/formato';
import { formatCOP } from '@/lib/format';
import { escalaPorArea, poderDeCompra } from '@/lib/crecimiento';
import '../../landing.css';
import '../capitulos.css';

const MONTO_BASE = 100_000;
const ANIO_INICIO = 2026;
const ANIOS_TOTAL = 10;

/**
 * CapituloEncoge — "Tu plata se encoge" (docs/DIRECCION-LANDING.md §5.2).
 *
 * Capítulo oscuro anclado: al bajar, pasan los años de 2026 a 2036 y la moneda se
 * encoge mientras un contador dice cuánto compran hoy $100.000 con la inflación real
 * del Banco de la República. El movimiento ES la explicación — más scroll, más años,
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
  const monedaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();

      function aplicar(anios: number) {
        const valor = poderDeCompra(MONTO_BASE, inflacionDecimal, anios);
        if (anioRef.current) anioRef.current.textContent = String(Math.round(ANIO_INICIO + anios));
        if (cifraRef.current) cifraRef.current.textContent = formatCOP(Math.round(valor));
        if (monedaRef.current) {
          gsap.set(monedaRef.current, { scale: escalaPorArea(valor, MONTO_BASE), transformOrigin: '50% 100%' });
        }
      }

      aplicar(0);

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

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [inflacionDecimal] }
  );

  return (
    <section id="capitulo-encoge" ref={sectionRef} className="lp-section cap-encoge" aria-labelledby="cap-encoge-titulo">
      <div className="cap-encoge-pin" ref={pinRef}>
        <div className="lp-wrap cap-encoge-inner">
          <h2 id="cap-encoge-titulo" className="cap-title">
            Tu plata se encoge.
          </h2>

          <div className="cap-encoge-arte" ref={monedaRef} aria-hidden="true">
            <Image
              src="/landing/moneda-oscura.webp"
              alt=""
              width={1400}
              height={1352}
              sizes="(max-width: 799px) 40vw, 220px"
              draggable={false}
            />
          </div>

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
