'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong' | 'disabled';

export interface ChoiceProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'type'> {
  state?: ChoiceState;
  /** Icono o letra al inicio de la opción. */
  leading?: ReactNode;
  children: ReactNode;
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="ui-choice__check"
    >
      <path
        d="m5 12.5 4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Choice — la opción de respuesta real, un `<button>` (DESIGN.md §5). Se usa en la
 * apuesta, en la prueba y en Elegir. `disabled` va siempre por `aria-disabled`.
 */
const Choice = forwardRef<HTMLButtonElement, ChoiceProps>(function Choice(
  { state = 'idle', leading, children, className, onClick, ...rest },
  ref
) {
  const disabled = state === 'disabled';
  const classes = ['ui-choice', `ui-choice--${state}`, className].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      aria-disabled={disabled ? 'true' : undefined}
      aria-pressed={state === 'selected'}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {leading && <span className="ui-choice__leading">{leading}</span>}
      <span className="ui-choice__label">{children}</span>
      {state === 'correct' && <CheckIcon />}
    </button>
  );
});

export default Choice;
