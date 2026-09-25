// ============================================================
// site.ts — la URL pública del sitio, en un solo lugar.
//
// Por qué existe: la vista previa al compartir apuntaba a `http://localhost:3000`
// si faltaba NEXT_PUBLIC_SITE_URL. Una auditoría externa encontró exactamente ese
// error en otra versión de Bursa y lo llamó crítico: cada enlace compartido por
// WhatsApp llegaba pelado, y ese es el canal de distribución natural del producto.
//
// Ahora hay tres redes de seguridad antes de caer a localhost, y las dos del medio
// las define Vercel sola en producción: aunque a nadie se le ocurra configurar
// nada, el enlace compartido sale bien.
// ============================================================

/** Quita el protocolo si viene, y la barra final. */
function limpiar(raw: string): string {
  return raw.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/**
 * La URL pública, en orden de preferencia:
 *   1. NEXT_PUBLIC_SITE_URL   — el dominio propio, cuando exista
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel la define sola: el dominio de producción
 *   3. VERCEL_URL             — Vercel la define sola: el despliegue actual (previews)
 *   4. localhost              — solo en desarrollo
 */
export function getSiteUrl(): string {
  const propio = process.env.NEXT_PUBLIC_SITE_URL;
  if (propio) return `https://${limpiar(propio)}`;

  const produccion = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (produccion) return `https://${limpiar(produccion)}`;

  const despliegue = process.env.VERCEL_URL;
  if (despliegue) return `https://${limpiar(despliegue)}`;

  return 'http://localhost:3000';
}

/** ¿Estamos publicados pero sin saber en qué dominio? Entonces las vistas previas salen rotas. */
export function urlEsDeDesarrollo(): boolean {
  return getSiteUrl().startsWith('http://localhost');
}
