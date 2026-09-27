'use client';

import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type MouseEventHandler, type ReactNode } from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';

interface ButtonSharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Deshabilitado con `aria-disabled`, nunca con el atributo `disabled` nativo (DESIGN.md §5). */
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Sin `href`: es un `<button type="button">` real (o el `type` que se pida). */
type ButtonAsButtonProps = ButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
    href?: undefined;
  };

/** Con `href`: es un `next/link` real. */
type ButtonAsLinkProps = ButtonSharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

/**
 * Button — la pieza base de todos los botones de Bursa (DESIGN.md §5).
 *
 * Píldora, tipo oración (nunca mayúsculas), Montserrat semibold. `primary` es el único
 * acento naranja de la pantalla; úsalo una sola vez. Con `href` se vuelve un `<Link>`.
 */
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  props,
  ref
) {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    iconLeft,
    iconRight,
    disabled = false,
    className,
    children,
    href,
    onClick,
    ...rest
  } = props;

  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    size === 'lg' ? 'ui-btn--lg' : '',
    fullWidth ? 'ui-btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {iconLeft}
      {children}
      {iconRight}
    </>
  );

  if (href !== undefined) {
    const anchorRest = rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>;
    const anchorOnClick = onClick as MouseEventHandler<HTMLAnchorElement> | undefined;
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        aria-disabled={disabled ? 'true' : undefined}
        className={classes}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          anchorOnClick?.(event);
        }}
        {...anchorRest}
      >
        {content}
      </Link>
    );
  }

  const { type = 'button', ...buttonRest } = rest as Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onClick'
  >;
  const buttonOnClick = onClick as MouseEventHandler<HTMLButtonElement> | undefined;

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      aria-disabled={disabled ? 'true' : undefined}
      className={classes}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        buttonOnClick?.(event);
      }}
      {...buttonRest}
    >
      {content}
    </button>
  );
});

export default Button;
