import type { ReactNode } from 'react';

export type PillTone = 'brand' | 'gold' | 'muted';

export interface PillProps {
  tone?: PillTone;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Pill — chip de estado pequeño (DESIGN.md §5): racha, "Hecha", "3 min".
 * `gold` es solo para lo que pertenece a Monedita (racha, celebraciones).
 */
export default function Pill({ tone = 'brand', icon, className, children }: PillProps) {
  const classes = ['ui-pill', `ui-pill--${tone}`, className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {icon && (
        <span className="ui-pill__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
