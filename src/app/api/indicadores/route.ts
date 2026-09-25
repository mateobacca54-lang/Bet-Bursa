import { NextResponse } from 'next/server';
import { obtenerIndicadores } from '@/lib/indicadores/servicio';

// Los datos cambian una vez al día (o al mes): se vuelven a pedir cada 12 horas.
export const revalidate = 43200;
export const runtime = 'nodejs';

export async function GET() {
  const indicadores = await obtenerIndicadores();
  return NextResponse.json({ indicadores, generado: new Date().toISOString() });
}
