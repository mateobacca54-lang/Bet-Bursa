import { describe, expect, it } from 'vitest';
import {
  combinarConRespaldo,
  extraerSeries,
  fechaDesdeEpoch,
  obtenerUltimoPunto,
  parsearIndicador,
  seleccionarPrimeraSerie,
  seleccionarSerieCDT,
  seleccionarSerieInflacion,
} from './parse';
import { formatearPeriodo, formatearPorcentaje, formatearValorIndicador } from './formato';
import { RESPALDO } from './respaldo';
import inflacion from './__fixtures__/inflacion.json';
import tasaPolitica from './__fixtures__/tasaPolitica.json';
import cdt from './__fixtures__/cdt.json';
import trm from './__fixtures__/trm.json';

// Respuestas reales de BanRep del 2026-09-25, recortadas a sus últimos puntos.
const HOY = Date.UTC(2026, 8, 25, 12); // 25 sep 2026, mediodía UTC
const meta = (id: 'inflacion' | 'tasaPolitica' | 'cdt' | 'trm') => ({ id, fuente: 'Banco de la República', url: 'https://x' });

describe('fechaDesdeEpoch', () => {
  it('recupera el día de Bogotá desde la medianoche UTC-5', () => {
    expect(fechaDesdeEpoch(1788152400000)).toBe('2026-08-31');
  });
});

describe('selección de series con respuestas reales', () => {
  it('inflación: toma la total anual, no la meta', () => {
    const series = extraerSeries(inflacion)!;
    expect(seleccionarSerieInflacion(series)?.nombre).toBe('Inflación total anual');
  });

  it('CDT: toma la DTF a 90 días, no los CDT a 180 o 360', () => {
    expect(seleccionarSerieCDT(extraerSeries(cdt)!)?.nombre).toMatch(/DTF/);
  });

  it('inflación en vivo: 6,24 % de agosto de 2026 con meta de 3 %', () => {
    const r = parsearIndicador(inflacion, seleccionarSerieInflacion, meta('inflacion'), HOY);
    expect(r).toMatchObject({ valor: 6.24, fecha: '2026-08-31', periodo: 'agosto de 2026', origen: 'en-vivo', metaInflacion: 3 });
  });

  it('ignora los puntos con fecha futura (tasa diaria programada, DTF de la semana siguiente)', () => {
    const politica = parsearIndicador(tasaPolitica, seleccionarPrimeraSerie, meta('tasaPolitica'), HOY);
    expect((politica?.fecha ?? '9999') <= '2026-09-25').toBe(true);
    const dtf = parsearIndicador(cdt, seleccionarSerieCDT, meta('cdt'), HOY);
    expect(dtf).toMatchObject({ valor: 10.26, fecha: '2026-09-25' });
  });

  it('TRM diaria: el periodo dice el día', () => {
    const r = parsearIndicador(trm, seleccionarPrimeraSerie, meta('trm'), HOY);
    expect(r?.periodo).toBe('25 de septiembre de 2026');
  });
});

describe('respuestas raras', () => {
  it('devuelve null con JSON vacío, mal formado o sin serie que calce', () => {
    expect(parsearIndicador(null, seleccionarPrimeraSerie, meta('trm'))).toBeNull();
    expect(parsearIndicador({ SERIES: [] }, seleccionarPrimeraSerie, meta('trm'))).toBeNull();
    expect(parsearIndicador({ nada: 1 }, seleccionarPrimeraSerie, meta('trm'))).toBeNull();
    expect(parsearIndicador({ SERIES: [{ nombre: 'Otra cosa', data: [[1, 2]] }] }, seleccionarSerieCDT, meta('cdt'))).toBeNull();
  });

  it('ignora puntos nulos y no asume orden', () => {
    const serie = { nombre: 'x', unidad: '', descripcionPeriodicidad: '', data: [[3, null], [1, 5], [2, 7]] as [number, number | null][] };
    expect(obtenerUltimoPunto(serie)).toEqual({ epochMs: 2, valor: 7 });
  });
});

describe('combinarConRespaldo', () => {
  it('el dato en vivo gana; sin dato en vivo queda el respaldo', () => {
    const vivo = { ...RESPALDO.trm, valor: 4000, origen: 'en-vivo' as const };
    expect(combinarConRespaldo(vivo, RESPALDO.trm).valor).toBe(4000);
    expect(combinarConRespaldo(null, RESPALDO.trm)).toBe(RESPALDO.trm);
    expect(combinarConRespaldo({ ...vivo, valor: null }, RESPALDO.trm)).toBe(RESPALDO.trm);
  });

  it('todo respaldo tiene fecha, fuente y enlace', () => {
    for (const r of Object.values(RESPALDO)) {
      expect(r.valor).not.toBeNull();
      expect(r.periodo).not.toBe('');
      expect(r.url).toMatch(/^https:\/\//);
    }
  });
});

describe('formato es-CO', () => {
  it('porcentajes con coma', () => {
    expect(formatearPorcentaje(6.24)).toBe('6,24\u00a0%');
  });
  it('periodo mensual y diario', () => {
    expect(formatearPeriodo('2026-08-31')).toBe('agosto de 2026');
    expect(formatearPeriodo('2026-09-25', 'Diaria')).toBe('25 de septiembre de 2026');
  });
  it('la TRM va en pesos', () => {
    expect(formatearValorIndicador('trm', 3329.61)).toMatch(/3\.33\d/);
  });
});
