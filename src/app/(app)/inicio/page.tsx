import type { Metadata } from 'next';
import InicioRoute from './InicioRoute';

export const metadata: Metadata = {
  title: 'Inicio — Bursa',
  description: 'Monedita te recibe: una apuesta para entrar en calor y tus módulos de dinero y mercados.',
};

export default function Page() {
  return <InicioRoute />;
}
