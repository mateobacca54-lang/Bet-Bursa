# Imágenes editoriales de la portada

Generadas con la herramienta integrada `image_gen` y guardadas en `public/illustrations/`. Los PNG conservan transparencia; la página usa versiones WebP optimizadas.

## Fajo de billetes

Archivo: `fajo-bursa-v1.png` (original) y `fajo-bursa-v1.webp` (web).

Prompt final:

> Use case: stylized-concept. Asset type: transparent cutout for Bursa financial education landing page, to be duplicated into an animated 3D-looking pile. Generate ONE isolated bundle of paper banknotes, no other objects. Art direction: premium editorial 3D illustration, believable layered paper edges, sculpted volume, refined material and subtle imperfections, three-quarter isometric camera showing top and front/right sides, warm studio lighting, soft self-shadow. Generic Colombian-peso-inspired currency coloration in warm ivory, muted gold and restrained Bursa orange paper band, with abstract linework only; do not reproduce a real banknote. Slightly playful but sophisticated for ages 15–25, polished like a high-end educational product illustration. Centered object, generous transparent margins, alpha transparency. No scene background, no floor, no text, no letters, no numerals, no logo, no watermark. Crisp silhouette and consistent orientation so multiple copies can be stacked in a web animation.

## Ahorro e inversión

Archivo: `ahorro-inversion-bursa-v1.png` (original) y `ahorro-inversion-bursa-v1.webp` (web).

Prompt final:

> Use case: stylized-concept. Asset type: transparent centerpiece illustration for the Bursa finance-learning website hero. Primary request: a premium 3D editorial still life showing the difference between saving and investing using TWO sculptural objects only, with no text. Left: an elegant translucent clear-glass savings vessel containing a few warm-gold coins, stable and calm. Right: a refined stack of warm ivory and gold financial blocks with a small organic upward-growing form, suggesting possible growth and uncertainty, sophisticated rather than a generic rising arrow. Material language: believable glass, soft brushed metal, tactile paper, gentle light and ambient occlusion, visually rich and crafted, three-quarter view, consistent perspective, like high-end educational editorial illustration. Bursa palette: ivory, warm sand, golden yellow, restrained vivid orange accent, touches of deep navy. The two forms visually balanced, separated by negative space, both complete and not cropped. Absolutely transparent alpha background with no backdrop, no floor, no gradient, no vignette, no outer shadow halo; only tiny contact shadows integral to the objects. No letters, no numerals, no labels, no logos, no watermark, no human or mascot. Horizontal composition suitable for a 440 x 290 px hero card.

## Nueva propuesta para invertir

Archivo activo: `ahorro-inversion-bursa-v2.png`. Generado con la herramienta integrada `image_gen` a partir de `ahorro-inversion-bursa-v1.png`. El archivo v1 se conserva como referencia.

Prompt final:

> Use case: precise-object-edit. Edit target: the provided transparent PNG, a horizontal two-object visual used inside a small Bursa website card. Preserve the entire left half EXACTLY as-is, pixel-for-pixel if possible: the transparent crystal piggy bank, its gold coins, position, scale, lighting, shadows, and transparent background. Replace ONLY the investment object on the right (the gold/cream/black rising bars and metallic vine) with a single distinctive, elegant investment metaphor: a clear hand-blown glass terrarium vessel containing one gold coin partly embedded in dark rich soil, with a small sculptural copper-gold sapling growing from it and visible roots. The vessel should feel mature, premium, optimistic but not a guaranteed upward chart. Render as a photorealistic high-end 3D editorial product cutout matching the pig's crystal-and-gold materials, perspective, scale, warmth, highlights, and realistic soft contact shadow. Give the object comparable visual weight to the pig and fit entirely in the original right-side space with an airy gap between the two objects. Keep exact canvas dimensions and genuine transparency. No background, no text, no labels, no graph, no arrows, no bars, no extra objects. User specifically loves the pig and only wants a new investment proposal.

## Referencias técnicas

- [Anime.js: animación de varios elementos y `stagger()`](https://animejs.com/documentation/utilities/stagger/).
- [Anime.js: adaptador para instancias de Three.js](https://animejs.com/documentation/adapters/threejs-adapter/threejs-instanced-and-batched-meshes/). Se usa cuando existe una malla 3D real; estos recortes transparentes se animan como elementos del DOM.
