'use client';

import RollingNumber from './RollingNumber';

interface StreakBadgeProps {
  /** Días seguidos con al menos una lección completada */
  days: number;
}

function Flame({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
        fill={active ? 'var(--brand-500)' : 'var(--border)'}
        stroke={active ? 'var(--brand-700)' : 'var(--ink-secondary)'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * StreakBadge — racha diaria. Con 0 días la llama va apagada (gris), sin reproche.
 */
export default function StreakBadge({ days }: StreakBadgeProps) {
  const active = days > 0;

  return (
    <div
      role="status"
      aria-label={`Racha de ${days} ${days === 1 ? 'día' : 'días'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-1) var(--space-3)',
        minHeight: 32,
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-pill)',
        color: active ? 'var(--ink)' : 'var(--ink-secondary)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-semibold)',
      }}
    >
      <Flame active={active} />
      <RollingNumber value={days} />
      <span
        style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--ink-secondary)',
        }}
      >
        racha
      </span>
    </div>
  );
}
