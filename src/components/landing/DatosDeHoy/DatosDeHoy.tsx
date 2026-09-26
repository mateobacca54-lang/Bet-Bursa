'use client';

import { useIndicadores } from '@/components/widgets/DatoReal';
import { construirDatosDeHoy, SIN_DATO } from '@/lib/datosDeHoy';
import '../landing.css';
import './datos-de-hoy.css';

/**
 * DatosDeHoy — banda oscura de la landing v3 (docs/PLAN-LANDING-V3.md §3, fila 2),
 * inspirada en la franja de "datos en vivo" de Ramp. Muestra los cinco indicadores
 * reales del Banco de la República que ya trae `useIndicadores()`, cada uno con su
 * fecha y su fuente enlazada.
 *
 * Deliberadamente estática: no hay cinta en movimiento ni transición al llegar el
 * dato en vivo, porque moverla no explica nada (el movimiento explica o no existe,
 * AGENTS.md). Si un indicador no trae valor, la tarjeta igual aparece con
 * "Sin dato por ahora": el error no castiga, y la fila de cinco no se rompe.
 */
export default function DatosDeHoy() {
  const indicadores = useIndicadores();
  const datos = construirDatosDeHoy(indicadores);

  return (
    <section id="datos-de-hoy" className="lp-section ddh" aria-labelledby="ddh-titulo">
      <div className="lp-wrap ddh-inner">
        <p className="ddh-eyebrow">Datos de hoy</p>
        <h2 id="ddh-titulo" className="lp-title ddh-title">
          Así está la plata en Colombia hoy.
        </h2>

        <dl className="ddh-lista">
          {datos.map((d) => (
            <div className="ddh-item" key={d.id}>
              <dt className="ddh-nombre">{d.nombreCorto}</dt>
              <dd className="ddh-valor">{d.valorFormateado ?? SIN_DATO}</dd>
              <dd className="ddh-explica">{d.explicacion}</dd>
              {d.valorFormateado !== null && (
                <dd className="ddh-fuente">
                  {d.periodo}
                  {d.periodo && ' · '}
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noopener noreferrer">
                      Fuente: {d.fuente}
                      <span className="lp-sr-only"> (se abre en otra pestaña)</span>
                    </a>
                  ) : (
                    <>Fuente: {d.fuente}</>
                  )}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
