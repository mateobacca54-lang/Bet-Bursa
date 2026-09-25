import { NextResponse } from 'next/server';
import { enviarCorreoInterno } from '@/lib/correo';
import { pasaElLimite } from '@/lib/limiteDeTasa';

export async function POST(request: Request) {
  let datos;
  try {
    datos = await request.json();
  } catch {
    return NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 });
  }
  const correo = typeof datos?.correo === 'string' ? datos.correo.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return NextResponse.json({ error: 'correo inválido' }, { status: 400 });
  }
  const clave = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocido';
  if (!pasaElLimite(clave)) {
    return NextResponse.json({ error: 'demasiados avisos seguidos' }, { status: 429 });
  }
  await enviarCorreoInterno({ asunto: 'Bursa · Nueva suscripción', cuerpo: correo });
  return NextResponse.json({ ok: true });
}
