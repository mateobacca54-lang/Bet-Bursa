import Image from 'next/image';
import Link from 'next/link';
import BursaLogo from './BursaLogo';
import HeroScrollScene from './HeroScrollScene';
import ApareceAlBajar from './ApareceAlBajar';
import LeeLaLetra from './LeeLaLetra';
import MetodoDemo from './MetodoDemo';
import CaminoParadas from './CaminoParadas';
import './landing.css';

const INSTITUCIONES_MAILTO = 'mailto:soy.bursa.co@gmail.com?subject=Bursa%20para%20instituciones';

const INSTITUCIONES_LISTA = [
  'Las 10 lecciones del Módulo 1 están listas.',
  'Tus estudiantes entran sin crear cuenta.',
  'Es gratis para ellos.',
];

const PREGUNTAS = [
  {
    q: '¿De verdad es gratis?',
    a: 'Sí. Aprender en Bursa es gratis para ti.',
  },
  {
    q: '¿Tengo que crear una cuenta?',
    a: 'No. Empiezas en un clic y tu avance se guarda en este dispositivo.',
  },
  {
    q: '¿Me van a decir en qué invertir?',
    a: 'No. Bursa es contenido educativo, no asesoría financiera. Te enseñamos a leer cómo funciona el dinero para que decidas tú.',
  },
  {
    q: '¿Cuánto dura cada lección?',
    a: 'Entre dos y tres minutos. Cada una enseña una sola idea.',
  },
  {
    q: '¿Para qué edad es?',
    a: 'Está pensada para personas de 15 a 25 años en Colombia, pero sirve a cualquiera que quiera entender su plata.',
  },
];

/**
 * Landing — la página pública de Bursa (`/`), rediseño v2.
 *
 * Estructura: barra → héroe con comparación visual → promesa →
 * ejemplo sencillo de ahorro e inversión → crédito → camino →
 * instituciones → preguntas → cierre → pie. Página blanca: el naranja se
 * reserva para el botón principal, Monedita y la elección activa.
 */
export default function Landing() {
  return (
    <div className="lp">
      <ApareceAlBajar />
      <a href="#main-content" className="lp-skip">
        Saltar al contenido
      </a>

      <header className="lp-nav">
        <BursaLogo />
        <nav aria-label="Principal" className="lp-nav-links">
          <a className="lp-nav-link" href="#como-aprendes">
            Aprender
          </a>
          <a className="lp-nav-link" href="#instituciones">
            Para instituciones
          </a>
          <Link className="lp-nav-link" href="/sobre">
            Quiénes somos
          </Link>
        </nav>
        <Link href="/inicio" className="lp-btn lp-btn--primary">
          Empieza gratis
        </Link>
      </header>

      <main id="main-content">
        <section id="inicio" className="lp-section lp-hero" aria-labelledby="hero-titulo">
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-hero-copy">
              <h1 id="hero-titulo" className="lp-hero-title">
                Aprende a leer las decisiones que mueven tu plata.
              </h1>
              <p className="lp-hero-lead">
                Aprende con ejemplos de la vida diaria. Tú eliges qué crees que pasará y descubres por qué.
              </p>
              <div className="lp-hero-actions">
                <Link href="/inicio" className="lp-btn lp-btn--primary">
                  Empieza gratis
                </Link>
                <a href="#como-aprendes" className="lp-btn lp-btn--secondary">
                  Ver cómo aprendes
                </a>
              </div>
            </div>

            <HeroScrollScene />
          </div>
        </section>

        <section className="lp-section lp-promises">
          <div className="lp-wrap">
            <div className="lp-promise">
              <p className="lp-promise-body">Aprender sobre tu plata es gratis.</p>
              <p className="lp-promise-detail">Hecho en Colombia, con ejemplos de acá.</p>
            </div>
          </div>
        </section>

        <MetodoDemo />
        <LeeLaLetra />
        <CaminoParadas />

        <section id="instituciones" className="lp-section lp-inst" aria-labelledby="instituciones-titulo">
          <div className="lp-wrap">
            <div className="lp-inst-card" data-aparece="subir">
              <div className="lp-inst-copy">
                <h2 id="instituciones-titulo" className="lp-title">
                  ¿Enseñas en un colegio, una universidad o una caja de compensación?
                </h2>
                <p className="lp-lead">
                  Estamos buscando las primeras instituciones para llevar Bursa a sus grupos. Escríbenos y
                  lo armamos contigo.
                </p>
                <a href={INSTITUCIONES_MAILTO} className="lp-btn lp-btn--secondary">
                  Escríbenos
                </a>
              </div>
              <div>
                <p className="lp-inst-side-title">Lo que ya existe hoy</p>
                <ul className="lp-inst-list">
                  {INSTITUCIONES_LISTA.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="preguntas" className="lp-section lp-section--paper lp-faq" aria-labelledby="preguntas-titulo">
          <div className="lp-wrap" style={{ maxWidth: 760 }}>
            <h2 id="preguntas-titulo" className="lp-title">
              Antes de empezar
            </h2>
            <ul className="lp-faq-list">
              {PREGUNTAS.map((item, i) => (
                <li key={item.q} className="lp-faq-item" data-aparece="subir">
                  <details open={i === 0}>
                    <summary className="lp-faq-summary">
                      <span>{item.q}</span>
                      <span className="lp-faq-icon" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="lp-faq-answer">{item.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lp-section lp-closing" aria-labelledby="cierre-titulo">
          <div className="lp-wrap lp-closing-inner">
            <div className="lp-closing-avatar">
              <Image
                src="/monedita/monedita.webp"
                alt="Monedita, la moneda que te acompaña en Bursa"
                width={600}
                height={640}
                draggable={false}
              />
            </div>
            <h2 id="cierre-titulo" className="lp-title">
              Tu primera lección dura tres minutos.
            </h2>
            <Link href="/inicio" className="lp-btn lp-btn--primary" data-aparece="subir">
              Empieza gratis
            </Link>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <p className="lp-footer-word">bursa</p>
          <p className="lp-footer-notice">
            Bursa es contenido educativo. No es asesoría financiera ni una recomendación de inversión:
            aprender cómo funciona el dinero no es lo mismo que decidir qué hacer con el tuyo.
          </p>
          <ul className="lp-footer-links">
            <li>
              <Link href="/sobre">Quiénes somos</Link>
            </li>
            <li>
              <a href="#instituciones">Para instituciones</a>
            </li>
            <li>
              <a href={INSTITUCIONES_MAILTO}>Escríbenos</a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
