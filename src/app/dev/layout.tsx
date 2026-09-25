import { notFound } from 'next/navigation';

// ============================================================
// /dev/* — banco de pruebas interno. No existe en producción.
//
// Hasta hoy quedaba público al publicar: una auditoría externa lo encontró en
// otra versión de Bursa y lo listó como hallazgo. No es un secreto, pero enseña
// piezas a medio armar a cualquiera que adivine la ruta.
//
// Se apaga aquí, en el layout: así cubre a /dev/widgets, /dev/camino y a
// cualquier página que se añada debajo sin que haya que acordarse.
// El robots.txt además pide no indexarlas.
// ============================================================

export const metadata = { robots: { index: false, follow: false } };

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production' && process.env.BURSA_DEV_ROUTES !== 'on') {
    notFound();
  }
  return children;
}
