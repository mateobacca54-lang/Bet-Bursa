'use client';

import { Pill } from '@/components/ui';
import RollingNumber from './RollingNumber';

interface StreakBadgeProps {
  /** Días seguidos con al menos una lección completada */
  days: number;
}

function Flame({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
        fill={active ? 'var(--gold-500)' : 'var(--ink-soft)'}
        stroke={active ? 'var(--gold-700)' : 'var(--ink-soft)'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * StreakBadge — racha diaria. La racha es de Monedita (oro, DESIGN.md §2). Con 0 días la
 * llama va apagada, sin reproche.
 */
export default function StreakBadge({ days }: StreakBadgeProps) {
  const active = days > 0;

  return (
    <div role="status" aria-label={`Racha de ${days} ${days === 1 ? 'día' : 'días'}`}>
      <Pill tone={active ? 'gold' : 'muted'} icon={<Flame active={active} />}>
        <RollingNumber value={days} /> racha
      </Pill>
    </div>
  );
}
