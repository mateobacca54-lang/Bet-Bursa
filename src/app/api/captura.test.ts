import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as medir } from './medir/route';
import { POST as suscribir } from './suscribir/route';
import { POST as reporte } from './reporte/route';
import { enviarCorreoInterno } from '@/lib/correo';
import { pasaElLimite } from '@/lib/limiteDeTasa';

vi.mock('@/lib/correo', () => ({ enviarCorreoInterno: vi.fn() }));
vi.mock('@/lib/limiteDeTasa', () => ({ pasaElLimite: vi.fn() }));
beforeEach(() => {
  vi.mocked(pasaElLimite).mockReturnValue(true);
  vi.mocked(enviarCorreoInterno).mockResolvedValue({ enviado: false });
});
afterEach(() => vi.restoreAllMocks());
const request = (datos: unknown) => new Request('http://localhost/api', {
  method: 'POST', body: JSON.stringify(datos), headers: { 'x-forwarded-for': 'ip-prueba, proxy' },
});
const evento = { moduloId: 'modulo-1', numero: 1, primerIntento: true, aprobado: false, aciertos: 2, total: 6, leccionesFalladas: [1, 3, 4, 5] };

describe('rutas de captura', () => {
  it('suscribir confirma aunque no se haya podido enviar el correo interno', async () => {
    const res = await suscribir(request({ correo: ' persona@ejemplo.com ' }));
    expect(await res.json()).toEqual({ ok: true });
    expect(enviarCorreoInterno).toHaveBeenLastCalledWith({ asunto: 'Bursa · Nueva suscripción', cuerpo: 'persona@ejemplo.com' });
    expect(pasaElLimite).toHaveBeenLastCalledWith('ip-prueba');
  });
  it.each([null, {}, { correo: 'no-es-correo' }, { correo: 42 }])('rechaza suscripción inválida %j', async (datos) => {
    expect((await suscribir(request(datos))).status).toBe(400);
  });
  it('medir registra una sola línea con solo los campos acordados', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await (await medir(request({ ...evento, correo: 'privado', nombre: 'privado', respuestas: [] }))).json()).toEqual({ ok: true });
    expect(log).toHaveBeenCalledExactlyOnceWith(JSON.stringify(evento));
  });
  it.each(Object.keys(evento))('rechaza tipo inválido en %s', async (campo) => {
    expect((await medir(request({ ...evento, [campo]: null }))).status).toBe(400);
  });
  it('rechaza lecciones que no sean números', async () => {
    expect((await medir(request({ ...evento, leccionesFalladas: ['1'] }))).status).toBe(400);
  });
  it.each([medir, suscribir, reporte])('rechaza JSON ilegible y aplica el límite', async (post) => {
    expect((await post(new Request('http://localhost/api', { method: 'POST', body: '{' }))).status).toBe(400);
    vi.mocked(pasaElLimite).mockReturnValue(false);
    expect((await post(request({ ...evento, correo: 'persona@ejemplo.com', motivo: 'otra' }))).status).toBe(429);
  });
  it.each([true, false])('reporte conserva el contrato enviado=%s y su contenido', async (enviado) => {
    vi.mocked(enviarCorreoInterno).mockResolvedValue({ enviado });
    const res = await reporte(request({ motivo: 'no-funciona', texto: 'Aviso de prueba', contexto: { modulo: 1, leccion: 2 } }));
    expect(await res.json()).toEqual({ ok: true, enviado });
    expect(enviarCorreoInterno).toHaveBeenLastCalledWith({
      asunto: 'Bursa · Algo no funciona · módulo 1, lección 2',
      cuerpo: expect.stringContaining('Aviso de prueba'),
    });
  });
});
