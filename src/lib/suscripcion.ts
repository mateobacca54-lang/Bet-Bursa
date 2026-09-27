/** Versión vigente de la política de tratamiento de datos (ver /privacidad). */
export const VERSION_POLITICA_ACTUAL = '2026-09-25';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SolicitudSuscripcion {
  correo: string;
  consentimiento: true;
  versionPolitica: string;
}

export type ValidacionSuscripcion =
  | { ok: true; datos: SolicitudSuscripcion }
  | { ok: false; error: string };

/**
 * Valida el cuerpo de POST /api/suscribir de forma pura, sin red ni Request.
 * Exige correo válido y consentimiento explícito (Ley 1581 de 2012 / Decreto 1377 de 2013).
 */
export function validarSolicitudSuscripcion(datos: unknown): ValidacionSuscripcion {
  const objeto = (typeof datos === 'object' && datos !== null ? datos : {}) as Record<string, unknown>;

  const correo = typeof objeto.correo === 'string' ? objeto.correo.trim() : '';
  if (!CORREO_VALIDO.test(correo)) {
    return { ok: false, error: 'correo inválido' };
  }

  if (objeto.consentimiento !== true) {
    return { ok: false, error: 'falta el consentimiento' };
  }

  // La versión de la política la decide el servidor, nunca el cliente:
  // así evitamos que una solicitud manipulada declare haber aceptado una versión distinta.
  return { ok: true, datos: { correo, consentimiento: true, versionPolitica: VERSION_POLITICA_ACTUAL } };
}
