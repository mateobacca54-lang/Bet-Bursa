import Image from 'next/image';
import Link from 'next/link';

/** Imagotipo provisional entregado por el equipo de Bursa. */
export default function BursaLogo() {
  return (
    <Link href="/" aria-label="Bursa, inicio" className="lp-logo">
      <span className="lp-logo-art">
        <Image
          src="/brand/bursa-imagotipo-h-principal.jpg"
          alt=""
          fill
          sizes="144px"
          className="lp-logo-img"
          draggable={false}
        />
      </span>
    </Link>
  );
}
