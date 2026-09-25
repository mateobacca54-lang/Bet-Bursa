import type { SVGProps } from 'react';
import { HORIZONTAL, SIMBOLO, SIMBOLO_CHICO, VERTICAL, WORDMARK, type BrandShape } from './brand-paths';
import './brand.css';

export type ImagotipoVariante = 'horizontal' | 'vertical' | 'simbolo' | 'simbolo-chico' | 'wordmark';

/**
 * Tono según el fondo (manual de marca, lámina 05):
 * - positivo: sobre papel o blanco. Símbolo naranja, letras en tinta.
 * - negativo: sobre tinta. Símbolo naranja, letras en papel.
 * - mono: todo en `currentColor`, para fondos durazno u oro donde el naranja no llega a 3:1.
 * - sobre-naranja: sobre brand-600. Símbolo en papel, letras en tinta.
 */
export type ImagotipoTono = 'positivo' | 'negativo' | 'mono' | 'sobre-naranja';

interface ImagotipoProps extends Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'children'> {
  variante?: ImagotipoVariante;
  tono?: ImagotipoTono;
  /** Nombre accesible. Sin él, el logo es decorativo (el enlace que lo envuelve ya se nombra). */
  titulo?: string;
}

const Formas = ({ shape, className }: { shape: BrandShape; className: string }) => (
  <g className={className}>
    {shape.d.map((d, i) => (
      <path key={i} d={d} />
    ))}
  </g>
);

/**
 * Imagotipo — el logo aprobado en Figma: símbolo de dos trazos (una ola que termina en subida)
 * y «bursa» en minúscula, sin punto. El alto lo decide quien lo usa con CSS (`height`); el ancho
 * sale de la proporción. Para 24 px o menos, usa `simbolo-chico`.
 */
export default function Imagotipo({ variante = 'horizontal', tono = 'positivo', titulo, className, ...rest }: ImagotipoProps) {
  const a11y = titulo ? { role: 'img' as const, 'aria-label': titulo } : { 'aria-hidden': true as const, focusable: false as const };
  const cls = ['bursa-imagotipo', `bursa-imagotipo--${tono}`, className].filter(Boolean).join(' ');

  if (variante === 'simbolo' || variante === 'simbolo-chico') {
    const shape = variante === 'simbolo' ? SIMBOLO : SIMBOLO_CHICO;
    return (
      <svg viewBox={`0 0 ${shape.w} ${shape.h}`} className={cls} {...a11y} {...rest}>
        <Formas shape={shape} className="bursa-imagotipo-simbolo" />
      </svg>
    );
  }

  if (variante === 'wordmark') {
    return (
      <svg viewBox={`0 0 ${WORDMARK.w} ${WORDMARK.h}`} className={cls} {...a11y} {...rest}>
        <Formas shape={WORDMARK} className="bursa-imagotipo-letras" />
      </svg>
    );
  }

  const L = variante === 'horizontal' ? HORIZONTAL : VERTICAL;
  const escala = L.sym_h / SIMBOLO.h;
  const simboloX = variante === 'horizontal' ? 0 : (L.w - L.sym_w) / 2;
  const letras = variante === 'horizontal' ? { x: L.sym_w + L.gap, y: 0 } : { x: (L.w - WORDMARK.w) / 2, y: L.sym_h + L.gap };

  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className={cls} {...a11y} {...rest}>
      <g transform={`translate(${simboloX} 0) scale(${escala})`}>
        <Formas shape={SIMBOLO} className="bursa-imagotipo-simbolo" />
      </g>
      <g transform={`translate(${letras.x} ${letras.y})`}>
        <Formas shape={WORDMARK} className="bursa-imagotipo-letras" />
      </g>
    </svg>
  );
}
