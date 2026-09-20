import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import StickyHero from './StickyHero';
import Manifesto from './Manifesto';
import ProductBento from './ProductBento';
import TryIt from './TryIt';
import PathPreview from './PathPreview';
import MarketStrip from './MarketStrip';
import './landing.css';

/**
 * Landing — la página que ve quien llega desde un buscador.
 * Orden: héroe (centro fijo) → qué es Bursa → cómo funciona → pruébalo → el camino →
 * los mercados de cerca → cierre. Tono: tutear, sin urgencia, sin cifras inventadas.
 */
export default function Landing() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <Link
          href="/"
          aria-label="Bursa, inicio"
          style={{
            color: 'var(--brand-500)',
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Bursa
        </Link>
        <nav aria-label="Principal" className="lp-nav-links">
          <a className="lp-nav-link" href="#como-funciona">
            Cómo funciona
          </a>
          <a className="lp-nav-link" href="#pruebalo">
            Pruébalo
          </a>
        </nav>
        <Link href="/modulo/1" className="lp-btn lp-btn--primary">
          Empezar
        </Link>
      </header>

      <main>
        <StickyHero />
        <Manifesto />
        <ProductBento />
        <TryIt />
        <PathPreview />
        <MarketStrip />

        <section className="lp-section lp-closing" aria-labelledby="cierre-titulo">
          <div className="lp-wrap" style={{ maxWidth: 720 }}>
            <Reveal>
              <h2 id="cierre-titulo" className="lp-display">
                Empieza por lo que ya <span className="lp-accent">viviste</span>.
              </h2>
              <p className="lp-lead" style={{ margin: 'var(--space-4) 0 var(--space-8) 0' }}>
                La primera lección es corta y no necesitas saber nada de finanzas.
              </p>
              <Link href="/modulo/1" className="lp-btn lp-btn--primary">
                Empieza el Módulo 1
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap">
          <strong style={{ color: 'var(--surface-raised)', letterSpacing: 'var(--tracking-wide)' }}>BURSA</strong>
          <p style={{ margin: 0, maxWidth: 640 }}>
            Bursa es contenido educativo. No es asesoría financiera ni una recomendación de inversión: aprender cómo funciona el dinero no es lo mismo que decidir qué hacer con el tuyo.
          </p>
        </div>
      </footer>
    </div>
  );
}
