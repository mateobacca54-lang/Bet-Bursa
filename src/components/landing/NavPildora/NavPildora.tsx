'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BursaLogo from '../BursaLogo';
import './nav-pildora.css';

export interface AnclaNav {
  /** id de la sección a la que salta (sin #). */
  id: string;
  etiqueta: string;
}

interface NavPildoraProps {
  anclas: readonly AnclaNav[];
  cta: { label: string; href: string };
}

/**
 * NavPildora — navegación flotante de la landing (docs/PLAN-LANDING-V3.md §3): una píldora
 * translúcida sobre el contenido, con la marca, las anclas de cada capítulo y el botón
 * principal. La raya bajo el ancla activa dice en qué capítulo vas; solo se mueve con
 * `transform`.
 *
 * El `<header>` exterior mide `--lp-nav-h` y lleva la clase `lp-nav`: los capítulos anclados
 * leen su alto para fijarse justo debajo. Es transparente y no captura el puntero; solo la
 * píldora de adentro es interactiva.
 */
export default function NavPildora({ anclas, cta }: NavPildoraProps) {
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    const secciones = anclas
      .map((a) => document.getElementById(a.id))
      .filter((el): el is HTMLElement => el !== null);
    if (secciones.length === 0) return;

    const visibles = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visibles.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        // Activa: la sección que más ocupa la banda central de la ventana.
        let mejor: string | null = null;
        let max = 0;
        for (const [id, r] of visibles) {
          if (r > max) {
            max = r;
            mejor = id;
          }
        }
        setActiva(mejor);
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.01, 0.25, 0.5, 0.75, 1] }
    );
    secciones.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [anclas]);

  return (
    <header className="lp-nav navp">
      <div className="navp-pildora">
        <BursaLogo />
        <nav aria-label="Capítulos" className="navp-anclas">
          {anclas.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="navp-ancla"
              aria-current={activa === a.id ? 'true' : undefined}
            >
              {a.etiqueta}
            </a>
          ))}
        </nav>
        <div className="navp-acciones">
          <Link className="navp-secundario" href="/sobre">
            Quiénes somos
          </Link>
          <Link href={cta.href} className="lp-btn lp-btn--primary navp-cta">
            {cta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
