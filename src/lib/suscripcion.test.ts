import { describe, expect, it } from 'vitest';
import { validarSolicitudSuscripcion, VERSION_POLITICA_ACTUAL } from './suscripcion';

describe('validarSolicitudSuscripcion', () => {
  it('acepta correo válido con consentimiento y versión de política', () => {
    const r = validarSolicitudSuscripcion({
      correo: 'persona@ejemplo.com',
      consentimiento: true,
      versionPolitica: VERSION_POLITICA_ACTUAL,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.datos).toEqual({
        correo: 'persona@ejemplo.com',
        consentimiento: true,
        versionPolitica: VERSION_POLITICA_ACTUAL,
      });
    }
  });

  it('usa la versión de política vigente si no la mandan', () => {
    const r = validarSolicitudSuscripcion({ correo: 'persona@ejemplo.com', consentimiento: true });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.datos.versionPolitica).toBe(VERSION_POLITICA_ACTUAL);
  });

  it('ignora la versión de política que mande el cliente y usa siempre la vigente', () => {
    const r = validarSolicitudSuscripcion({
      correo: 'persona@ejemplo.com',
      consentimiento: true,
      versionPolitica: 'otra',
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.datos.versionPolitica).toBe(VERSION_POLITICA_ACTUAL);
  });

  it('rechaza si falta el consentimiento', () => {
    const r = validarSolicitudSuscripcion({ correo: 'persona@ejemplo.com' });
    expect(r).toEqual({ ok: false, error: 'falta el consentimiento' });
  });

  it('rechaza si el consentimiento no es exactamente true', () => {
    const r = validarSolicitudSuscripcion({ correo: 'persona@ejemplo.com', consentimiento: 'true' });
    expect(r).toEqual({ ok: false, error: 'falta el consentimiento' });
  });

  it('rechaza correo inválido', () => {
    const r = validarSolicitudSuscripcion({ correo: 'sin-arroba', consentimiento: true });
    expect(r).toEqual({ ok: false, error: 'correo inválido' });
  });

  it('rechaza tipos equivocados sin lanzar', () => {
    expect(validarSolicitudSuscripcion(null)).toEqual({ ok: false, error: 'correo inválido' });
    expect(validarSolicitudSuscripcion('texto')).toEqual({ ok: false, error: 'correo inválido' });
    expect(validarSolicitudSuscripcion({ correo: 42, consentimiento: true })).toEqual({
      ok: false,
      error: 'correo inválido',
    });
  });
});
