'use client';

import Link from 'next/link';
import { Imagotipo } from '@/components/brand';
import { nombreModulo } from '@/content/modulos';
import ApareceAlBajar from './ApareceAlBajar';
import LeeLaLetra from './LeeLaLetra';
import CaminoParadas from './CaminoParadas';
import AsiSeAprende from './AsiSeAprende';
import Cierre from './Cierre';
import { CapituloEncoge, CapituloCrece } from './capitulos';
import HeroGaleria from './HeroGaleria';
import { DatosDeHoy } from './DatosDeHoy';
import NavPildora, { type AnclaNav } from './NavPildora';
import { useScrollSuave } from '@/lib/useScrollSuave';
import { useCtaProgreso } from '@/lib/useCtaProgreso';
import './landing.css';

const ANCLAS: readonly AnclaNav[] = [
  { id: 'capitulo-encoge', etiqueta: 'Inflación' },
  { id: 'capitulo-crece', etiqueta: 'Interés' },
  { id: 'lee-la-letra', etiqueta: 'Crédito' },
  { id: 'como-aprendes-app', etiqueta: 'La app' },
  { id: 'camino', etiqueta: 'La ruta' },
  { id: 'instituciones', etiqueta: 'Instituciones' },
];

const INSTITUCIONES_MAILTO = 'mailto:soy.bursa.co@gmail.com?subject=Bursa%20para%20instituciones';

const INSTITUCIONES_LISTA = [
  `Las 10 lecciones de ${nombreModulo(1)} están listas.`,
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
 * Landing — la página pública de Bursa (`/`), dirección "La galería de tu plata"
 * (docs/PLAN-LANDING-V3.md).
 *
 * Estructura: navegación en píldora → héroe (la moneda gira hasta mirarte) → datos de hoy
 * (banda oscura con los indicadores reales) → "tu plata se encoge" (inflación) → "mira
 * crecer tu plata" (ahorro vs. CDT, con el monto que elijas) → crédito → así se aprende
 * (carrusel con la app real) → la ruta (un pedestal por módulo) → instituciones → preguntas
 * → cierre → pie. El naranja se reserva para la acción y el dato.
 */
export default function Landing() {
  const cta = useCtaProgreso();
  useScrollSuave();

  return (
    <div className="lp">
      <ApareceAlBajar />
      <a href="#main-content" className="lp-skip">
        Saltar al contenido
      </a>

      <NavPildora anclas={ANCLAS} cta={cta} />

      <main id="main-content">
        <HeroGaleria />
        <DatosDeHoy />
        <CapituloEncoge />
        <CapituloCrece />
        <LeeLaLetra />
        <AsiSeAprende />
        <CaminoParadas />

        <section id="instituciones" className="lp-section lp-inst" aria-labelledby="instituciones-titulo">
          <div className="lp-wrap">
            <div className="lp-inst-card">
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
          <div className="lp-wrap lp-faq-grid">
            <h2 id="preguntas-titulo" className="lp-title">
              Antes de empezar
            </h2>
            <ul className="lp-faq-list">
              {PREGUNTAS.map((item, i) => (
                <li key={item.q} className="lp-faq-item">
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

        <Cierre />
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <p className="lp-footer-word"><Imagotipo variante="horizontal" titulo="Bursa" className="lp-footer-logo" /></p>
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
            <li>
              <Link href="/privacidad">Política de datos</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
