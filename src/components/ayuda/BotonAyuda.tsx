'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO, REDUCED_DURATION, variants } from '@/lib/motion';
import { MOTIVOS, reunirContexto, resumirContexto, type MotivoReporte } from './contexto';
import './ayuda.css';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';
const MAX_TEXTO = 600;

type Estado = 'cerrado' | 'abierto' | 'enviando' | 'gracias' | 'falló';

/**
 * BotonAyuda — el aviso de que algo está mal.
 *
 * Existe porque hay defectos que ninguna prueba automática puede encontrar: que una
 * explicación no se entienda, que algo se vea raro en un teléfono que no tenemos. Hoy, si
 * una lección falla en el celular de alguien, esa persona se va y no nos enteramos nunca.
 *
 * Manda el contexto mínimo para poder reproducirlo (ver contexto.ts) y NADA que identifique
 * a una persona. Se le dice qué se envía antes de enviarlo.
 */
export default function BotonAyuda() {
  const reduced = usePrefersReducedMotion();
  const [estado, setEstado] = useState<Estado>('cerrado');
  const [motivo, setMotivo] = useState<MotivoReporte | null>(null);
  const [texto, setTexto] = useState('');
  const [resumen, setResumen] = useState('');
  const abridorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const primeroRef = useRef<HTMLButtonElement>(null);
  const abierto = estado !== 'cerrado';

  useEffect(() => {
    if (estado === 'abierto') primeroRef.current?.focus();
  }, [estado]);

  // Al cerrarse, el foco vuelve a quien lo abrió: si no, el teclado queda al principio de todo.
  function cerrar() {
    setEstado('cerrado');
    setMotivo(null);
    setTexto('');
    abridorRef.current?.focus();
  }

  function abrir() {
    setResumen(resumirContexto(reunirContexto()));
    setEstado('abierto');
  }

  async function enviar() {
    if (!motivo) return;
    setEstado('enviando');
    try {
      const res = await fetch('/api/reporte', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ motivo, texto: texto.slice(0, MAX_TEXTO), contexto: reunirContexto() }),
      });
      setEstado(res.ok ? 'gracias' : 'falló');
    } catch {
      setEstado('falló');
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      cerrar();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (!panelRef.current.contains(document.activeElement)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
      return;
    }
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const aparece = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: REDUCED_DURATION } }
    : {
        initial: { opacity: 0, y: 12, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.97 },
        transition: { duration: DURATION.scene, ease: EASE_OUT_EXPO },
      };

  return (
    <>
      <button
        ref={abridorRef}
        type="button"
        className="ay-abrir"
        onClick={abrir}
        aria-haspopup="dialog"
        aria-expanded={abierto}
      >
        <span aria-hidden="true">?</span>
        <span className="ay-abrir-texto">Ayuda</span>
      </button>

      <AnimatePresence>
        {abierto && (
          <div className="ay-root" onKeyDown={onKeyDown}>
            <motion.button
              type="button"
              className="ay-telon"
              aria-label="Cerrar"
              tabIndex={-1}
              onClick={cerrar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? REDUCED_DURATION : DURATION.element }}
            />
            <motion.div
              ref={panelRef}
              className="ay-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ay-titulo"
              {...aparece}
            >
              {estado === 'gracias' ? (
                <div className="ay-gracias">
                  {/* Monedita reacciona a lo que acabas de hacer: un saltito, nada más */}
                  <motion.div aria-hidden="true" animate={reduced ? undefined : variants.hop}>
                    <Image src="/monedita/monedita.webp" alt="" width={86} height={92} style={{ height: 'auto' }} />
                  </motion.div>
                  <div>
                    <h2 id="ay-titulo" className="ay-titulo">
                      Gracias por avisar.
                    </h2>
                    <p className="ay-lead">Ya quedó anotado. Así es como esto mejora.</p>
                  </div>
                  <button ref={primeroRef} type="button" className="ay-btn ay-btn--principal" onClick={cerrar}>
                    Seguir
                  </button>
                </div>
              ) : (
                <>
                  <h2 id="ay-titulo" className="ay-titulo">
                    ¿Qué pasó?
                  </h2>

                  <div className="ay-motivos" role="radiogroup" aria-labelledby="ay-titulo">
                    {MOTIVOS.map((m, i) => (
                      <button
                        key={m.id}
                        ref={i === 0 ? primeroRef : undefined}
                        type="button"
                        role="radio"
                        aria-checked={motivo === m.id}
                        className="ay-motivo"
                        onClick={() => setMotivo(m.id)}
                        disabled={estado === 'enviando'}
                      >
                        <span className="ay-punto" aria-hidden="true" />
                        {m.texto}
                      </button>
                    ))}
                  </div>

                  <label className="ay-campo">
                    <span className="ay-etiqueta">Cuéntame con tus palabras</span>
                    <textarea
                      className="ay-texto"
                      rows={3}
                      maxLength={MAX_TEXTO}
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      disabled={estado === 'enviando'}
                    />
                  </label>

                  <p className="ay-nota">{resumen}</p>

                  {estado === 'falló' && (
                    <p className="ay-error" role="alert">
                      No se pudo enviar. Puede ser la conexión: inténtalo otra vez.
                    </p>
                  )}

                  <div className="ay-acciones">
                    <button
                      type="button"
                      className="ay-btn ay-btn--principal"
                      onClick={enviar}
                      disabled={!motivo || estado === 'enviando'}
                    >
                      {estado === 'enviando' ? 'Enviando…' : 'Enviar'}
                    </button>
                    <button type="button" className="ay-btn" onClick={cerrar} disabled={estado === 'enviando'}>
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
