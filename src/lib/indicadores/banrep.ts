// ============================================================
// banrep.ts — la única pieza que pide datos a la red.
//
// Consulta la API pública detrás del portal SUAMECA del Banco de la República. Nunca lanza:
// ante cualquier falla (red, TLS, timeout, JSON raro) devuelve `null` y quien llama usa el
// respaldo. Solo servidor.
// ============================================================

import { request } from 'node:https';
import { rootCertificates } from 'node:tls';
import { BANREP_INTERMEDIO_PEM } from './banrep-ca';

const ENDPOINT =
  'https://suameca.banrep.gov.co/estadisticas-economicas-back/rest/estadisticaEconomicaRestService/consultaMenuXId';
const REFERER = 'https://suameca.banrep.gov.co/estadisticas-economicas/';
const TIMEOUT_MS = 4000;
const MAX_BYTES = 2_000_000;

/** idMenu de cada serie en el catálogo de SUAMECA. */
export const ID_MENU = { inflacion: 100001, tasaPolitica: 59, cdt: 220003, trm: 1 } as const;

const CA = [...rootCertificates, BANREP_INTERMEDIO_PEM];

export function pedirSerieBanRep(idMenu: number): Promise<unknown | null> {
  return new Promise((resolve) => {
    const url = `${ENDPOINT}?idMenu=${encodeURIComponent(String(idMenu))}`;
    const req = request(
      url,
      { method: 'GET', ca: CA, timeout: TIMEOUT_MS, headers: { Referer: REFERER, Accept: 'application/json' } },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          resolve(null);
          return;
        }
        let bytes = 0;
        const partes: Buffer[] = [];
        res.on('data', (c: Buffer) => {
          bytes += c.length;
          if (bytes > MAX_BYTES) {
            req.destroy();
            resolve(null);
            return;
          }
          partes.push(c);
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(partes).toString('utf8')));
          } catch {
            resolve(null);
          }
        });
        res.on('error', () => resolve(null));
      }
    );
    req.on('timeout', () => req.destroy());
    req.on('error', () => resolve(null));
    req.end();
  });
}
