'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { WidgetState } from '@/lib/types';
import './widget-guide.css';

type Mood = 'idle' | 'thinking' | 'celebrate' | 'encourage';

interface MoneditaGuideProps {
  message: string;
  state?: WidgetState;
  compact?: boolean;
}

/** Guía reutilizable: reacciona al ejercicio y ofrece una pista bajo demanda. */
export default function MoneditaGuide({
  message,
  state = 'idle',
  compact = false,
}: MoneditaGuideProps) {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const mood: Mood =
    state === 'correct' ? 'celebrate' :
    state === 'wrong' || state === 'revealed' ? 'encourage' :
    state === 'active' ? 'thinking' : 'idle';
  const animation = reduced
    ? { rotate: 0, y: 0, scale: 1 }
    : mood === 'celebrate'
      ? { rotate: [0, -7, 7, 0], y: [0, -10, 0], scale: [1, 1.06, 1] }
      : mood === 'thinking'
        ? { rotate: [0, -2, 2, 0], y: [0, -3, 0] }
        : mood === 'encourage'
          ? { rotate: [0, 3, 0], y: [0, -2, 0] }
          : { rotate: [0, -1.5, 1.5, 0], y: [0, -3, 0] };
  const imageSrc =
    mood === 'thinking' ? '/monedita/monedita-pensando.webp' :
    mood === 'celebrate' ? '/monedita/monedita-celebra.webp' :
    '/monedita/monedita.webp';

  return (
    <aside className={compact ? 'widget-guide widget-guide--compact' : 'widget-guide'}>
      <motion.div
        aria-hidden="true"
        animate={animation}
        transition={reduced ? { duration: 0 } : mood === 'idle' ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.45, ease: 'easeOut' }}
        className="widget-guide__figure"
      >
        <Image src={imageSrc} alt="" width={compact ? 68 : 92} height={compact ? 72 : 98} sizes={compact ? '68px' : '92px'} draggable={false} />
      </motion.div>
      <div className="widget-guide__copy">
        <span className="widget-guide__name">Monedita</span>
        <button type="button" className="widget-guide__trigger" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? 'Ocultar pista' : 'Pedir una pista'}
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.p className="widget-guide__bubble" role="status" initial={reduced ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -4 }} transition={{ duration: reduced ? 0 : 0.18 }}>
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
