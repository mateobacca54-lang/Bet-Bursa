import type { Metadata } from 'next';
import { nombreModulo } from '@/content/modulos';
import PruebaRoute from './PruebaRoute';

export const metadata: Metadata = {
  title: `Prueba de ${nombreModulo(1)} — Bursa`,
  description: `Seis situaciones reales para comprobar qué tanto quedó de ${nombreModulo(1)}.`,
};

export default function Page() {
  return <PruebaRoute />;
}
