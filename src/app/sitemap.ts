import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';
import { MODULO_1 } from '@/content/modulo-1/temario';
import { getLessonContent } from '@/content/modulo-1/lecciones';

// ============================================================
// sitemap.xml — hasta hoy devolvía 404.
//
// Solo se listan páginas ALCANZABLES de verdad. No basta con que la lección tenga
// contenido: el camino va en orden, así que una lección con un hueco antes muestra
// "esta se abre más adelante". Se listan las que forman una racha desde la 1.
//
// Prometer en el sitemap algo que al abrirlo dice "todavía no" es la misma clase de
// error que un enlace roto en el pie.
//
// La prueba de paso tampoco entra: no tiene sentido llegar a ella desde Google.
// ============================================================

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const ahora = new Date();

  const fijas: MetadataRoute.Sitemap = [
    { url: base, lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/sobre`, lastModified: ahora, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/inicio`, lastModified: ahora, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/modulo/1`, lastModified: ahora, changeFrequency: 'weekly', priority: 0.9 },
  ];

  const lecciones: MetadataRoute.Sitemap = [];
  for (let n = 1; n <= MODULO_1.lessonCount; n++) {
    // Se corta en el primer hueco: de ahí en adelante ninguna es alcanzable todavía
    if (!getLessonContent(n)) break;
    lecciones.push({
      url: `${base}/modulo/1/leccion/${n}`,
      lastModified: ahora,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return [...fijas, ...lecciones];
}
