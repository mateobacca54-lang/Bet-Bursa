import { afterEach, describe, expect, it, vi } from 'vitest';
import { enviarCorreoInterno } from './correo';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('enviarCorreoInterno', () => {
  const correo = { asunto: 'Bursa · prueba', cuerpo: 'Contenido del aviso' };
  function preparar() {
    vi.stubEnv('BURSA_REPORTES_EMAIL', 'interno@example.com');
    vi.stubEnv('RESEND_API_KEY', 'clave-de-prueba');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  }
  it('sin configuración conserva el evento sin intentar enviarlo', async () => {
    preparar();
    vi.stubEnv('RESEND_API_KEY', '');
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    expect(await enviarCorreoInterno(correo)).toEqual({ enviado: false });
    expect(fetch).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(correo.cuerpo));
  });
  it('envía el mismo asunto y cuerpo por Resend', async () => {
    preparar();
    vi.stubEnv('BURSA_REPORTES_FROM', 'Bursa <bursa@example.com>');
    const fetch = vi.fn().mockResolvedValue(new Response('{}')); vi.stubGlobal('fetch', fetch);
    expect(await enviarCorreoInterno(correo)).toEqual({ enviado: true });
    expect(fetch).toHaveBeenCalledWith('https://api.resend.com/emails', expect.objectContaining({
      body: JSON.stringify({ from: 'Bursa <bursa@example.com>', to: ['interno@example.com'], subject: correo.asunto, text: correo.cuerpo }),
    }));
  });
  it.each(['http', 'red'])('conserva el contenido ante un fallo de %s', async (fallo) => {
    preparar();
    vi.stubGlobal('fetch', fallo === 'http'
      ? vi.fn().mockResolvedValue(new Response('fallo', { status: 500 }))
      : vi.fn().mockRejectedValue(new Error('sin red')));
    expect(await enviarCorreoInterno(correo)).toEqual({ enviado: false });
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(correo.cuerpo));
  });
});
