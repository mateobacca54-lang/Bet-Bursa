import type { Metadata } from 'next';
import ProgresoRoute from './ProgresoRoute';

export const metadata: Metadata = {
  title: 'Tu progreso — Bursa',
  description: 'El territorio que ya recorriste: lecciones hechas, conceptos para repasar y tu misión pendiente.',
};

export default function Page() {
  return <ProgresoRoute />;
}
