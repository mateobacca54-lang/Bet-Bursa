'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import type { SituacionPrueba } from '@/lib/prueba';
import { evaluarPrueba, barajar, umbralAprobar, type ResultadoPrueba } from '@/lib/prueba';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO, variants } from '@/lib/motion';
import ProgressBar from '@/components/shell/ProgressBar';
import './prueba.css';

interface PruebaDePasoProps {
  situaciones: readonly SituacionPrueba[];
  moduleNumber: number;
  moduleTitle: string;
  /** A dónde lleva "Volver más tarde" */
  exitHref: string;
  /** Se llama una sola vez, al aprobar */
  onAprobada: () => void;
}

type Fase = 'intro' | 'preguntas' | 'resultado';
const SHIFT = 24;

/**
 * PruebaDePaso — la prueba de paso de un módulo (METODOLOGIA.md §5, ARQUITECTURA.md §2).
 *
 * 6 situaciones reales, en desorden, una por pantalla. Nunca revela si acertaste hasta el
 * final: es una prueba, no una práctica de lección (ahí sí se corrige al instante). Se
 * aprueba con como mucho una mal. Si falla, dice QUÉ TEMA repasar y deja reintentar sin
 * límite ni penalización, con las situaciones y sus opciones reordenadas.
 *
 * No es el arquetipo "Elegir": esa sí tiene una decisión correcta que se corrige.
 */
export default function PruebaDePaso({ situaciones, moduleNumber, moduleTitle, exitHref, onAprobada }: PruebaDePasoProps) {
  const reduced = usePrefersReducedMotion();
  const [fase, setFase] = useState<Fase>('intro');
  const [intento, setIntento] = useState(0);
  const [orden, setOrden] = useState(() => prepararIntento(situaciones));
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<{ situacionId: string; elegidaId: string }[]>([]);
  const [elegidaActual, setElegidaActual] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoPrueba | null>(null);

  const total = situaciones.length;
  const actual = orden[indice];

  const empezar = () => setFase('preguntas');

  const elegir = (opcionId: string) => {
    if (elegidaActual) return; // ya se registró; se está transicionando
    setElegidaActual(opcionId);
    const nuevas = [...respuestas, { situacionId: actual.id, elegidaId: opcionId }];
    setRespuestas(nuevas);

    const espera = reduced ? 120 : 420;
    setTimeout(() => {
      if (indice + 1 < orden.length) {
        setIndice((i) => i + 1);
        setElegidaActual(null);
      } else {
        const resultado = evaluarPrueba(situaciones, nuevas);
        setResultado(resultado);
        try {
          void fetch('/api/medir', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            keepalive: true,
            body: JSON.stringify({
              moduloId: `modulo-${moduleNumber}`,
              numero: moduleNumber,
              primerIntento: intento === 0,
              aprobado: resultado.aprobado,
              aciertos: resultado.aciertos,
              total: resultado.total,
              leccionesFalladas: [...new Set(resultado.fallos.map((fallo) => fallo.leccion))],
            }),
          }).catch(() => {});
        } catch {
          // Medir nunca debe impedir mostrar el resultado, tampoco si fetch lanza.
        }
        setFase('resultado');
      }
    }, espera);
  };

  const reintentar = () => {
    setIntento((n) => n + 1);
    setOrden(prepararIntento(situaciones));
    setIndice(0);
    setRespuestas([]);
    setElegidaActual(null);
    setResultado(null);
    setFase('preguntas');
  };

  const transition = reduced ? { duration: 0.1 } : { duration: DURATION.scene, ease: EASE_OUT_EXPO };

  return (
    <div className="pp-root">
      <header className="pp-header">
        <Link href={exitHref} className="pp-salir" aria-label="Volver al camino">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 5 L15 15 M15 5 L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
        {fase === 'preguntas' && (
          <div role="group" aria-label={`Situación ${indice + 1} de ${total}`} className="pp-progreso">
            <ProgressBar value={indice + 1} max={total} label={`Situación ${indice + 1} de ${total}`} height={6} />
          </div>
        )}
      </header>

      <main className="pp-main">
        <AnimatePresence mode="wait">
          {fase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={transition}
              className="pp-intro"
            >
              <span className="pp-etiqueta">Prueba de {moduleTitle}</span>
              <h1 className="pp-titulo">¿Qué tanto quedó de «{moduleTitle}»?</h1>
              <p className="pp-lead">
                Son {total} situaciones reales, no preguntas de examen. Sin reloj. Si alguna falla, te digo
                exactamente qué repasar y puedes volver a intentarlo cuando quieras — sin límite.
              </p>
              <button type="button" className="pp-btn pp-btn--principal" onClick={empezar}>
                Empezar
              </button>
            </motion.div>
          )}

          {fase === 'preguntas' && actual && (
            <motion.div
              key={`${intento}-${actual.id}`}
              initial={{ opacity: 0, x: SHIFT }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -SHIFT }}
              transition={transition}
            >
              <p className="pp-situacion">{actual.situacion}</p>
              <div role="radiogroup" aria-label={actual.situacion} className="pp-opciones">
                {actual.opciones.map((op) => {
                  const marcada = elegidaActual === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      role="radio"
                      aria-checked={marcada}
                      disabled={elegidaActual !== null && !marcada}
                      className="pp-opcion"
                      data-elegida={marcada}
                      onClick={() => elegir(op.id)}
                    >
                      <span className="pp-punto" aria-hidden="true" />
                      {op.texto}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {fase === 'resultado' && resultado && (
            <motion.div
              key="resultado"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
            >
              {resultado.aprobado ? (
                <Aprobado
                  moduleTitle={moduleTitle}
                  aciertos={resultado.aciertos}
                  total={resultado.total}
                  onContinuar={onAprobada}
                  reduced={reduced}
                />
              ) : (
                <NoAprobado
                  resultado={resultado}
                  situaciones={situaciones}
                  umbral={umbralAprobar(total)}
                  onReintentar={reintentar}
                  exitHref={exitHref}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/** Reordena situaciones y, dentro de cada una, sus opciones. Distinto orden en cada intento. */
function prepararIntento(situaciones: readonly SituacionPrueba[]): SituacionPrueba[] {
  return barajar(situaciones).map((s) => ({ ...s, opciones: barajar(s.opciones) }));
}

function Aprobado({
  moduleTitle,
  aciertos,
  total,
  onContinuar,
  reduced,
}: {
  moduleTitle: string;
  aciertos: number;
  total: number;
  onContinuar: () => void;
  reduced: boolean;
}) {
  return (
    <div className="pp-resultado">
      <motion.div aria-hidden="true" animate={reduced ? undefined : variants.hop}>
        <Image src="/monedita/monedita.webp" alt="" width={96} height={102} style={{ height: 'auto' }} />
      </motion.div>
      <h1 className="pp-titulo">Aprobaste la prueba de {moduleTitle}.</h1>
      <p className="pp-lead">
        Respondiste bien {aciertos} de {total}. Ya entiendes cómo funciona esto — no de memoria: lo pensaste en
        situaciones reales.
      </p>
      <button type="button" className="pp-btn pp-btn--principal" onClick={onContinuar}>
        Seguir
      </button>
    </div>
  );
}

function NoAprobado({
  resultado,
  situaciones,
  umbral,
  onReintentar,
  exitHref,
}: {
  resultado: ResultadoPrueba;
  situaciones: readonly SituacionPrueba[];
  umbral: number;
  onReintentar: () => void;
  exitHref: string;
}) {
  // Un tema por lección fallada; si la misma lección aparece dos veces (no pasa hoy, pero
  // por si el contenido crece) no se repite en la lista de repaso.
  const temas = useMemo(() => {
    const vistos = new Set<number>();
    return resultado.fallos.filter((f) => (vistos.has(f.leccion) ? false : (vistos.add(f.leccion), true)));
  }, [resultado.fallos]);

  const conceptoDe = (leccion: number): string | null => {
    const s = situaciones.find((s) => s.leccion === leccion);
    return s ? s.concepto : null;
  };

  return (
    <div className="pp-resultado">
      <span className="pp-etiqueta">
        {resultado.aciertos} de {resultado.total} · se necesitaban {umbral}
      </span>
      <h1 className="pp-titulo">Todavía no. Repasemos esto antes de volver a intentarlo.</h1>
      <p className="pp-lead">
        No se trata de acertar de una vez: se trata de que quede claro. Esto es lo que conviene mirar de nuevo.
      </p>

      <div className="pp-repasos">
        {temas.map((t) => (
          <div key={t.leccion} className="pp-repaso">
            <span className="pp-etiqueta">Repaso de 30 segundos · lección {t.leccion}</span>
            <p className="pp-repaso-tema">{t.tema}</p>
            {conceptoDe(t.leccion) && <p className="pp-repaso-situacion">{conceptoDe(t.leccion)}</p>}
          </div>
        ))}
      </div>

      <div className="pp-acciones">
        <button type="button" className="pp-btn pp-btn--principal" onClick={onReintentar}>
          Reintentar
        </button>
        <Link href={exitHref} className="pp-btn">
          Volver más tarde
        </Link>
      </div>
    </div>
  );
}
