'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCtaProgreso } from '@/lib/useCtaProgreso';
import '../../landing.css';
import '../capitulos.css';

/**
 * HeroMoneda — la primera pantalla de la landing (docs/DIRECCION-LANDING.md §5.1).
 *
 * Una frase enorme, sin jerga, y una sola moneda de vidrio y oro quieta detrás del
 * texto: nada que arrastrar ni predecir todavía (la interactividad se ganó en la
 * Sección 2 del plan; aquí solo hay que decir "esto es serio y esto es para ti").
 *
 * El CTA principal cambia para quien ya tiene progreso (`useCtaProgreso`): antes de
 * hidratar siempre muestra el de por defecto, igual que el servidor, así que no hay
 * salto de contenido al hidratar.
 */
export default function HeroMoneda() {
  const cta = useCtaProgreso();

  return (
    <section id="inicio" className="lp-section lp-hero" aria-labelledby="hero-titulo">
      <div className="lp-wrap lp-hero-grid">
        <div className="lp-hero-copy">
          <h1 id="hero-titulo" className="lp-hero-title">
            Entiende tu plata.
          </h1>
          <p className="lp-hero-lead">
            Aprende con ejemplos de la vida diaria. Tú eliges qué crees que pasará y descubres por qué.
          </p>
          <div className="lp-hero-actions">
            <Link href={cta.href} className="lp-btn lp-btn--primary">
              {cta.label}
            </Link>
            <a href="#como-aprendes-app" className="lp-btn lp-btn--secondary">
              Ver cómo aprendes
            </a>
          </div>
          <p className="hm-confianza">
            Gratis <span aria-hidden="true">·</span> Hecho en Colombia <span aria-hidden="true">·</span> Con datos del
            Banco de la República
          </p>
        </div>

        <div className="hm-art">
          <Image
            src="/landing/moneda.webp"
            alt="Una moneda de vidrio y oro con la onda de Bursa grabada, sobre un pedestal naranja"
            width={1600}
            height={1195}
            sizes="(max-width: 799px) 84vw, 460px"
            priority
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
