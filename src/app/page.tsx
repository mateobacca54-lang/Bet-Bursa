import type { Metadata } from 'next';
import { Landing } from '@/components/landing';

const TITLE = 'Bursa — Aprende de dinero y mercados en pesos colombianos';
const DESCRIPTION =
  'Escuela de dinero y mercados para jóvenes en Colombia. Lecciones cortas e interactivas: inflación, interés compuesto, ahorro, deuda y más, con ejemplos en pesos y sin jerga.';

export const metadata: Metadata = {
  // Al publicar, define NEXT_PUBLIC_SITE_URL con el dominio real para que las vistas previas al compartir funcionen.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Bursa',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/landing/bolsa-bme.jpg', width: 1200, height: 800, alt: 'Sala de una bolsa con tableros de cotizaciones' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/landing/bolsa-bme.jpg'] },
};

export default function Home() {
  return <Landing />;
}
