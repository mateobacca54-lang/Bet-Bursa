'use client';

import { useEffect, useRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingVariant = 'display' | 'title';
export type HeadingSize = 'xl' | 'lg' | 'md' | 'sm';

export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
  /** Nivel semántico: 1 → h1 … 4 → h4. Por defecto 2. */
  level?: HeadingLevel;
  variant?: HeadingVariant;
  size?: HeadingSize;
  /**
   * Recibe el foco sin mostrar anillo justo después de montarse (el título de un paso de
   * lección, para lectores de pantalla). Ver DESIGN.md §11 y globals.css `[tabindex="-1"]:focus`.
   */
  focusOnMount?: boolean;
  className?: string;
  children?: ReactNode;
}

const TAGS: Record<HeadingLevel, 'h1' | 'h2' | 'h3' | 'h4'> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
};

/**
 * Heading — titulares de pantalla (DESIGN.md §5). `display` usa Bricolage
 * (`--font-display`); `title` usa Montserrat bold. `focusOnMount` mueve el foco de teclado
 * al título sin robar el scroll ni mostrar el anillo de `:focus-visible`.
 */
export default function Heading({
  level = 2,
  variant = 'display',
  size = 'lg',
  focusOnMount = false,
  className,
  children,
  ...rest
}: HeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const Tag = TAGS[level] as ElementType;

  useEffect(() => {
    if (focusOnMount) {
      ref.current?.focus({ preventScroll: true });
    }
  }, [focusOnMount]);

  const classes = ['ui-heading', `ui-heading--${variant}`, `ui-heading--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} tabIndex={focusOnMount ? -1 : undefined} className={classes} {...rest}>
      {children}
    </Tag>
  );
}
