// ============================================================
// /api/reporte — recibe un aviso del botón de ayuda y lo manda al correo del dueño.
//
// La dirección NO va escrita aquí: va en BURSA_REPORTES_EMAIL, para que no quede pública en
// el repositorio. El envío usa RESEND_API_KEY. Si falta cualquiera de las dos, el reporte se
// escribe en el registro del servidor y la respuesta sigue siendo correcta: para quien avisa,
// lo importante es que su aviso salió, no dónde aterrizó.
//
// Cuando exista base de datos (ola 5), los reportes se guardan además ahí.
// ============================================================

import { NextResponse } from 'next/server';
import { enviarCorreoInterno } from '@/lib/correo';
import { pasaElLimite } from '@/lib/limiteDeTasa';

const MOTIVOS = ['se-ve-mal', 'no-funciona', 'no-entendi', 'otra'] as const;
type Motivo = (typeof MOTIVOS)[number];

const TEXTO_MOTIVO: Record<Motivo, string> = {
  'se-ve-mal': 'Algo se ve mal',
  'no-funciona': 'Algo no funciona',
  'no-entendi': 'No entendí esta lección',
  otra: 'Otra cosa',
};

const MAX_TEXTO = 600;

interface Contexto {
  ruta?: unknown;
  modulo?: unknown;
  leccion?: unknown;
  ancho?: unknown;
  alto?: unknown;
  movimientoReducido?: unknown;
  leccionesHechas?: unknown;
  navegador?: unknown;
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

function componerCorreo(motivo: Motivo, texto: string, c: Contexto) {
  const leccion = num(c.leccion);
  const modulo = num(c.modulo);
  const donde = leccion ? `módulo ${modulo}, lección ${leccion}` : txt(c.ruta, 120) || '(sin ruta)';
  const asunto = `Bursa · ${TEXTO_MOTIVO[motivo]} · ${donde}`;
  const cuerpo = [
    TEXTO_MOTIVO[motivo],
    '',
    texto || '(sin texto)',
    '',
    '— contexto —',
    `dónde: ${donde}`,
    `ruta: ${txt(c.ruta, 200) || '—'}`,
    `pantalla: ${num(c.ancho) ?? '?'} × ${num(c.alto) ?? '?'}`,
    `navegador: ${txt(c.navegador, 60) || '—'}`,
    `movimiento reducido: ${c.movimientoReducido === true ? 'sí' : 'no'}`,
    `lecciones hechas en el módulo: ${num(c.leccionesHechas) ?? '—'}`,
  ].join('\n');
  return { asunto, cuerpo };
}

export async function POST(request: Request) {
  let datos: { motivo?: unknown; texto?: unknown; contexto?: Contexto };
  try {
    datos = await request.json();
  } catch {
    return NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 });
  }

  const motivo = datos.motivo;
  if (typeof motivo !== 'string' || !MOTIVOS.includes(motivo as Motivo)) {
    return NextResponse.json({ error: 'motivo inválido' }, { status: 400 });
  }

  const clave = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocido';
  if (!pasaElLimite(clave)) {
    return NextResponse.json({ error: 'demasiados avisos seguidos' }, { status: 429 });
  }

  const { asunto, cuerpo } = componerCorreo(
    motivo as Motivo,
    txt(datos.texto, MAX_TEXTO),
    datos.contexto ?? {}
  );

  const resultado = await enviarCorreoInterno({ asunto, cuerpo });
  return NextResponse.json({ ok: true, ...resultado });
}
