import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

// ============================================================
// robots.txt — hasta hoy devolvía 404.
//
// Un joven que busca "qué es el interés compuesto" o "cómo funciona la inflación"
// es el lead más barato que existe en esta categoría, y sin esto no puede llegar.
//
// Las rutas /dev/ son el banco de pruebas interno: no se indexan.
// ============================================================

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dev/'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
