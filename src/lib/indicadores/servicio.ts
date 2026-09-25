// ============================================================
// servicio.ts — arma el juego completo de indicadores: en vivo cuando BanRep responde,
// respaldo cuando no. La usura no tiene serie en BanRep: siempre es respaldo.
// ============================================================

import { ID_MENU, pedirSerieBanRep } from './banrep';
import {
  combinarConRespaldo,
  parsearIndicador,
  seleccionarPrimeraSerie,
  seleccionarSerieCDT,
  seleccionarSerieInflacion,
} from './parse';
import { RESPALDO } from './respaldo';
import type { Indicador, IndicadorId, SerieBanRep } from './types';

const SELECTORES: Record<keyof typeof ID_MENU, (s: SerieBanRep[]) => SerieBanRep | null> = {
  inflacion: seleccionarSerieInflacion,
  tasaPolitica: seleccionarPrimeraSerie,
  cdt: seleccionarSerieCDT,
  trm: seleccionarPrimeraSerie,
};

export async function obtenerIndicadores(): Promise<Record<IndicadorId, Indicador>> {
  const ids = Object.keys(ID_MENU) as (keyof typeof ID_MENU)[];
  const vivos = await Promise.all(
    ids.map(async (id) => {
      const json = await pedirSerieBanRep(ID_MENU[id]);
      const r = RESPALDO[id];
      return json ? parsearIndicador(json, SELECTORES[id], { id, fuente: r.fuente, url: r.url }) : null;
    })
  );
  const out = { ...RESPALDO };
  ids.forEach((id, i) => {
    const vivo = vivos[i];
    // El respaldo de inflación trae la meta; si el vivo no la encontró, se conserva.
    if (vivo && id === 'inflacion' && vivo.metaInflacion === undefined) vivo.metaInflacion = RESPALDO.inflacion.metaInflacion;
    out[id] = combinarConRespaldo(vivo, RESPALDO[id]);
  });
  return out;
}
