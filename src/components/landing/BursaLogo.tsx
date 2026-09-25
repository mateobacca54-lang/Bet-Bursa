import Link from 'next/link';
import { Imagotipo } from '@/components/brand';

/** Imagotipo aprobado en Figma, en la barra de la landing. */
export default function BursaLogo() {
  return (
    <Link href="/" aria-label="Bursa, inicio" className="lp-logo">
      <Imagotipo variante="horizontal" className="lp-logo-art" />
    </Link>
  );
}
