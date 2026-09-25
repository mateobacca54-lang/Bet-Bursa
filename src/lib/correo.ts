/** Envío interno compartido; conserva el contenido en el registro si no puede enviarlo. */
export async function enviarCorreoInterno({ asunto, cuerpo }: { asunto: string; cuerpo: string }): Promise<{ enviado: boolean }> {
  const destino = process.env.BURSA_REPORTES_EMAIL;
  const clave_api = process.env.RESEND_API_KEY;
  const remitente = process.env.BURSA_REPORTES_FROM ?? 'Bursa <onboarding@resend.dev>';

  if (!destino || !clave_api) {
    // Sin configurar todavía: no se pierde, queda en el registro del servidor.
    console.warn('[correo] sin BURSA_REPORTES_EMAIL o RESEND_API_KEY\n' + asunto + '\n' + cuerpo);
    return { enviado: false };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${clave_api}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: remitente, to: [destino], subject: asunto, text: cuerpo }),
    });
    if (!res.ok) {
      console.error('[correo] el envío falló:', res.status, await res.text().catch(() => ''));
      console.warn('[correo] contenido no enviado:\n' + asunto + '\n' + cuerpo);
      // Para quien avisó, su aviso sí quedó: no se le pide que lo repita.
      return { enviado: false };
    }
  } catch (e) {
    console.error('[correo] el envío falló:', e);
    console.warn('[correo] contenido no enviado:\n' + asunto + '\n' + cuerpo);
    return { enviado: false };
  }

  return { enviado: true };
}
