import Link from 'next/link';
import Image from 'next/image';
import { MODULOS } from '@/content/modulos';
import { agruparPorTramo } from '@/lib/ruta';
import './landing.css';
import './camino.css';

const TRAMOS = agruparPorTramo(MODULOS);

/**
 * CaminoParadas — "La galería de tu plata", capítulo 7 (docs/PLAN-LANDING-V3.md §3):
 * los 10 módulos como una fila de pedestales, agrupados en los tres tramos de
 * docs/RUTA-DE-APRENDIZAJE.md §3 (el tronco común y las dos ramas que nacen después).
 *
 * Cada objeto (`public/landing/ruta/modulo-{n}.webp`) es decorativo: el nombre del
 * módulo al lado ya dice lo mismo, por eso `alt=""`. El Módulo 1 es la única parada
 * disponible: su nombre es un enlace real a la lección; los demás se ven en silueta
 * atenuada, sin animación, con "Próximamente" en texto (nunca solo en color).
 *
 * En móvil cada tramo es una fila con scroll horizontal nativo y scroll-snap: se lee
 * como una vitrina, igual que en escritorio, sin convertir la ruta en una lista larga
 * de una sola columna que hay que leer de arriba abajo.
 */
export default function CaminoParadas() {
  return (
    <section id="camino" className="lp-section cam-section" aria-labelledby="cam-titulo">
      <div className="lp-wrap">
        <h2 id="cam-titulo" className="lp-title">
          Tu ruta, módulo por módulo.
        </h2>
        <p className="lp-lead">
          Los primeros cuatro módulos son el tronco común: los ve todo el mundo. Después hay dos
          ramas: si ya trabajas, y si quieres que tu plata crezca.
        </p>

        <div className="cam-tramos">
          {TRAMOS.map((tramo) => (
            <div key={tramo.id} className="cam-tramo">
              <p className="cam-tramo-etiqueta">{tramo.etiqueta}</p>
              <ol className="cam-galeria">
                {tramo.modulos.map((m) => (
                  <li key={m.numero} className="cam-pedestal">
                    <div className="cam-pedestal-imagen">
                      <Image
                        src={`/landing/ruta/modulo-${m.numero}.webp`}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 240px, 160px"
                        quality={90}
                        className={
                          m.disponible ? 'cam-pedestal-img' : 'cam-pedestal-img cam-pedestal-img--proximo'
                        }
                      />
                    </div>

                    {m.disponible ? (
                      <>
                        <h3 className="cam-pedestal-nombre">
                          <Link href="/modulo/1" className="cam-pedestal-enlace">
                            {m.nombre}
                          </Link>
                        </h3>
                        <p className="cam-pedestal-pregunta">{m.pregunta}</p>
                        <span className="cam-pedestal-estado cam-pedestal-estado--on">Disponible</span>
                      </>
                    ) : (
                      <>
                        <h3 className="cam-pedestal-nombre">{m.nombre}</h3>
                        <p className="cam-pedestal-pregunta">{m.pregunta}</p>
                        <span className="cam-pedestal-estado">Próximamente</span>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
