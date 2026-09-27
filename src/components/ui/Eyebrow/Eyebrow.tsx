import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type EyebrowTone = 'brand' | 'muted';

interface EyebrowOwnProps<T extends ElementType> {
  as?: T;
  tone?: EyebrowTone;
  className?: string;
  children?: ReactNode;
}

export type EyebrowProps<T extends ElementType = 'p'> = EyebrowOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof EyebrowOwnProps<T>>;

/**
 * Eyebrow — el rótulo en mayúsculas (DESIGN.md §5). Es lo ÚNICO que va en mayúsculas
 * ("LECCIÓN 3 · INTERÉS"); nunca en botones, títulos u opciones (DESIGN.md §3).
 */
export default function Eyebrow<T extends ElementType = 'p'>({
  as,
  tone = 'muted',
  className,
  children,
  ...rest
}: EyebrowProps<T>) {
  const Component = (as ?? 'p') as ElementType;

  const classes = ['ui-eyebrow', `ui-eyebrow--${tone}`, className].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
