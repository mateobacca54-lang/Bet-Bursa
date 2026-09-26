'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO, REDUCED_DURATION } from '@/lib/motion';
import { formatCOP } from '@/lib/format';
import { cifraContador, deudaTrasGracia, estadoFila, pasoActivo, splitEtiquetaValor, type EstadoFila } from '@/lib/landing-lectura';
import { leccion09Config } from '@/content/modulo-1/leccion-09-letra-pequena';
import './landing.css';
import './lee-la-letra.css';

// Las cifras del papel (lección 9, simulación de crédito): $3.000.000, 1,8 % mensual,
// 6 meses de gracia. La deuda final y la diferencia SIEMPRE se calculan.
const MONTO = 3_000_000;
const TASA_MENSUAL = 0.018;
const MESES_GRACIA = 6;
const DEUDA_FINAL = deudaTrasGracia(MONTO, TASA_MENSUAL, MESES_GRACIA);
const DIFERENCIA = DEUDA_FINAL - MONTO;

interface Paso {
  id: string;
  titulo: string;
  texto: string;
}

const PASOS: Paso[] = [
  {
    id: 'primero',
    titulo: 'Empieza por la cuota',
    texto: 'La cuota de $120.000 llama la atención, pero no cuenta toda la historia.',
  },
  {
    id: 'de-verdad',
    titulo: 'Mira el préstamo completo',
    texto: 'Pides $3.000.000 por 24 meses. La tasa del 1,8 % mensual es lo que cuesta pedir esa plata prestada.',
  },
  {
    id: 'nadie-lee',
    titulo: 'Revisa los meses sin cuota',
    texto: 'Durante seis meses no pagas la cuota, pero el interés se suma a lo que debes.',
  },
];

/**
 * LeeLaLetra — "El papel sobre la mesa" (docs/archivo/SPEC-LANDING-V2.md §10).
 *
 * Un papel de verdad (HTML, no el SVG de las lecciones) y una nota fija al margen.
 * La fila activa se resalta mientras cambia la explicación. En escritorio con movimiento,
 * un escenario sticky de una pantalla; el scroll de una pista de 3×60vh avanza el
 * paso. En móvil o con prefers-reduced-motion: una sola tarjeta (papel + nota), sin
 * sticky, con "Anterior"/"Siguiente".
 */
export default function LeeLaLetra() {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [paso, setPaso] = useState(0);

  // El escenario sticky + scroll-driven solo existe en escritorio Y con movimiento
  // (las dos condiciones ya deciden el layout en CSS); en JS hace falta la misma
  // condición para no dejar que un scroll de fondo le pise el paso a un clic en
  // "Anterior"/"Siguiente" en móvil, donde no hay scroll que seguir. 960px: mismo
  // punto de quiebre que la composición editorial asimétrica de la v3.
  const [anchoDesktop, setAnchoDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const update = () => setAnchoDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const escenarioActivo = anchoDesktop && !reduced;

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (valor) => {
    if (!escenarioActivo) return;
    setPaso(pasoActivo(valor, PASOS.length));
  });

  const irAProgreso = (indice: number) => {
    const el = trackRef.current;
    if (!el) return;
    const progreso = (indice + 0.5) / PASOS.length;
    const rect = el.getBoundingClientRect();
    const trackTop = rect.top + window.scrollY;
    const destino = trackTop + progreso * (rect.height - window.innerHeight);
    window.scrollTo({ top: destino, behavior: reduced ? 'auto' : 'smooth' });
  };

  const irAPaso = (indice: number) => {
    if (escenarioActivo) irAProgreso(indice);
    else setPaso(indice);
  };

  return (
    <section id="lee-la-letra" className="lp-section lp-section--paper llp-section" aria-labelledby="llp-titulo">
      <div className="llp-escena-track" ref={trackRef}>
        <div className="llp-escena-sticky">
          <div className="lp-wrap llp-escena-wrap">
            <div className="llp-heading">
              <h2 id="llp-titulo" className="lp-title">
                Antes de aceptar un crédito, mira más que la cuota.
              </h2>
              <p className="lp-lead">
                Seis meses sin pagar no detienen el interés. Mira dónde aparece en el documento.
              </p>
            </div>
            <div className="llp-papel-col">
              <Papel paso={paso} reduced={reduced} />
            </div>
            <div className="llp-nota-col">
              <Nota
                paso={paso}
                reduced={reduced}
                onAnterior={() => irAPaso(paso - 1)}
                onSiguiente={() => irAPaso(paso + 1)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * El papel: una hoja HTML con las filas de la simulación (datos de `leccion09Config`,
 * no escritos a mano). Objeto de la galería: en escritorio se inclina -3° de forma
 * ESTÁTICA (CSS, no animación) para dar profundidad, como las capturas de Tomorro;
 * en móvil queda recto. El único movimiento real del documento es el resaltado de
 * fila que hace `Fila` — eso sí explica algo.
 */
function Papel({ paso, reduced }: { paso: number; reduced: boolean }) {
  return (
    <div className="llp-papel">
      <div className="llp-papel-header">
        <span className="llp-papel-icono" aria-hidden="true">
          %
        </span>
        <span className="llp-papel-titulo">Simulación de crédito</span>
      </div>
      <div className="llp-papel-filas">
        {leccion09Config.zones.map((zona) => {
          const { etiqueta, valor } = splitEtiquetaValor(zona.label);
          return (
            <Fila
              key={zona.id}
              etiqueta={etiqueta}
              valor={valor}
              estado={estadoFila(zona.id, paso)}
              destacada={zona.id === 'cuota'}
              chica={zona.id === 'gracia'}
              reduced={reduced}
            />
          );
        })}
      </div>
    </div>
  );
}

interface FilaProps {
  etiqueta: string;
  valor: string;
  estado: EstadoFila;
  destacada?: boolean;
  chica?: boolean;
  reduced: boolean;
}

/** El foco recorre el documento sin pintar encima del texto. */
function Fila({ etiqueta, valor, estado, destacada, chica, reduced }: FilaProps) {
  return (
    <motion.div
      className={`llp-fila${destacada ? ' llp-fila--destacada' : ''}${estado === 'actual' ? ' llp-fila--actual' : ''}`}
      animate={{ opacity: reduced || estado === 'actual' ? 1 : 0.48, x: reduced || estado !== 'actual' ? 0 : 8 }}
      transition={reduced ? { duration: REDUCED_DURATION } : { duration: DURATION.scene, ease: EASE_OUT_EXPO }}
    >
      <span className="llp-fila-etiqueta">{etiqueta}</span>
      <span className={`llp-fila-valor${chica ? ' llp-fila-valor--chica' : ''}`}>{valor}</span>
    </motion.div>
  );
}

interface NotaProps {
  paso: number;
  reduced: boolean;
  onAnterior: () => void;
  onSiguiente: () => void;
}

/** La nota al margen: Monedita, progreso, explicación y controles de los tres pasos. */
function Nota({ paso, reduced, onAnterior, onSiguiente }: NotaProps) {
  const actual = PASOS[paso];
  return (
    <div className="llp-nota">
      <div className="llp-nota-header">
        <Image src="/monedita/monedita.webp" alt="" width={32} height={34} sizes="32px" draggable={false} />
        <span className="llp-nota-paso">
          Paso {paso + 1} de {PASOS.length}
        </span>
      </div>
      <div className="llp-pasos" aria-hidden="true">
        {PASOS.map((item, i) => <span key={item.id} data-estado={i < paso ? 'hecho' : i === paso ? 'actual' : 'pendiente'} />)}
      </div>
      <p className="lp-sr-only" role="status" aria-live="polite">
        Paso {paso + 1} de {PASOS.length}: {actual.titulo}.
      </p>
      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={paso}
        className="llp-nota-body"
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: -12 }}
        transition={reduced ? { duration: 0 } : { duration: DURATION.scene, ease: EASE_OUT_EXPO }}
      >
        <h3 className="llp-nota-titulo">{actual.titulo}</h3>
        <p className="llp-nota-texto">{actual.texto}</p>

      {paso === 2 && (
        <div className="llp-contador-box">
          <p className="llp-contador-label">Deuda al empezar a pagar</p>
          <ContadorDeuda activo={paso === 2} />
          <p className="llp-nota-texto">
            Debes {formatCOP(DIFERENCIA)} más de lo que pediste, aunque todavía no hayas pagado una cuota.
          </p>
        </div>
      )}
      </motion.div>
      </AnimatePresence>

      <div className="llp-nota-acciones">
        <button type="button" className="llp-nota-btn" onClick={onAnterior} disabled={paso === 0}>
          Anterior
        </button>
        <button type="button" className="llp-nota-btn" onClick={onSiguiente} disabled={paso === PASOS.length - 1}>
          Siguiente
        </button>
      </div>
    </div>
  );
}

/**
 * El contador que va de $3.000.000 a lo que se debe al terminar la gracia.
 *
 * Arranca con lo primero que pase: que el propio contador entre en pantalla
 * (`useInView`, para móvil y para cuando el scroll del track no coincide exactamente
 * con "el contador ya se ve") o que el paso llegue a 3 (`activo`). Un pestillo evita
 * que vuelva a $3.000.000 si el usuario sube de nuevo, y `cifraContador` (función
 * pura) blinda la cifra mostrada para que nunca retroceda aunque algo reordene los
 * eventos de la animación.
 */
function ContadorDeuda({ activo }: { activo: boolean }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const enVista = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(MONTO);
  const [cifraAnimada, setCifraAnimada] = useState<number | null>(null);
  // Los dos, leídos y escritos SOLO dentro de efectos (nunca durante el render, eso
  // rompe react-hooks/refs): `disparado` es el pestillo de una sola vía que evita
  // arrancar la animación dos veces; `controlsRef` guarda el control para poder pararlo
  // en el desmontaje, sin que ese `stop()` dependa de `activo`/`enVista`.
  const disparado = useRef(false);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

  useMotionValueEvent(mv, 'change', (valor) => {
    setCifraAnimada((prev) => cifraContador(prev ?? MONTO, Math.round(valor)));
  });

  // A propósito NO se limpia (`return () => controls.stop()`) en este efecto: si
  // dependiera de `activo`/`enVista` y cualquiera de los dos cambiara DESPUÉS de haber
  // arrancado, React limpiaría la invocación anterior a mitad de la animación y, como
  // el pestillo ya estaba en true, nunca se volvía a lanzar: la cifra se quedaba
  // congelada a medio contar. Solo se para de verdad al desmontar (más abajo).
  useEffect(() => {
    if (disparado.current || reduced || (!activo && !enVista)) return;
    disparado.current = true;
    controlsRef.current = animate(mv, DEUDA_FINAL, {
      duration: DURATION.story,
      ease: EASE_OUT_EXPO,
    });
  }, [activo, enVista, reduced, mv]);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      disparado.current = false;
    };
  }, []);

  const cifra = reduced ? DEUDA_FINAL : (cifraAnimada ?? MONTO);

  return (
    <p className="llp-contador" ref={ref}>
      {/* La cifra cambia en cada cuadro mientras se anima: un aria-live ahí anunciaría
          decenas de números. Va aria-hidden, y el texto fijo de al lado (con la cifra
          final, calculada, nunca escrita a mano) es lo que lee el lector de pantalla. */}
      <span className="llp-contador-cifra" aria-hidden="true">
        {formatCOP(cifra)}
      </span>
      <span className="lp-sr-only">Debes {formatCOP(DEUDA_FINAL)} al empezar a pagar.</span>
    </p>
  );
}
