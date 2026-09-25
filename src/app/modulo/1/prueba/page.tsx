import type { Metadata } from 'next';
import PruebaRoute from './PruebaRoute';

export const metadata: Metadata = {
  title: 'Prueba del Módulo 1 — Bursa',
  description: 'Seis situaciones reales para comprobar qué tanto quedó del Módulo 1.',
};

export default function Page() {
  return <PruebaRoute />;
}
