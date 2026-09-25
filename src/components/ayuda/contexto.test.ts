import { describe, it, expect } from 'vitest';
import { leerRuta, resumirNavegador, resumirContexto, MOTIVOS, type ContextoReporte } from './contexto';

describe('Contexto de un reporte', () => {
  describe('leerRuta', () => {
    it('saca módulo y lección de una ruta de lección', () => {
      expect(leerRuta('/modulo/1/leccion/3')).toEqual({ modulo: 1, leccion: 3 });
    });

    it('saca solo el módulo en el camino', () => {
      expect(leerRuta('/modulo/2')).toEqual({ modulo: 2, leccion: null });
    });

    it('devuelve nulos donde no hay módulo', () => {
      for (const r of ['/', '/inicio', '/ajustes', '']) {
        expect(leerRuta(r)).toEqual({ modulo: null, leccion: null });
      }
    });
  });

  describe('resumirNavegador', () => {
    it('reconoce los navegadores sin confundir Chrome con los que se hacen pasar por él', () => {
      // Edge y Opera se anuncian también como Chrome: el orden de comprobación importa
      expect(resumirNavegador('Mozilla/5.0 (Windows NT 10.0) Chrome/120 Safari/537.36 Edg/120')).toBe('Edge · Windows');
      expect(resumirNavegador('Mozilla/5.0 (Windows NT 10.0) Chrome/120 Safari/537.36 OPR/106')).toBe('Opera · Windows');
      expect(resumirNavegador('Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile Safari/537.36')).toBe('Chrome · Android');
      expect(resumirNavegador('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Version/17.0 Mobile Safari/604.1')).toBe('Safari · iOS');
      expect(resumirNavegador('Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0')).toBe('Firefox · Linux');
    });

    it('no se rompe con algo desconocido', () => {
      expect(resumirNavegador('')).toBe('otro · otro');
    });
  });

  describe('resumirContexto: se le dice qué se envía antes de enviarlo', () => {
    const base: ContextoReporte = {
      ruta: '/modulo/1/leccion/3',
      modulo: 1,
      leccion: 3,
      ancho: 390,
      alto: 844,
      movimientoReducido: false,
      leccionesHechas: 2,
      navegador: 'Chrome · Android',
    };

    it('nombra la lección cuando está en una', () => {
      expect(resumirContexto(base)).toContain('la lección 3 del módulo 1');
    });

    it('nombra la página cuando no', () => {
      expect(resumirContexto({ ...base, ruta: '/inicio', modulo: null, leccion: null })).toContain('/inicio');
    });

    it('no promete nada que no se cumpla: termina en "Nada más"', () => {
      expect(resumirContexto(base)).toMatch(/Nada más\.$/);
    });
  });

  it('los cuatro motivos, con "no entendí" entre ellos', () => {
    expect(MOTIVOS).toHaveLength(4);
    expect(MOTIVOS.map((m) => m.id)).toContain('no-entendi');
  });
});
