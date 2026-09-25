'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { DURATION, ScrollTrigger, gsap, registerGsap } from '@/lib/gsap';
import { useIndicadores } from '@/components/widgets/DatoReal';
import { formatearPorcentaje } from '@/lib/indicadores/formato';
import { formatCOP } from '@/lib/format';
import { ahorroAcumulado, opacidadesFrasco, tasaMensualDesdeEA, valorFuturoMensual } from '@/lib/crecimiento';
import '../../landing.css';
import '../capitulos.css';

const DEPOSITO = 100_000;
const MESES_TOTAL = 120;
const CHART_W = 320;
const CHART_H = 110;
const PASOS_GRAFICA = 40;

/** Los puntos de las dos líneas del gráfico, para toda la década (0 a `MESES_TOTAL`). */
function construirPuntosGrafica(tasaMensual: number): { puntosAhorro: string; puntosCdt: string } {
  const max = Math.max(ahorroAcumulado(DEPOSITO, MESES_TOTAL), valorFuturoMensual(DEPOSITO, tasaMensual, MESES_TOTAL), 1);
  const puntosAhorro: string[] = [];
  const puntosCdt: string[] = [];
  for (let i = 0; i <= PASOS_GRAFICA; i++) {
    const m = (i / PASOS_GRAFICA) * MESES_TOTAL;
    const x = (i / PASOS_GRAFICA) * CHART_W;
    puntosAhorro.push(`${x.toFixed(1)},${(CHART_H - (ahorroAcumulado(DEPOSITO, m) / max) * CHART_H).toFixed(1)}`);
    puntosCdt.push(`${x.toFixed(1)},${(CHART_H - (valorFuturoMensual(DEPOSITO, tasaMensual, m) / max) * CHART_H).toFixed(1)}`);
  }
  return { puntosAhorro: puntosAhorro.join(' '), puntosCdt: puntosCdt.join(' ') };
}

/**
 * CapituloCrece — "Mira crecer tu plata" (docs/DIRECCION-LANDING.md §5, la firma
 * interactiva del héroe): el usuario scrollea y ve, mes a mes, cuánto llega a valer
 * apartar $100.000 al mes durante 10 años guardándola quieta contra dejarla en un CDT
 * (un depósito a tasa fija) que compone mes a mes.
 *
 * El scroll ancla y escala `m` de 0 a 120: los dos contadores, el frasco (que funde
 * sus 4 estampas por opacidad) y la línea del gráfico se mueven juntos. La conclusión
 * y la nota de fuente van DESPUÉS del tramo anclado — así no compiten por el mismo
 * cuadro de pantalla y aparecen justo cuando el scroll normal se reanuda.
 *
 * Con `prefers-reduced-motion`: sin pin ni scrub, directo al mes 120 (la década
 * completa), con la misma información.
 */
export default function CapituloCrece() {
  const cdt = useIndicadores().cdt;
  const cdtDecimal = typeof cdt.valor === 'number' ? cdt.valor / 100 : 0;
  const tasaMensual = tasaMensualDesdeEA(cdtDecimal);

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const ahorroRef = useRef<HTMLSpanElement>(null);
  const cdtRef = useRef<HTMLSpanElement>(null);
  const frasco1Ref = useRef<HTMLImageElement>(null);
  const frasco2Ref = useRef<HTMLImageElement>(null);
  const frasco3Ref = useRef<HTMLImageElement>(null);
  const frasco4Ref = useRef<HTMLImageElement>(null);
  const lineaAhorroRef = useRef<SVGPolylineElement>(null);
  const lineaCdtRef = useRef<SVGPolylineElement>(null);

  const ahorroFinal = ahorroAcumulado(DEPOSITO, MESES_TOTAL);
  const fvFinal = valorFuturoMensual(DEPOSITO, tasaMensual, MESES_TOTAL);
  const diferenciaFinal = Math.round(fvFinal - ahorroFinal);

  const { puntosAhorro, puntosCdt } = construirPuntosGrafica(tasaMensual);

  useGSAP(
    () => {
      registerGsap();

      const frascoRefs = [frasco1Ref, frasco2Ref, frasco3Ref, frasco4Ref];

      function aplicar(m: number) {
        const ahorro = ahorroAcumulado(DEPOSITO, m);
        const fv = valorFuturoMensual(DEPOSITO, tasaMensual, m);
        if (ahorroRef.current) ahorroRef.current.textContent = formatCOP(Math.round(ahorro));
        if (cdtRef.current) cdtRef.current.textContent = formatCOP(Math.round(fv));

        const opacidades = opacidadesFrasco(m, MESES_TOTAL);
        frascoRefs.forEach((ref, i) => {
          if (ref.current) gsap.set(ref.current, { opacity: opacidades[i] });
        });

        const progreso = Math.min(1, Math.max(0, m / MESES_TOTAL));
        const dashoffset = String(1 - progreso);
        // Sin unidad, a propósito: con `pathLength` normalizado a 1 (SVG), el valor
        // se interpreta como fracción del trazo. gsap.set() le añade "px" por
        // defecto a las propiedades numéricas que no reconoce, y con esa unidad
        // el navegador deja de escalarlo por `pathLength` (el trazo dejaba de
        // dibujarse con el scroll). Se escribe directo al estilo, igual que los
        // contadores se escriben directo a `textContent`.
        if (lineaAhorroRef.current) lineaAhorroRef.current.style.strokeDashoffset = dashoffset;
        if (lineaCdtRef.current) lineaCdtRef.current.style.strokeDashoffset = dashoffset;
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

          // Sin movimiento: directo al mes 120 (la década completa), sin pin ni scrub.
          if (reducido) {
            aplicar(MESES_TOTAL);
            return;
          }

          const section = sectionRef.current;
          const pin = pinRef.current;
          if (!section || !pin) return;

          const st = ScrollTrigger.create({
            trigger: section,
            start: () => `top ${Math.round(document.querySelector('.lp-nav')?.getBoundingClientRect().height ?? 0)}px`,
            end: () => `+=${Math.round(window.innerHeight * (escritorio ? 1.8 : 1.2))}`,
            pin,
            pinSpacing: true,
            scrub: DURATION.scene,
            invalidateOnRefresh: true,
            onUpdate: (self) => aplicar(self.progress * MESES_TOTAL),
          });
          aplicar(st.progress * MESES_TOTAL);

          return () => st.kill();
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [tasaMensual] }
  );

  return (
    <section id="capitulo-crece" ref={sectionRef} className="lp-section lp-section--paper cap-crece" aria-labelledby="cap-crece-titulo">
      <div className="cap-crece-pin" ref={pinRef}>
        <div className="lp-wrap cap-crece-inner">
          <h2 id="cap-crece-titulo" className="cap-title">
            Mira crecer tu plata.
          </h2>
          <p className="cap-crece-premisa">Apartas {formatCOP(DEPOSITO)} cada mes durante 10 años.</p>

          <div className="cap-crece-comparacion">
            <div className="cap-crece-col">
              <div className="cap-crece-arte" aria-hidden="true">
                <Image
                  src="/landing/alcancia.webp"
                  alt=""
                  fill
                  sizes="(max-width: 799px) 36vw, 200px"
                  style={{ objectFit: 'contain' }}
                  draggable={false}
                />
              </div>
              <p className="cap-crece-etiqueta">Guardada</p>
              <p className="cap-crece-cifra" aria-hidden="true">
                <span ref={ahorroRef}>{formatCOP(0)}</span>
              </p>
              <p className="cap-crece-caption">Quieta en la alcancía, sin ganar nada extra.</p>
            </div>

            <div className="cap-crece-col">
              <div className="cap-crece-arte" aria-hidden="true">
                <Image
                  ref={frasco1Ref}
                  className="cap-crece-frasco-capa"
                  src="/landing/frasco-1.webp"
                  alt=""
                  fill
                  sizes="(max-width: 799px) 36vw, 200px"
                  style={{ objectFit: 'contain', opacity: 1 }}
                  draggable={false}
                />
                <Image
                  ref={frasco2Ref}
                  className="cap-crece-frasco-capa"
                  src="/landing/frasco-2.webp"
                  alt=""
                  fill
                  sizes="(max-width: 799px) 36vw, 200px"
                  style={{ objectFit: 'contain', opacity: 0 }}
                  draggable={false}
                />
                <Image
                  ref={frasco3Ref}
                  className="cap-crece-frasco-capa"
                  src="/landing/frasco-3.webp"
                  alt=""
                  fill
                  sizes="(max-width: 799px) 36vw, 200px"
                  style={{ objectFit: 'contain', opacity: 0 }}
                  draggable={false}
                />
                <Image
                  ref={frasco4Ref}
                  className="cap-crece-frasco-capa"
                  src="/landing/frasco-4.webp"
                  alt=""
                  fill
                  sizes="(max-width: 799px) 36vw, 200px"
                  style={{ objectFit: 'contain', opacity: 0 }}
                  draggable={false}
                />
              </div>
              <p className="cap-crece-etiqueta">En un CDT</p>
              <p className="cap-crece-cifra" aria-hidden="true">
                <span ref={cdtRef}>{formatCOP(0)}</span>
              </p>
              <p className="cap-crece-caption">
                Un CDT es un depósito que dejas quieto un tiempo fijo; el banco te paga intereses por eso — hoy,{' '}
                {typeof cdt.valor === 'number' ? formatearPorcentaje(cdt.valor) : 'sin dato'} efectivo al año.
              </p>
            </div>
          </div>

          <p className="lp-sr-only">
            Guardando {formatCOP(DEPOSITO)} al mes durante 10 años, terminas con {formatCOP(Math.round(ahorroFinal))}. En un
            CDT a la tasa de hoy, terminas con {formatCOP(Math.round(fvFinal))}: {formatCOP(diferenciaFinal)} más, gracias
            al interés compuesto.
          </p>

          <div className="cap-crece-grafica">
            <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none" aria-hidden="true">
              <polyline ref={lineaAhorroRef} points={puntosAhorro} pathLength={1} className="cap-crece-linea cap-crece-linea--ahorro" />
              <polyline ref={lineaCdtRef} points={puntosCdt} pathLength={1} className="cap-crece-linea cap-crece-linea--cdt" />
            </svg>
            <div className="cap-crece-leyenda" aria-hidden="true">
              <span className="cap-crece-leyenda-item cap-crece-leyenda-item--ahorro">Guardada</span>
              <span className="cap-crece-leyenda-item cap-crece-leyenda-item--cdt">En un CDT</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lp-wrap cap-crece-conclusion">
        <p className="cap-crece-diferencia">
          Con interés compuesto —ganas intereses también sobre los intereses— terminas con {formatCOP(diferenciaFinal)} más.
        </p>
        {typeof cdt.valor === 'number' && (
          <p className="cap-crece-nota">
            Tasa de referencia de hoy (DTF a 90 días, Banco de la República, {cdt.periodo}). Las tasas cambian: esto es un
            ejemplo, no una promesa ni una recomendación.
          </p>
        )}
      </div>
    </section>
  );
}
