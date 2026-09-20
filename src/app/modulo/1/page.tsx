import type { Metadata } from 'next';
import ModuloUno from './ModuloUno';

export const metadata: Metadata = {
  title: 'Módulo 1 · Fundamentos del Dinero — Bursa',
  description:
    'Diez lecciones de menos de cinco minutos para entender cómo funciona el dinero en la vida real.',
};

export default function Page() {
  return <ModuloUno />;
}
