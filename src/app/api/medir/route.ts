import { NextResponse } from 'next/server';
import { pasaElLimite } from '@/lib/limiteDeTasa';

export async function POST(request: Request) {
  let datos;
  try {
    datos = await request.json();
  } catch {
    return NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 });
  }
  if (!datos || typeof datos.moduloId !== 'string' ||
      typeof datos.numero !== 'number' || !Number.isFinite(datos.numero) ||
      typeof datos.primerIntento !== 'boolean' || typeof datos.aprobado !== 'boolean' ||
      typeof datos.aciertos !== 'number' || !Number.isFinite(datos.aciertos) ||
      typeof datos.total !== 'number' || !Number.isFinite(datos.total) ||
      !Array.isArray(datos.leccionesFalladas) ||
      !datos.leccionesFalladas.every((n: unknown) => typeof n === 'number' && Number.isFinite(n))) {
    return NextResponse.json({ error: 'evento inválido' }, { status: 400 });
  }
  const clave = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocido';
  if (!pasaElLimite(clave)) {
    return NextResponse.json({ error: 'demasiados avisos seguidos' }, { status: 429 });
  }
  // Hasta la base de datos de la ola 5, el evento queda en los registros de Vercel.
  // No se manda correo por evento: con tráfico real serían demasiados.
  // Selección explícita: nunca registrar el cuerpo completo ni datos personales extra.
  const { moduloId, numero, primerIntento, aprobado, aciertos, total, leccionesFalladas } = datos;
  console.log(JSON.stringify({ moduloId, numero, primerIntento, aprobado, aciertos, total, leccionesFalladas }));
  return NextResponse.json({ ok: true });
}
