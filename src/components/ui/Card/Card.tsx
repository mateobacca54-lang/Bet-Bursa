import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type CardVariant = 'raised' | 'sunk' | 'ink';
export type CardSize = 'md' | 'lg';
export type CardPad = 'sm' | 'md' | 'lg';

interface CardOwnProps<T extends ElementType> {
  as?: T;
  variant?: CardVariant;
  size?: CardSize;
  pad?: CardPad;
  className?: string;
  children?: ReactNode;
}

export type CardProps<T extends ElementType = 'div'> = CardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>;

/**
 * Card — tarjeta base (DESIGN.md §5). `raised` lleva siempre filo + sombra suave;
 * `sunk` es un bloque hundido de papel; `ink` es el héroe oscuro (máximo uno por pantalla).
 * Polimórfico con `as` (div, section, article, li…) para que nunca se anide mal el HTML.
 */
export default function Card<T extends ElementType = 'div'>({
  as,
  variant = 'raised',
  size = 'md',
  pad = 'md',
  className,
  children,
  ...rest
}: CardProps<T>) {
  const Component = (as ?? 'div') as ElementType;

  const classes = [
    'ui-card',
    `ui-card--${variant}`,
    size === 'lg' ? 'ui-card--lg' : '',
    `ui-card--pad-${pad}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
