import type { Metadata } from 'next';
import { nombreModulo } from '@/content/modulos';
import ModuloUno from './ModuloUno';

export const metadata: Metadata = {
  title: `${nombreModulo(1)} — Bursa`,
  description:
    'Diez lecciones de menos de cinco minutos para entender cómo funciona el dinero en la vida real.',
};

export default function Page() {
  return <ModuloUno />;
}
