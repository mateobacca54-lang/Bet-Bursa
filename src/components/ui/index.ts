/**
 * src/components/ui/ — las piezas base de Bursa (DESIGN.md §5).
 * Todo lo demás se arma con estas. Ver también ui.css, importado desde
 * src/app/globals.css.
 */

export { Button } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button';

export { Card } from './Card';
export type { CardPad, CardProps, CardSize, CardVariant } from './Card';

export { Eyebrow } from './Eyebrow';
export type { EyebrowProps, EyebrowTone } from './Eyebrow';

export { Heading } from './Heading';
export type { HeadingLevel, HeadingProps, HeadingSize, HeadingVariant } from './Heading';

export { Choice } from './Choice';
export type { ChoiceProps, ChoiceState } from './Choice';

export { Pill } from './Pill';
export type { PillProps, PillTone } from './Pill';

export { Stat } from './Stat';
export type { StatProps } from './Stat';

export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps, ProgressBarSize } from './ProgressBar';
