'use client';

import { useEffect, useState } from 'react';
import type { Indicador, IndicadorId } from '@/lib/indicadores/types';
import { RESPALDO, META_INFLACION } from '@/lib/indicadores/respaldo';
import { formatearPorcentaje, formatearValorIndicador } from '@/lib/indicadores/formato';
import './dato-real.css';

type Mapa = Record<IndicadorId, Indicador>;

const ETIQUETA: Record<IndicadorId, string> = {
  inflacion: 'Inflación anual',
  cdt: 'DTF: lo que paga un CDT',
  tasaPolitica: 'Tasa del Banco de la República',
  usura: 'Tasa de usura',
  trm: 'Dólar hoy (TRM)',
};

/** Una frase que explica el término en la misma frase (regla de tono de AGENTS.md). */
function frase(ind: Indicador, v: string): string {
  switch (ind.id) {
    case 'inflacion':
      return `En los últimos 12 meses los precios en Colombia subieron en promedio ${v}. Eso es la inflación anual, y la mide el DANE. La meta del Banco de la República es ${formatearPorcentaje(ind.metaInflacion ?? META_INFLACION).replace(',00', '')}.`;
    case 'cdt':
      return `Un CDT (un depósito que dejas quieto un tiempo fijo) a 90 días pagaba en promedio ${v} al año. Ese promedio se llama DTF.`;
    case 'tasaPolitica':
      return `El Banco de la República les presta plata a los bancos a ${v} al año. Cuando la sube, los créditos se encarecen; cuando la baja, se abaratan.`;
    case 'usura':
      return `En ${ind.periodo}, ningún crédito de consumo puede cobrarte más de ${v} al año. Ese techo se llama tasa de usura y lo fija la Superintendencia Financiera.`;
    case 'trm':
      return `Hoy un dólar cuesta ${v}. Esa cifra oficial se llama TRM, la tasa representativa del mercado.`;
  }
}

/**
 * DatoReal — el concepto de la lección con el número de hoy en Colombia, fechado y con su
 * fuente. Pinta primero el respaldo (mismo HTML en servidor y cliente, sin salto) y luego
 * cambia al dato en vivo si /api/indicadores trae uno más nuevo. Sin animación de entrada:
 * el número no cambia de significado al actualizarse.
 */
/** Indicadores de hoy: respaldo al primer render (igual en servidor y cliente) y luego el dato en vivo. */
export function useIndicadores(): Mapa {
  const [datos, setDatos] = useState<Mapa>(RESPALDO);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/indicadores', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { indicadores?: Partial<Mapa> } | null) => {
        if (!j?.indicadores) return;
        setDatos((prev) => {
          const next = { ...prev };
          for (const id of Object.keys(prev) as IndicadorId[]) {
            const nuevo = j.indicadores?.[id];
            if (nuevo && typeof nuevo.valor === 'number') next[id] = nuevo;
          }
          return next;
        });
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  return datos;
}

export default function DatoReal({ indicadores }: { indicadores: IndicadorId[] }) {
  const datos = useIndicadores();

  const visibles = indicadores.map((id) => datos[id]).filter((d): d is Indicador => typeof d?.valor === 'number');
  if (visibles.length === 0) return null;

  return (
    <section className="dato-real" aria-labelledby="dato-real-titulo">
      <h2 id="dato-real-titulo" className="dato-real-titulo">
        Así está hoy en Colombia
      </h2>
      <ul className="dato-real-lista">
        {visibles.map((ind) => {
          const v = formatearValorIndicador(ind.id, ind.valor as number);
          return (
            <li key={ind.id} className="dato-real-tarjeta">
              <p className="dato-real-etiqueta">{ETIQUETA[ind.id]}</p>
              <p className="dato-real-valor">{v}</p>
              <p className="dato-real-frase">{frase(ind, v)}</p>
              <p className="dato-real-fuente">
                {ind.periodo} ·{' '}
                <a href={ind.url} target="_blank" rel="noopener noreferrer">
                  Fuente: {ind.fuente}
                  <span className="dato-real-sr"> (se abre en otra pestaña)</span>
                </a>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
