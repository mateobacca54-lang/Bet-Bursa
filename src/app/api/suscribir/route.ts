import { NextResponse } from 'next/server';
import { enviarCorreoInterno } from '@/lib/correo';
import { pasaElLimite } from '@/lib/limiteDeTasa';
import { validarSolicitudSuscripcion } from '@/lib/suscripcion';

export async function POST(request: Request) {
  let datos;
  try {
    datos = await request.json();
  } catch {
    return NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 });
  }

  const validacion = validarSolicitudSuscripcion(datos);
  if (!validacion.ok) {
    return NextResponse.json({ error: validacion.error }, { status: 400 });
  }
  const { correo, consentimiento, versionPolitica } = validacion.datos;

  const clave = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocido';
  if (!pasaElLimite(clave)) {
    return NextResponse.json({ error: 'demasiados avisos seguidos' }, { status: 429 });
  }

  const marcaDeTiempo = new Date().toISOString();
  await enviarCorreoInterno({
    asunto: 'Bursa · Nueva suscripción',
    cuerpo: [
      `Correo: ${correo}`,
      `Consentimiento: ${consentimiento}`,
      `Versión de la política: ${versionPolitica}`,
      `Fecha: ${marcaDeTiempo}`,
    ].join('\n'),
  });
  return NextResponse.json({ ok: true });
}
