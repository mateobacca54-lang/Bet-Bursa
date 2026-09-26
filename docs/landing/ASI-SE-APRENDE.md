# "Así se aprende en Bursa.": cómo se hizo y cómo rehacerlo

La sección de la landing con los dos celulares girando sobre la cinta naranja.
Código: `src/components/landing/AsiSeAprende/`.

## Qué hace

- Al llegar a la sección, esta **se queda quieta** (GSAP ScrollTrigger con `pin`) y el scroll
  **recorre la animación** de principio a fin. Al terminar, la página sigue.
- **Escritorio:** un video (`public/landing/celulares.mp4`, 1920×1080), movido cuadro a cuadro
  por el scroll.
- **Celular:** una **secuencia de 185 imágenes** (`public/landing/celulares-movil/`, 720×720)
  dibujadas en un `<canvas>`. Es la técnica de las páginas de producto de Apple.
- En los dos casos, la animación no sigue el dedo en crudo: lo alcanza con suavidad
  (`src/lib/secuencia.ts`, con pruebas).
- Con movimiento reducido o ahorro de datos se ve una imagen fija
  (`celulares-poster.webp` / `celulares-movil-poster.webp`).

## Por qué quedó así (el recorrido)

| Intento | Qué pasó |
|---|---|
| 1. Carrusel de capturas | Era lo que había. El dueño quería algo como la landing de **Slush**: celulares flotando que se apartan |
| 2. Celulares en CSS que se apartan con el scroll | Funcionaba, pero se veía plano |
| 3. Render 3D propio (three.js) | Se descartó: el dueño pidió usar Higgsfield y no se le consultó el cambio. De ahí sale la regla de consultar antes de cambiar el rumbo |
| 4. **Tres giros de Higgsfield** unidos en un bucle | Aprobado. Movimiento realista con reflejos de verdad |
| 5. Video en bucle automático | El dueño quería que la animación fuera con el scroll, como la moneda del inicio |
| 6. Video recorrido por el scroll | Bien en escritorio; **a tirones en celular** |
| 7. **Secuencia de imágenes en canvas** en celular + suavizado | Fluido. Versión final |

Qué se aprendió de la referencia (slush.app): su animación de celulares **no es código**, es un
video de 11 s hecho en After Effects que se repite solo, con giros 3D y pantallas que cambian en
cada pose.

Por qué el video se traba en el celular: cada movimiento del dedo pide saltar a otro cuadro; con
un cuadro clave cada medio segundo, el teléfono decodifica hasta 11 cuadros por salto y el iPhone
encola los saltos. Con imágenes sueltas cada cuadro ya está listo para dibujarse.

## Cómo rehacer los recursos

### 1. Los videos de Higgsfield

- Modelo `minimax_h3`, 5 s, 16:9, 2K (2560×1440, 24 fps), con **primer y último cuadro**.
- Los cuadros clave se sacaron de un render de los celulares con las pantallas reales de la
  app (resultado final de las actividades del almuerzo y del interés compuesto), en tres poses:
  derechos → inclinados → cruzados → derechos. El último cuadro del tercer giro es el primero
  del primero, así el bucle cierra.
- Trabajos en Higgsfield (por si hay que volver a bajarlos):
  `7a99e28c-ff35-43d4-98f1-4a0528941e0d`, `1d3ae64e-9699-46d4-9bc8-79f84ad55ae7`,
  `e1d35617-f768-4f1d-8ed4-ec6b59cfbec2`.

### 2. Unirlos y corregir el color

Cada clip mide 124 cuadros; se quita el último de cada uno (repite el primero del siguiente) y
se corrige el fondo para que coincida con `--paper-sunk` (#F6EFE6):

```bash
ffmpeg -i g1.mp4 -i g2.mp4 -i g3.mp4 -filter_complex \
 "[0:v]trim=end_frame=123,setpts=PTS-STARTPTS[a];\
  [1:v]trim=end_frame=123,setpts=PTS-STARTPTS[b];\
  [2:v]trim=end_frame=123,setpts=PTS-STARTPTS[c];\
  [a][b][c]concat=n=3:v=1:a=0,colorchannelmixer=rr=1.0123:gg=1.0384:bb=1.0312,format=yuv444p[v]" \
 -map "[v]" -c:v libx264 -crf 8 maestro2560.mp4
```

### 3. Video de escritorio

Un cuadro clave cada medio segundo (`-g 12`) para que el scroll pueda moverse por el video:

```bash
ffmpeg -i maestro2560.mp4 -an -vf scale=1920:1080:flags=lanczos,format=yuv420p \
 -c:v libx264 -crf 23 -preset slow -tune film -g 12 -keyint_min 12 -sc_threshold 0 \
 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart \
 public/landing/celulares.mp4
```

Lo que se ve algo suave viene del propio video de Higgsfield, no de la compresión: se comparó
`-crf 19` con `-crf 23` y no hay diferencia visible.

### 4. Secuencia del celular

```bash
node scripts/secuencia-celulares.mjs
```

Toma `public/landing/celulares.mp4`, recorta el cuadrado central, lo baja a 720×720 y 12 fps y
escribe los WebP en `public/landing/celulares-movil/` (unos 4,8 MB en total).

## Pesos

| Archivo | Peso |
|---|---|
| `celulares.mp4` (escritorio) | 6,9 MB |
| `celulares-movil/` (185 WebP) | 4,8 MB |

El video y las imágenes se descargan enteros antes de conectarse (Safari en iPhone no deja
saltar a un cuadro que no ha bajado). Mientras tanto se ve el póster.
