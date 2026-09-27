import type { Metadata } from 'next';
import { Landing } from '@/components/landing';
import { getSiteUrl } from '@/lib/site';

const TITLE = 'Bursa — Aprende de dinero y mercados en pesos colombianos';
const DESCRIPTION =
  'Escuela de dinero y mercados para jóvenes en Colombia. Lecciones cortas e interactivas: inflación, interés compuesto, ahorro, deuda y más, con ejemplos en pesos y sin jerga.';

export const metadata: Metadata = {
  // La URL sale de src/lib/site.ts, que en Vercel se resuelve sola aunque nadie configure nada.
  metadataBase: new URL(getSiteUrl()),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Bursa',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Bursa: entiende tu plata. Escuela de dinero y mercados para jóvenes en Colombia' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og.png'] },
};

export default function Home() {
  return <Landing />;
}
