'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_OUT_EXPO, REDUCED_DURATION } from '@/lib/motion';
import { Estampa } from '@/components/illus';
import type { LandingCard } from './landing-data';
import './landing.css';

interface TopicSheetProps {
  card: LandingCard;
  /** Dónde estaba la tarjeta al tocarla: el panel nace desde ahí */
  origin: { x: number; y: number; width: number };
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Ancho aproximado del panel abierto (px); sirve para calcular desde qué escala nace */
const SHEET_W = 440;

/**
 * TopicSheet — el panel que se abre al tocar una tarjeta de tema. Da lo mínimo del tema:
 * la pregunta con la que arranca la lección y su idea central (ambas del temario, literales).
 *
 * Es un diálogo modal de verdad: el foco entra en él y no sale, Esc y el clic fuera lo cierran,
 * y el que lo abrió recupera el foco (lo hace quien lo monta). Nace desde la posición de la
 * tarjeta con `transform` y `opacity` solamente; con prefers-reduced-motion solo se desvanece.
 */
export default function TopicSheet({ card, origin, onClose }: TopicSheetProps) {
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Desde dónde nace: se calcula al montar (el panel solo existe tras un clic, en el navegador).
  const [from] = useState(() => {
    const w = typeof window === 'undefined' ? 1200 : window.innerWidth;
    const h = typeof window === 'undefined' ? 800 : window.innerHeight;
    return {
      x: origin.x - w / 2,
      y: origin.y - h / 2,
      scale: Math.min(1, Math.max(0.35, origin.width / Math.min(SHEET_W, w - 32))),
    };
  });

  useEffect(() => {
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    // Si el foco quedó fuera del panel (p. ej. sobre el telón), Tab lo devuelve adentro
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

  const enter = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: REDUCED_DURATION } }
    : {
        initial: { opacity: 0, x: from.x, y: from.y, scale: from.scale },
        animate: { opacity: 1, x: 0, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
        transition: { duration: DURATION.scene, ease: EASE_OUT_EXPO },
      };

  return (
    <div className="lp-sheet-root" onKeyDown={onKeyDown}>
      {/* Es un botón de verdad (no un div con onClick). Queda fuera del orden de tabulación:
          el teclado ya cierra con Esc y con el botón "Cerrar" del panel. */}
      <motion.button
        type="button"
        className="lp-sheet-backdrop"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? REDUCED_DURATION : DURATION.element }}
      />
      <motion.div
        ref={panelRef}
        className="lp-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`tema-${card.lesson}-titulo`}
        {...enter}
      >
        <Estampa scene={card.scene} className="lp-sheet-art" />
        <div className="lp-sheet-body">
          <span className={`lp-pill${card.available ? ' lp-pill--on' : ''}`}>
            {card.available ? 'Disponible' : 'Pronto'}
          </span>
          <h2 id={`tema-${card.lesson}-titulo`} className="lp-sheet-title">
            {card.title}
          </h2>

          <p className="lp-sheet-label">Arranca con esta pregunta</p>
          <p className="lp-sheet-hook">{card.hook}</p>

          <p className="lp-sheet-label">La idea</p>
          <p className="lp-sheet-text">{card.keyConcept}</p>

          <div className="lp-sheet-actions">
            <Link href="/inicio" className="lp-btn lp-btn--primary">
              {card.available ? 'Empieza el Módulo 1' : 'Ver el Módulo 1'}
            </Link>
            <button ref={closeRef} type="button" className="lp-btn lp-btn--ghost" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
