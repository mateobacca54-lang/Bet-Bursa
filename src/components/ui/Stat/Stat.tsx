'use client';

import type { ReactNode } from 'react';
import NumberFlow, { type Format } from '@number-flow/react';

export interface StatProps {
  value: number;
  format?: Intl.NumberFormatOptions;
  /** Por defecto 'es-CO': pesos colombianos, separador de miles con punto. */
  locale?: string;
  label: ReactNode;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Stat — la cifra protagonista más su rótulo (DESIGN.md §5). La cifra rueda con
 * NumberFlow, que ya respeta `prefers-reduced-motion` por su cuenta.
 */
export default function Stat({
  value,
  format,
  locale = 'es-CO',
  label,
  prefix,
  suffix,
  className,
}: StatProps) {
  const classes = ['ui-stat', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span className="ui-stat__value">
        <NumberFlow
          value={value}
          format={format as Format | undefined}
          locales={locale}
          prefix={prefix}
          suffix={suffix}
        />
      </span>
      <span className="ui-stat__label">{label}</span>
    </div>
  );
}
