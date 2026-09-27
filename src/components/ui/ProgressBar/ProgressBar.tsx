export type ProgressBarSize = 'thin' | 'medium';

export interface ProgressBarProps {
  value: number;
  max: number;
  /** Texto para lectores de pantalla, ej. "Progreso del módulo 1". */
  label: string;
  /** thin = 6px, medium = 10px. Por defecto medium. */
  size?: ProgressBarSize;
  className?: string;
}

/**
 * ProgressBar — la pista de progreso base (DESIGN.md §5). El relleno se mueve con
 * `transform: scaleX`, nunca con `width` (AGENTS.md § Movimiento).
 *
 * No reemplaza a `src/components/shell/ProgressBar.tsx`: esa versión sigue en pie hasta
 * que se migre a este componente (ver DESIGN.md §5).
 */
export default function ProgressBar({ value, max, label, size = 'medium', className }: ProgressBarProps) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;

  const trackClasses = ['ui-progress-track', `ui-progress-track--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={trackClasses}
    >
      <div className="ui-progress-fill" style={{ transform: `scaleX(${ratio})` }} />
    </div>
  );
}
