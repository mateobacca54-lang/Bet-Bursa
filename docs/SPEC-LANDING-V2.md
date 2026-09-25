# SPEC — Landing v2 (`/`)

Estratega: Opus 5.5. Construcción: dos subagentes Fable 5.1 en paralelo, cada uno con archivos propios.
Diseño de referencia: Figma `paQQjPBZ0Y4hNqLkCcuBWH` (página "Landing"). Plan y porqués: `docs/PLAN-REDISENO-LANDING.md`.

## 0. La idea en una frase

**Bursa enseña a LEER las decisiones que mueven la plata.** La página no describe el método: lo hace
contigo tres veces (una pregunta en el héroe, leer la letra pequeña de un crédito con el scroll y
clasificar situaciones con Monedita). Cada pieza interactiva viene de una lección que YA existe; nada
se promete.

Dispositivo visual propio: **el resaltador**. Leer un papel con un marcador en la mano es el gesto
de "leer una decisión". Se usa en el documento del crédito (sección 3) y en ningún titular.

## 1. Reglas duras (AGENTS.md; se revisan en la entrega)

- Valores SOLO de `src/styles/tokens.css`. Los tamaños grandes son `calc()` de tokens (como ya hace
  `landing.css`: `calc(var(--font-size-4xl) * 1.6)`). Ningún hex, px de color, duración ni curva nuevos.
  Radios: `--radius-lg` (20 px) para tarjetas, `--radius-md` para opciones, `--radius-pill` para botones.
- Movimiento: valores de `src/lib/motion.ts`. Solo `transform`, `opacity` y `pathLength`.
  `usePrefersReducedMotion()` de `@/lib/usePrefersReducedMotion` en TODO componente animado
  (NUNCA `useReducedMotion` de framer). Con reduced motion no hay movimiento, pero sí toda la información.
- Nada de `<div onClick>`. Botones y enlaces reales. Todo funciona con teclado.
- Lógica pura (cálculos) en `src/lib/` con test vitest (`npm test`).
- Texto: tutear, sin épica ni urgencia, sin palabras técnicas sin explicar. Los ganchos del temario
  se copian literales desde `src/content/modulo-1/temario.ts` (no se edita ese archivo).
- **Prohibido (firma de página hecha por IA):** rótulos en MAYÚSCULAS sobre los títulos, una palabra
  del titular pintada de color, "→" pegado al texto de los botones, cadenas "A · B · C", texto en
  `text-transform: uppercase`, fade-up automático en cada sección.
- Next.js 16: ante dudas de API, leer `node_modules/next/dist/docs/`.

## 2. Sistema visual

| Rol | Token |
|---|---|
| Fondo de página | `--surface-raised` (blanco) |
| Bloques hundidos | `--paper` (arena 50) y `--paper-sunk` (arena 100) |
| Texto | `--ink`; secundario `--ink-soft` |
| Líneas | `--border-hairline`; bordes de tarjeta `--sand-200` |
| **Naranja (10 %)** | SOLO: botón principal (`--brand-600` con texto `--on-brand`), Monedita y "tu elección / lo activo" |
| Resaltador | `--gold-300` (marca) sobre `--gold-100` (fondo de fila) |
| Tintes de módulo | M1 `--brand-100`, M2 `--gold-100`, M3 `--scene-blue-50`, M4 `--sand-100`, M5 `--brand-50`, M6 `--sand-200` |
| Instituciones | `--scene-blue-50` |

Ninguna sección negra. Foco visible: `outline: 2px solid var(--ink); outline-offset: 3px` (el
`--brand-400` actual NO llega a 3:1 sobre blanco).

Tipografía: `--font-display` (Bricolage, 600, `--tracking-tight`, `--line-height-tight`, `text-wrap: balance`)
solo en h1/h2/h3 y en cifras grandes; `--font-family` (Montserrat) en todo lo demás. Cifras de dinero con
`font-variant-numeric: tabular-nums`. Los botones van en minúscula normal (sentence case), peso 600.

## 3. Estructura (de arriba abajo)

| # | Sección | id | Fondo | Dueño |
|---|---|---|---|---|
| 0 | Enlace "Saltar al contenido" + barra fija | — | blanco + hairline | A |
| 1 | Héroe: titular + `HeroQuiz` | `inicio` | blanco | A |
| 2 | Tres promesas | — | blanco | A |
| 3 | `LeeLaLetra` (scroll didáctico) | `lee-la-letra` | `--paper` | **B** |
| 4 | `MetodoDemo` (Monedita + clasificar) | `como-aprendes` | blanco | **B** |
| 5 | `CaminoParadas` (6 módulos + línea que se dibuja) | `camino` | blanco | **B** |
| 6 | Instituciones | `instituciones` | blanco (tarjeta `--scene-blue-50`) | A |
| 7 | Preguntas (`<details>`) | `preguntas` | `--paper` | A |
| 8 | Cierre | — | blanco | A |
| 9 | Pie | — | `--paper-sunk` | A |

Toda sección con `id` lleva `scroll-margin-top` igual a la altura de la barra.

## 4. Contrato de clases compartidas (las define A en `landing.css`; B las usa, no las redefine)

- `.lp` — raíz: fondo `--surface-raised`, color `--ink`, `--font-family`.
- `.lp-wrap` — `max-width: 1120px` (el valor que ya usa la landing), centrado, padding lateral `--space-4` (≥ 720 px: `--space-6`).
- `.lp-section` — padding vertical `--space-16`; ≥ 960 px: `calc(var(--space-16) * 1.5)`.
- `.lp-section--paper` — fondo `--paper`.
- `.lp-title` — h2: display, `clamp(var(--font-size-3xl), 4vw, calc(var(--font-size-4xl) * 1.25))`.
- `.lp-lead` — párrafo guía: `clamp(var(--font-size-base), 1.6vw, var(--font-size-lg))`, `--line-height-normal`, `--ink-soft`, `max-width: 60ch`.
- `.lp-btn`, `.lp-btn--primary`, `.lp-btn--secondary` — pill, `min-height: var(--touch-min)`, peso 600, sin mayúsculas. Hover solo con `(hover: hover) and (pointer: fine)`. `:active` → `scale(0.97)`.
- `.lp-sr-only` — oculto visualmente, legible para lectores de pantalla.
- `--lp-nav-h` — variable local en `.lp` = `calc(var(--space-16) + var(--space-2))` (72 px, alto de la barra). A la usa para `scroll-margin-top` de `.lp section[id]`; B la usa como `top` de sus elementos sticky.
- Formato de pesos: `formatCOP` de `src/lib/format.ts` (ya existe; no crear otro).

B pone sus propias clases con prefijo propio (`llp-`, `met-`, `cam-`) en su propio CSS.

## 5. Piezas de A (estructura)

**Barra.** `BursaLogo` (Monedita `/monedita/icono-96.png` recortada en círculo, 36 px, `alt=""` + texto
"bursa" en display 600): enlace a `/` con `aria-label="Bursa, inicio"`. Enlaces: Aprender (`#como-aprendes`),
Para instituciones (`#instituciones`), Quiénes somos (`/sobre`). Botón principal "Comienza tu camino" → `/inicio`.
Menos de 720 px: solo logo + botón (los enlaces se ocultan; están repetidos en el pie). Nada se sale a 360 px.
El logo es provisional (propuesta C): el dueño aún elige, por eso vive en UN componente.

**Héroe.** h1: "Aprende a leer las decisiones que mueven tu plata." Bajada: "Lecciones de tres minutos con
ejemplos en pesos. Primero predices, luego ves qué pasó y entiendes por qué." Botones: "Comienza tu camino"
(`/inicio`) y "Soy docente o institución" (`#instituciones`, secundario). Nota: "Gratis y sin crear cuenta."
Dos columnas desde 960 px; debajo, apilado.

**`HeroQuiz`** (`src/components/landing/HeroQuiz.tsx` + story + la lógica de estado a `src/lib/landing-quiz.ts` con test):
- Cabecera de la tarjeta: Monedita (64 px, en el flujo, nunca encima de texto) + "Una pregunta de la lección 3".
- Pregunta (literal del temario, lección 3 `hook`): "$100.000 hoy o $100.000 en 10 años, ¿es lo mismo?"
- Opciones (botones): "Es lo mismo" · "Valen más hoy" (correcta) · "Valen más en 10 años".
- Al elegir: la elegida queda marcada "Tu predicción"; la correcta muestra "Respuesta" con un ícono de
  check (nunca solo color); el resto baja de opacidad y queda deshabilitado. Monedita salta (`variants.hop`)
  y cambia de imagen: acierto → `/monedita/monedita-celebra.webp`, fallo → `/monedita/monedita-pensando.webp`.
- Revelación (`aria-live="polite"`), primero la línea según la elección:
  - acierto: "¡Bien leído! Valen más hoy."
  - "Es lo mismo": "Parece lo mismo porque el billete dice lo mismo. Pero lo que puedes hacer con él cambia con el tiempo."
  - "Valen más en 10 años": "Es al revés: quien tiene la plata hoy puede ponerla a crecer, y quien espera la recibe cuando los precios ya subieron."
  - y siempre: "Si hoy los pones a crecer, en 10 años son más. Si los dejas quietos, los precios suben y compran menos." +
    en display: "El tiempo multiplica —o te cobra— mucho más de lo que parece." (keyConcept literal de la lección 3).
- Botón "Probar otra vez" (reinicia y devuelve el foco a la primera opción) y enlace "Hacer la lección 3" → `/inicio`.
- La revelación entra con `opacity` + `y` (DURATION.scene, EASE_OUT_EXPO); la altura de la tarjeta NO
  salta: reservar el espacio de la revelación desde el principio o animar solo transform/opacity.

**Promesas** (fila de tres, separadas por líneas finas; no tarjetas):
"Gratis para ti" — "Aprender aquí no te cuesta nada. No hay prueba que se acabe." ·
"Sin crear cuenta" — "Empiezas en un clic. Tu avance se guarda en este dispositivo." ·
"Te enseña a leer, no a invertir" — "No te decimos dónde poner tu plata. Te damos criterio para decidirlo tú."

**Instituciones.** h2: "¿Enseñas en un colegio, una universidad o una caja de compensación?" Texto:
"Estamos buscando las primeras instituciones para llevar Bursa a sus grupos. Escríbenos y lo armamos contigo."
Botón secundario "Escríbenos" → `mailto:mateobacca54@gmail.com?subject=Bursa%20para%20instituciones` (mismo
correo que `/sobre`). Columna "Lo que ya existe hoy": "Las 10 lecciones del Módulo 1 están listas." ·
"Tus estudiantes entran sin crear cuenta." · "Es gratis para ellos." Nada de logos ni cifras.

**Preguntas** (h2 "Antes de empezar"; `<details>`/`<summary>` nativos, la primera abierta; el "+" gira 45° con transform):
1. ¿De verdad es gratis? — "Sí. Aprender en Bursa es gratis para ti."
2. ¿Tengo que crear una cuenta? — "No. Empiezas en un clic y tu avance se guarda en este dispositivo."
3. ¿Me van a decir en qué invertir? — "No. Bursa es contenido educativo, no asesoría financiera. Te enseñamos a leer cómo funciona el dinero para que decidas tú."
4. ¿Cuánto dura cada lección? — "Entre dos y tres minutos. Cada una enseña una sola idea."
5. ¿Para qué edad es? — "Está pensada para personas de 15 a 25 años en Colombia, pero sirve a cualquiera que quiera entender su plata."

**Cierre.** Monedita saludando (`/monedita/monedita.webp`) + h2 "Tu primera lección dura tres minutos." + "Comienza tu camino".

**Pie.** "bursa" + aviso: "Bursa es contenido educativo. No es asesoría financiera ni una recomendación de
inversión: aprender cómo funciona el dinero no es lo mismo que decidir qué hacer con el tuyo." Enlaces:
Quiénes somos · Para instituciones · Escríbenos. Añadir `<meta name="theme-color">` NO: layout.tsx no es de A.

## 6. Piezas de B (interactivas)

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

**`MetodoDemo`** — "Monedita te pregunta antes de explicarte."
- Bajada: "No te da la respuesta de una. Te hace apostar primero, porque lo que predices y luego compruebas se te queda."
- Stepper de tres pasos (NO pestañas libres: la regla del producto es predecir ANTES de ver):
  "Predices" → "Ves qué pasó" → "Entiendes por qué". Los pasos futuros están deshabilitados hasta llegar.
- Contenido: 4 situaciones de la lección 1 (`leccion01Config`, ids `bici-celular`, `bus`, `cromos`, `arriendo`),
  con su `Objeto` (`@/components/illus`) y su `label`. Cada una tiene dos botones "Trueque" / "Necesita dinero"
  (`aria-pressed`). Con las 4 respondidas se activa "Ver qué pasó".
- Paso 2: cada situación muestra ✓ o "Mira otra vez" (texto + ícono, nunca solo color) y su `explanation` literal.
  Conteo como logro: "Leíste bien 3 de 4".
- Paso 3: `explanationCorrect` literal + keyConcept de la lección 1 en display: "El dinero es un acuerdo social de confianza, no un objeto con valor propio."
  + "Probar otra vez" y enlace "Comienza tu camino".
- Monedita (`/monedita/monedita.webp`) al lado del stepper; `variants.hop` al pasar de paso.
- Anuncios de cambio de paso con `aria-live="polite"`; al cambiar de paso el foco va al título del paso.

**`CaminoParadas`** — "Un camino de seis paradas."
- Bajada: "Empiezas por la plata que manejas hoy y terminas leyendo con criterio las decisiones que mueven la economía."
- Seis paradas unidas por una línea SVG que se dibuja con el scroll (`pathLength` ligado a `useScroll`; con
  reduced motion, completa). La línea es decorativa (`aria-hidden`).
- Módulo 1 es la parada grande (ocupa el doble): "La plata" — "Qué es el dinero, qué se lo come y qué lo multiplica."
  Estado "Disponible". Botón "Ver los 10 temas" (`aria-expanded`) despliega la lista de títulos de
  `TEMARIO_MODULO_1` (literales) y el botón "Comienza tu camino".
- Módulos 2–6 (títulos: Hacerla crecer · El mercado · Las empresas · El mundo · Tu criterio), estado
  "En preparación", SIN descripción (están en propuesta). Tintes de §2.
- Es una lista ordenada (`<ol>`): el número de parada sí es información.

## 7. Qué NO se toca

- No se borran `StickyHero`, `Manifesto`, `ProductBento`, `TryIt`, `PathPreview`, `MarketStrip`, `TopicSheet`:
  solo dejan de importarse (el dueño decide si se borran).
- `src/app/layout.tsx`, `tokens.css`, `temario.ts` y el contenido de lecciones: no se editan.

## 8. Entrega (cada agente)

1. `npx tsc --noEmit` sin errores en sus archivos. 2. `npx eslint <sus archivos>` limpio. 3. `npm test` verde
(con los tests nuevos). 4. Captura de su parte con Playwright a 390 y 1440 px de ancho (el servidor ya corre en
http://localhost:3100), también con `reducedMotion: 'reduce'`. Scripts temporales dentro de `scripts/_tmp-*.mjs`,
que se borran al terminar. 5. Informe corto: archivos creados, qué verificó y qué no pudo verificar.

## 9. Cómo verificar sin pisarse

`Landing.tsx` (de A) importa las piezas de B, así que `/` puede fallar mientras B no termine. Cada agente
verifica SU parte en una ruta temporal propia bajo `src/app/dev/` (ya está cerrada en producción):
A → `src/app/dev/landing-a/page.tsx`, B → `src/app/dev/landing-b/page.tsx`. Las dos se BORRAN al terminar.
La verificación de la página completa (`/`, axe, teclado, medir-solapes) la hace Opus al integrar.

## 10. LeeLaLetra v2 — "El papel sobre la mesa" (pedido del dueño, 2026-09-23)

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

**El resaltador:** un trazo de marcador, no un rectángulo. Un `<svg>` con un path de bordes algo irregulares (como la
punta biselada de un marcador) estirado al ancho interior de la fila (`preserveAspectRatio="none"`), relleno
`--gold-300` con `mix-blend-mode: multiply`, detrás de la tinta. Se pinta de izquierda a derecha (`scaleX` 0→1,
`transform-origin: left`, DURATION.scene, EASE_OUT_EXPO). Filas ya leídas: el mismo trazo en `--gold-100`. Nunca tapa
ni apaga el texto y nunca se sale de la hoja.

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

**Escritorio con movimiento (≥ 900 px):** el encabezado (h2 + bajada) va arriba y se va con el scroll. Debajo, un
escenario sticky (`top: var(--lp-nav-h)`, alto `calc(100vh - var(--lp-nav-h))`, contenido centrado en vertical) con el
papel (≈ 58 %) y la nota (≈ 42 %) lado a lado. La pista mide 3 × 60vh: el scroll avanza el paso (`pasoActivo`) y los
botones también. Así la sección entera cabe en una pantalla por paso, sin columnas vacías.

**Móvil (< 900 px) y reduced motion:** SIN sticky y sin depender del scroll. Una sola tarjeta: el papel arriba y la nota
debajo, con "Anterior / Siguiente" que cambian el paso y el resaltador (clic, no scroll). Estado inicial: paso 1.
Es más cómodo que tres documentos o una pantalla larga.

**MetodoDemo (ajuste de espacio):** la cuadrícula de las cuatro situaciones ocupa todo el ancho disponible de `.lp-wrap`
(hoy termina en ~1024 px y deja una franja vacía a la derecha).

## 11. Apariciones al hacer scroll con GSAP (pedido del dueño, 2026-09-23)

El dueño quiere que, al bajar, "se sienta como si las cosas fueran apareciendo". Herramienta: **GSAP** (ScrollTrigger +
SplitText + CustomEase; todos gratis desde 2025) con `@gsap/react` (`useGSAP` limpia solo). **No se instala anime.js**:
una sola librería de scroll. Framer Motion sigue para lo interactivo (quiz, stepper, contador); GSAP solo para apariciones.
Nunca los dos animando el MISMO elemento.

**Reglas**
- Los valores salen de `src/lib/motion.ts`: las curvas se registran una vez con `CustomEase.create('bursaOutExpo', EASE_OUT_EXPO.join(','))`
  (y `bursaOutQuart`) en `src/lib/gsap.ts`, que también registra los plugins (solo en cliente). Duraciones: `DURATION.*`; escalonado: `STAGGER`.
- Solo `transform` y `opacity` (`autoAlpha`). Nada de `height`, `clip-path` animado ni `filter`.
- Con `prefers-reduced-motion: reduce` NO se crea ninguna aparición (usar `gsap.matchMedia()`): el contenido se ve desde el principio.
- El HTML del servidor se ve completo (sin JS, sin clases que escondan). GSAP esconde en el cliente justo antes de animar
  (`useGSAP`, que usa layout effect) y cada aparición corre UNA vez (`once: true`, `start: 'top 85%'`).
- Si el usuario hace clic o usa el teclado sobre algo que está entrando, se completa (`tween.progress(1)`). Nada bloquea la interacción.
- SplitText con `type: 'lines', mask: 'lines', autoSplit: true` (se re-parte al cambiar el ancho) y `aria: 'auto'` (los lectores de pantalla leen la frase entera).
  Hay que esperar a las fuentes (`document.fonts.ready`) antes de partir, o las líneas salen mal cortadas.

**Qué aparece y cómo (un vocabulario pequeño, igual en toda la página):**
| Elemento | Movimiento |
|---|---|
| h1 del héroe (al cargar, no por scroll) | líneas suben desde su máscara (`yPercent: 100 → 0`), `DURATION.scene`, `STAGGER * 2` entre líneas; luego bajada y botones (`y: 12 → 0`, autoAlpha) y por último la tarjeta del quiz (`y: 24 → 0`). Todo junto dura menos de 1 s: es el único momento orquestado de la carga |
| Cada `.lp-title` (h2) | mismas líneas desde la máscara, al entrar en pantalla |
| Cada `.lp-lead` | `y: 12 → 0` + autoAlpha, justo después de su título |
| Promesas | la línea de arriba de cada columna se dibuja (`scaleX: 0 → 1`, origen izquierda) y luego su texto sube; columnas escalonadas |
| Tarjeta de instituciones y cada `<details>` de preguntas | `y: 24 → 0` + autoAlpha; las preguntas escalonadas |
| Cierre | Monedita sube con un pequeño rebote (`y: 16 → 0`, `scale: 0.94 → 1`, `bursaOutQuart`), después el título por líneas y el botón |
| Paradas del camino (`.cam-parada`) | `y: 24 → 0` + autoAlpha, escalonadas |

El interior de LeeLaLetra y de MetodoDemo NO se toca desde GSAP (tienen su propio movimiento con framer). Solo sus `.lp-title` y `.lp-lead`.

**Implementación:** un solo componente cliente `src/components/landing/ApareceAlBajar.tsx`, montado una vez dentro de `.lp`
en `Landing.tsx`, que busca los elementos por selector (`.lp-title`, `.lp-lead`, `[data-aparece="..."]`) y crea los
ScrollTrigger. Los elementos propios de A llevan `data-aparece="linea|subir|dibujar"`; los de B se buscan por su clase
(no se editan sus archivos). Refresca ScrollTrigger cuando cambie la altura de la página (el quiz y el camino crecen al
abrirse): `ScrollTrigger.refresh()` desde un `ResizeObserver` sobre `.lp`, con debounce.
