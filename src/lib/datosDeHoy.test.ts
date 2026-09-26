import { describe, expect, it } from 'vitest';
import type { Indicador, IndicadorId } from '@/lib/indicadores/types';
import { RESPALDO } from '@/lib/indicadores/respaldo';
import {
  EXPLICACION,
  NOMBRE_CORTO,
  ORDEN_DATOS_DE_HOY,
  SIN_DATO,
  construirDatosDeHoy,
} from './datosDeHoy';

describe('ORDEN_DATOS_DE_HOY', () => {
  it('lleva los cinco indicadores, cada uno una sola vez', () => {
    expect(ORDEN_DATOS_DE_HOY).toHaveLength(5);
    expect(new Set(ORDEN_DATOS_DE_HOY).size).toBe(5);
    expect(new Set(ORDEN_DATOS_DE_HOY)).toEqual(
      new Set<IndicadorId>(['inflacion', 'tasaPolitica', 'cdt', 'trm', 'usura'])
    );
  });
});

describe('NOMBRE_CORTO / EXPLICACION', () => {
  it('cada indicador del orden tiene nombre y explicación no vacíos', () => {
    for (const id of ORDEN_DATOS_DE_HOY) {
      expect(NOMBRE_CORTO[id].length).toBeGreaterThan(0);
      expect(EXPLICACION[id].length).toBeGreaterThan(0);
    }
  });
});

describe('construirDatosDeHoy', () => {
  it('respeta el orden fijo y trae el valor formateado de cada indicador', () => {
    const datos = construirDatosDeHoy(RESPALDO);
    expect(datos.map((d) => d.id)).toEqual(ORDEN_DATOS_DE_HOY);

    const trm = datos.find((d) => d.id === 'trm')!;
    expect(trm.valorFormateado).toContain('3.330');
    expect(trm.periodo).toBe(RESPALDO.trm.periodo);
    expect(trm.fuente).toBe(RESPALDO.trm.fuente);
    expect(trm.url).toBe(RESPALDO.trm.url);
  });

  it('usa "Sin dato por ahora" en lugar de inventar un número cuando falta el valor', () => {
    const sinTrm: Record<IndicadorId, Indicador> = {
      ...RESPALDO,
      trm: { ...RESPALDO.trm, valor: null, fecha: '', periodo: '' },
    };
    const datos = construirDatosDeHoy(sinTrm);
    const trm = datos.find((d) => d.id === 'trm')!;
    expect(trm.valorFormateado).toBeNull();
    // El componente decide el texto de reemplazo; aquí solo confirmamos la constante existe
    // y no está vacía, para que la UI no la olvide.
    expect(SIN_DATO.length).toBeGreaterThan(0);

    // Las demás tarjetas siguen intactas: un dato faltante no rompe a los otros cuatro.
    expect(datos).toHaveLength(5);
    expect(datos.find((d) => d.id === 'inflacion')!.valorFormateado).not.toBeNull();
  });
});
