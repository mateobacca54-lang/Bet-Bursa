Extraído de `docs/archivo/SPEC-LANDING-V2.md` el 26/09/2026.

# LeeLaLetra

## Versión original (§6 del spec)

**`LeeLaLetra`** — "Lee la letra pequeña" (la lección 9, hecha con el scroll).
- h2: "Lo más grande de un papel casi nunca es lo más importante." Bajada: "Así se lee una simulación de
  crédito. Baja despacio: el resaltador va por donde deberías mirar."
- Izquierda: tres pasos (h3 + párrafo). Derecha, fija (`position: sticky`): `<Documento id="simulacion-credito" />`
  con capas de resaltador encima, alineadas con `FILAS_RELATIVAS` / las zonas de `leccion09Config`
  (`src/content/modulo-1/leccion-09-letra-pequena.ts`, NO se edita).
  1. "Lo primero que ves" — resalta la fila `cuota`: "La cuota es lo más grande del papel. Está ahí para que la mires a ella."
  2. "Lo que de verdad pides" — resalta `monto`, `plazo` y `tasa`: "$3.000.000 a 24 meses, con una tasa de 1,8 % mensual: el precio de que te presten."
  3. "Lo que casi nadie lee" — resalta `gracia`: "Seis meses sin pagar cuota. Pero el interés sigue corriendo y se suma a lo que debes."
     Aparece un contador que va de $3.000.000 a lo que debes al empezar a pagar (calculado, no escrito a mano):
     `deudaTrasGracia(3_000_000, 0.018, 6)` = 3.000.000 × 1,018⁶ = **$3.338.935** (redondeado al peso; el test lo fija), con la frase
     "Cuando empiezas a pagar ya debes {diferencia} más de lo que pediste, sin haber gastado un peso." ({diferencia} = $338.935, SIEMPRE calculada con la función, nunca escrita a mano)
- Cierre de la sección: "Esto es la lección 9. Aprendes a encontrarlo antes de firmar." + enlace secundario "Comienza tu camino".
- El resaltador "se pinta" con `scaleX` de 0 a 1 (`transform-origin: left`, DURATION.scene, EASE_OUT_EXPO).
  El paso activo sale de `useScroll` del contenedor → función pura `pasoActivo(progreso, 3)` en `src/lib/`.
- Botones de paso (1 · 2 · 3) para quien no quiere hacer scroll (hacen scroll al paso). `aria-current="step"`.
- Móvil (< 900 px) y reduced motion: sin sticky; los tres pasos apilados, cada uno con su documento ya resaltado
  (o un solo documento con los tres resaltados y numerados). Nunca se esconde información.
- Contador: `animate()` de framer a un `MotionValue`, formateado con `Intl.NumberFormat('es-CO')` (reusar
  `src/lib/format.ts` si ya formatea pesos). Con reduced motion, cifra final directa.
- El documento es `aria-hidden`; el texto de cada paso dice lo mismo en palabras (lectores de pantalla).

(verificar: esta versión quedó superada por "LeeLaLetra v2" más abajo — el documento hoy es HTML propio, no el SVG `Documento`, y no hay botones de paso 1·2·3 sino "Anterior"/"Siguiente". Se deja aquí solo como historia de cómo empezó).

## LeeLaLetra v2 — "El papel sobre la mesa" (§10 del spec, pedido del dueño, 2026-09-23)

El dueño eligió esta sección como la mejor de la página y como plantilla del estilo. Dos quejas:
**(a) el documento se ve desconectado del ambiente de la página** (es el dibujo de las lecciones: contorno
negro de 4 px, franja negra y papel arena sobre fondo arena) y **(b) hay muchos espacios vacíos** (cada paso
ocupa una pantalla, con una columna vacía y los botones 1·2·3 lejos del papel). Prioridad: comodidad y creatividad visual.

**Concepto.** Un papel de verdad sobre la mesa, y la explicación como una nota al margen escrita junto a la fila
que se está leyendo. Los ojos no viajan: la nota está pegada a lo que explica.

**El papel (HTML, ya no el SVG `Documento`; el de las lecciones no se toca):**
- Hoja `--surface-raised` con `--radius-md`, `--shadow-md` (papel levantado de la mesa) y SIN contorno negro ni franja negra.
- Cabecera: un círculo pequeño con "%" en tinta (contorno 1.5 px `--ink`) + "Simulación de crédito" en display 600,
  y debajo una línea `--border-hairline`.
- Filas (etiquetas y valores de `leccion09Config.zones`, NO escritos a mano): etiqueta en Montserrat 500 `--ink-soft`,
  valor en display 600 `--ink` con `tabular-nums`. La cuota es la fila llamativa: su valor, más grande. La fila de
  gracia es letra chica de verdad (`--font-size-xs`, `--ink-soft`), en dos líneas.
- En reposo, la hoja está un poco girada (`rotate(-2deg)`, como tirada en la mesa) y se endereza a 0° cuando empieza
  la lectura (paso 1 activo): "tomas el papel para leerlo". Solo transform. Con reduced motion, recta desde el principio.

(verificar: el código actual (`lee-la-letra.css`) inclina el papel `-3deg` de forma ESTÁTICA solo en escritorio ≥960px, y dice explícitamente "nunca animada" — no gira -2deg ni se endereza al llegar al paso 1 como dice este párrafo).

**El resaltador:** un trazo de marcador, no un rectángulo. Un `<svg>` con un path de bordes algo irregulares (como la
punta biselada de un marcador) estirado al ancho interior de la fila (`preserveAspectRatio="none"`), relleno
`--gold-300` con `mix-blend-mode: multiply`, detrás de la tinta. Se pinta de izquierda a derecha (`scaleX` 0→1,
`transform-origin: left`, DURATION.scene, EASE_OUT_EXPO). Filas ya leídas: el mismo trazo en `--gold-100`. Nunca tapa
ni apaga el texto y nunca se sale de la hoja.

(verificar: el código actual (`LeeLaLetra.tsx`, componente `Fila`) no dibuja ningún SVG de marcador; resalta la fila activa con `opacity`/`x` en un `motion.div`, y en CSS con un fondo en degradé `--gold-100→transparent` más una barra vertical `--brand-600` a la izquierda — no hay trazo de marcador ni `mix-blend-mode`).

**La nota al margen (a la derecha del papel):**
- Tarjeta pequeña (`--surface-raised`, `--radius-md`, borde `--border-hairline`) con Monedita de 32 px + "Paso 1 de 3",
  el h3 y el texto del paso. Una línea fina (`--ink` al 25 %, conector) sale de la fila activa hacia la nota.
- La nota se DESPLAZA en vertical para quedar a la altura de la fila activa (translateY medido del `offsetTop` de la
  fila; `SPRING_SOFT`). Con reduced motion salta sin animación.
- Botones "Anterior" y "Siguiente" dentro de la nota (sustituyen a los botones 1·2·3 de arriba, que se eliminan).
- Paso 3: dentro de la nota aparece el contador (display grande, `--brand-700`) que va de $3.000.000 a
  `deudaTrasGracia(...)` + "Cuando empiezas a pagar ya debes {diferencia} más de lo que pediste, sin haber gastado un
  peso." y, debajo, "Esto es la lección 9. Aprendes a encontrarlo antes de firmar." + enlace secundario "Comienza tu camino".
  El contador: se dispara una vez al llegar al paso 3 y se queda en la cifra final (no vuelve atrás al subir); el
  número animado va con `aria-hidden` y hay un `.lp-sr-only` con la cifra final.

(verificar: el código actual no desplaza la nota con un `translateY` medido del `offsetTop` de la fila ni usa una línea conectora hacia la fila activa; usa `AnimatePresence`/`opacity`+`y` para cambiar de contenido cada vez que cambia el paso, dentro de una tarjeta fija).

**Escritorio con movimiento (≥ 900 px):** el encabezado (h2 + bajada) va arriba y se va con el scroll. Debajo, un
escenario sticky (`top: var(--lp-nav-h)`, alto `calc(100vh - var(--lp-nav-h))`, contenido centrado en vertical) con el
papel (≈ 58 %) y la nota (≈ 42 %) lado a lado. La pista mide 3 × 60vh: el scroll avanza el paso (`pasoActivo`) y los
botones también. Así la sección entera cabe en una pantalla por paso, sin columnas vacías.

(verificar: el código actual usa el punto de quiebre `≥960px`, no `≥900px`, y la pista mide `3 × 48vh`, no `3 × 60vh` — el comentario en `lee-la-letra.css` dice que se ajustó a 48vh para reducir "scroll muerto"; la composición en escritorio también es asimétrica en grid, `1.15fr` de texto + `1fr` de papel, no una proporción fija 58/42).

**Móvil (< 900 px) y reduced motion:** SIN sticky y sin depender del scroll. Una sola tarjeta: el papel arriba y la nota
debajo, con "Anterior / Siguiente" que cambian el paso y el resaltador (clic, no scroll). Estado inicial: paso 1.
Es más cómodo que tres documentos o una pantalla larga.
