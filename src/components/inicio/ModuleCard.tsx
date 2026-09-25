'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { variants } from '@/lib/motion';
import type { InicioModuleCard } from '@/lib/inicio';
import { ProgressBar } from '@/components/shell';
import './inicio.css';

interface ModuleCardProps {
  card: InicioModuleCard;
  title: string;
  blurb: string;
}

const CTA_LABEL: Record<Exclude<InicioModuleCard['status'], 'soon'>, string> = {
  start: 'Empezar',
  'in-progress': 'Seguir',
  complete: 'Repasar',
};

/**
 * ModuleCard — un módulo en el mapa de /inicio.
 *
 * El progreso se nombra como logro ("Llevas 2 de 10"), nunca como deuda. Un módulo por abrir
 * no es un enlace: es una tarjeta quieta con borde punteado y la etiqueta "Próximamente".
 */
export default function ModuleCard({ card, title, blurb }: ModuleCardProps) {
  const reduced = usePrefersReducedMotion();
  const { status, completed, total, href } = card;
  const soon = status === 'soon';

  return (
    <motion.article
      className="ini-card"
      data-status={status}
      aria-labelledby={`ini-modulo-${card.number}`}
      whileHover={soon || reduced ? undefined : variants.hoverLift}
    >
      <div>
        <h3 id={`ini-modulo-${card.number}`} className="ini-card-title">
          {title}
        </h3>
      </div>

      <p className="ini-card-blurb">{blurb}</p>

      <div className="ini-card-foot">
        {status === 'soon' && <span className="ini-chip" style={{ alignSelf: 'flex-start' }}>Próximamente</span>}

        {(status === 'in-progress' || status === 'complete') && completed !== null && total !== null && (
          <div className="ini-card-progress">
            <span className="ini-chip">{status === 'complete' ? 'Módulo completo' : `Llevas ${completed} de ${total}`}</span>
            <ProgressBar value={completed} max={total} label={`Progreso de ${title}`} />
          </div>
        )}

        {status !== 'soon' && href && (
          <div>
            <Link
              href={href}
              className={`ini-btn uppercase-tracking ${status === 'complete' ? 'ini-btn--quiet' : ''}`}
              aria-label={`${CTA_LABEL[status]}: ${title}`}
            >
              {CTA_LABEL[status]}
            </Link>
          </div>
        )}
      </div>
    </motion.article>
  );
}
