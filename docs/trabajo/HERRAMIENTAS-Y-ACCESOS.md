# Herramientas y accesos

Qué se usa para construir y publicar Bursa, dónde vive cada cosa y cuánto cuesta.

## Dónde vive el proyecto

| Qué | Dónde |
|---|---|
| Código | GitHub: `mateobacca54-lang/Bet-Bursa` |
| Página en producción | https://bursa-six.vercel.app (se publica sola desde la rama `main`) |
| Vista previa de una rama | `https://bursa-git-<rama>-mateobacca54-3793.vercel.app` (Vercel la crea sola en cada push) |
| Proyecto en Vercel | `bursa` (equipo `mateobacca54-3793`) |
| Correo de la marca | `bursa.co@gmail.com` (provisional hasta tener uno corporativo) |

### Flujo para publicar

1. Se trabaja en una rama y se sube (`git push`). Vercel arma la vista previa.
2. El dueño revisa en la vista previa. Los comentarios que deja en la barra de Vercel aparecen
   como el chequeo "Vercel Preview Comments": se resuelven antes de fusionar.
3. Se abre un pull request hacia `main` y se fusiona (squash). Vercel publica en producción.
4. Si la rama de trabajo ya se fusionó, se reinicia desde `main` antes de seguir trabajando.

## Herramientas de desarrollo

| Herramienta | Para qué |
|---|---|
| Next.js + React | La app y la landing |
| GSAP + ScrollTrigger | Animaciones con el scroll (anclar secciones, recorrer videos) |
| Lenis | Scroll suave, solo en escritorio |
| Framer Motion | Animaciones de los widgets de las lecciones |
| Vitest | Pruebas de la lógica pura (`npm test`) |
| Storybook | Catálogo de componentes |
| Playwright | Capturas y pruebas en navegador (`npm run capture`) |
| ffmpeg | Cortar, unir, recomprimir y extraer cuadros de videos |

## Higgsfield (imágenes y video con IA)

Plan **Plus**. El saldo quedó en **0 créditos** el 26 de septiembre de 2026.

| Uso | Modelo | Costo |
|---|---|---|
| Imagen (2 variantes) | `gpt_image_2_5` | 0,25 créditos |
| Subir imagen a 4K | `bytedance_image_upscale` | 2 créditos |
| Video 5 s en 2K con primer y último cuadro | `minimax_h3` | 10 créditos (10 s = 20) |
| Video 5 s 768p con primer y último cuadro | `minimax_h3_max` | 12,5 créditos |
| Video 5 s 1080p con primer y último cuadro | `flux_3_video` | 45 créditos |

Aprendizajes:
- Para mover un objeto de una pose a otra, lo mejor es darle al modelo **el primer y el
  último cuadro** (`start_image` / `end_image`): el movimiento queda controlado.
- **La IA deforma el texto chico** en las partes con movimiento (por ejemplo, "Monedita"
  sale como "Menudita"). Las cifras grandes aguantan. Sirve cuando el texto no se lee de cerca.
- El fondo generado sale un poco más oscuro que el pedido: se corrige con ffmpeg
  (`colorchannelmixer`) midiendo el color del papel.
- Antes de gastar: `get_cost: true`, una prueba y después el resto (ver la regla de pagos en
  `REGLAS-DE-TRABAJO.md`).

## Otras conexiones disponibles en Claude

Canva, Figma, Notion, Google Drive, Google Calendar, Metricool (programar redes), Supabase,
Vercel y GitHub. Para marketing, las útiles son Metricool, Canva, Higgsfield y Notion (ver
`docs/marketing/PLAN-INICIAL.md`).

## Acceso a internet del entorno en la nube

El entorno de Claude en la nube bloquea dominios que no estén permitidos. Se cambia en la
configuración del entorno (menú del entorno → Edit → Network access). Dominios útiles para
Bursa:

```
suameca.banrep.gov.co
totoro.banrep.gov.co
www.banrep.gov.co
pagespeed.web.dev
www.googleapis.com
lottiefiles.com
mobbin.com
godly.website
land-book.com
www.awwwards.com
ramp.com
www.tomorro.com
fonts.google.com
www.instagram.com
www.tiktok.com
www.youtube.com
trends.google.com
```

`suameca.banrep.gov.co` es el más importante: de ahí salen las cifras del Banco de la
República de la banda "Datos de hoy".

## Llevar una sesión de la nube al computador

1. Instalar Claude Code (app de escritorio o terminal).
2. Abrir la sesión de la nube desde el computador: en la terminal, `claude --teleport`; en la app
   de escritorio, desde la lista de sesiones.
3. Todo el código está en GitHub, así que basta con clonar el repositorio (`git clone`) si no
   está en el computador.
