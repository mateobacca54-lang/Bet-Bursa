# DESIGN.md — la identidad de Bursa en toda la app

Última revisión: 27 de septiembre de 2026.

Este archivo dice **cómo se ve y cómo se mueve Bursa**, de la portada a la última lección.
Si una pantalla contradice este documento, la pantalla está mal.

> **Por qué existe.** La portada (`/`) se hizo con papel cálido, titulares en Bricolage,
> botones en píldora y mucho aire. La app (`/inicio`, `/modulo/1`, las lecciones) se había
> quedado con un gris frío, Montserrat para todo, botones en MAYÚSCULAS y lecciones que eran
> casi solo texto. Parecían dos productos. Aquí se fija una sola identidad, la de la portada,
> y se lleva a todas partes.

---

## 0. De dónde sale cada cosa

| Capa | Qué es | Quién manda |
|---|---|---|
| **Manual de marca** | [Figma · Bursa — Identidad de marca](https://www.figma.com/design/Pm7jv8OSnUCZmG3LTCKFqi/Bursa-%C2%B7-Identidad-de-marca) | La marca: logo, color, tipografía, Monedita |
| **`src/styles/tokens.css`** | Los valores (color, espacio, radios, curvas, duraciones) | El único lugar con valores crudos |
| **`src/lib/motion.ts`** | Los mismos valores de movimiento, para JavaScript | Framer Motion, GSAP |
| **`src/components/ui/`** | Las piezas base: botón, tarjeta, rótulo, título, opción | Todo lo demás se arma con estas |
| **Este archivo** | Las reglas para combinarlos | Cualquier decisión de pantalla |

Esta organización viene de tres proyectos de referencia:

- **shadcn-ui/taxonomy**: primitivos pequeños en `components/ui/` que se componen; nadie
  reescribe un botón.
- **Blazity/next-enterprise**: cada componente con sus variantes declaradas y su story al lado.
- **t3-oss/create-t3-app**: la configuración y el contenido tipados en un solo lugar
  (`src/content/`), nunca repartidos entre componentes.

Regla de oro (heredada de `AGENTS.md`): **ningún color, espacio, radio, duración ni curva se
escribe a mano en un componente.** Si hace falta uno nuevo, se añade a `tokens.css` con fecha
y motivo, y se anota aquí.

---

## 1. Principios

1. **Papel y tinta. El naranja se gana su lugar.** El fondo de todo es papel (`--paper`), el
   texto es tinta (`--ink`), las tarjetas son blancas. El naranja aparece en el símbolo del
   logo y en **un solo acento por pantalla**: el botón principal *o* la cifra clave, no los dos
   gritando a la vez.
2. **Una idea por pantalla.** Como Brilliant: si una pantalla necesita scroll para entenderse,
   son dos pantallas.
3. **Se toca antes de leerse.** Cada pantalla de lección pide un gesto: elegir, arrastrar,
   tocar para revelar, mover un control. Leer tres párrafos seguidos no es una lección.
4. **El movimiento explica o no existe.** Se anima la causa y su efecto (la plata que se
   encoge, la curva que se dobla), nunca la decoración.
5. **Monedita habla, el logo firma.** El logo vive en el marco (barra, pie, certificado).
   Monedita vive dentro del contenido (lecciones, pistas, celebraciones). Nunca en la misma pieza.
6. **Cercano, no infantil.** Es para jóvenes de 16 a 25 años: tuteo, pesos colombianos,
   situaciones reales. Sin épica ni urgencia.

---

## 2. Color

| Rol | Token | Valor | Dónde |
|---|---|---|---|
| Fondo de toda la app | `--paper` = `--surface` | `#FBF7F1` | `body`, pantallas, reproductor |
| Bloque hundido | `--paper-sunk` | `#F6EFE6` | Zonas de soltar, filas alternas, pista de progreso |
| Tarjeta | `--surface-raised` | `#FFFFFF` | Tarjetas sobre papel, con `--border-hairline` y `--shadow-soft` |
| Texto principal | `--ink` | `#0A0F1C` | Titulares y cuerpo |
| Texto secundario | `--ink-soft` = `--ink-secondary` | tinta al 66 % | Ayudas, metadatos |
| Acento de marca | `--brand-600` | `#F4501B` | Botón principal, progreso, una cifra clave |
| Texto naranja | `--brand-700` | `#B93A10` | Rótulos y cifras en texto (5,35:1 sobre papel) |
| Fondo de apoyo | `--brand-50` / `--brand-100` | durazno | Tarjeta de concepto, opción elegida |
| Oro | `--gold-*` | | **Solo Monedita**: su brillo, sus celebraciones, la racha |
| Escena | `--scene-blue-*` | | Un segundo acento **solo dentro de un diagrama** que compara dos cosas |
| Héroe oscuro | `--ink` como fondo | | Máximo un bloque por pantalla (la portada tiene dos: héroe y cierre) |

**No se hace:**

- `--brand-600` como texto pequeño (3,27:1 no llega a AA). Para texto va `--brand-700`.
- Grises fríos (`#5B6478`, `#D7DCE3`, `#F2F4F7`). Ya no existen en los tokens.
- Verde y rojo de semáforo. El acierto es naranja con check; el error es tinta, con una
  explicación y sin castigo (`--feedback-correct`, `--feedback-wrong`).
- Degradados, vidrio o 3D dentro de la app. El único vidrio es la barra flotante de la portada.

---

## 3. Tipografía

Son dos familias, las mismas del manual de marca:

| Familia | Token | Para qué |
|---|---|---|
| **Bricolage Grotesque** | `--font-display` | Titulares de pantalla, cifras grandes (pesos, porcentajes, "3 de 10"), el número de la lección |
| **Montserrat** | `--font-family` | Cuerpo, botones, rótulos, opciones, todo lo demás |

No hay una tercera familia. `--font-serif` (Georgia) queda **retirada** de la interfaz.

### Escala

| Uso | Familia | Tamaño | Peso | Tracking |
|---|---|---|---|---|
| Titular de portada | display | `--font-size-display-1` | 700 | `--tracking-display` |
| Titular de pantalla de app (inicio, módulo, progreso) | display | `--font-size-display-3` | 700 | `--tracking-display` |
| Pregunta o gancho de lección | display | `--font-size-3xl` → `--font-size-4xl` en escritorio | 700 | `--tracking-tight` |
| Cifra protagonista | display | `--font-size-4xl` o más | 700 | `--tracking-tight` |
| Subtítulo de tarjeta | display | `--font-size-2xl` | 600 | `--tracking-tight` |
| Cuerpo grande | sans | `--font-size-lead` | 400 | normal |
| Cuerpo | sans | `--font-size-lg` (lección) / `--font-size-base` (app) | 400–500 | normal |
| Botón | sans | `--font-size-base` | 600 | normal. **Sin mayúsculas** |
| Rótulo (eyebrow) | sans | `--font-size-xs`–`--font-size-sm` | 600 | `--tracking-wide`, MAYÚSCULAS |

- Los **rótulos** son lo único que va en mayúsculas ("LECCIÓN 3 · INTERÉS", "AHORA TÚ").
  Botones, títulos y opciones van en tipo oración, como en la portada ("Empieza gratis").
- El naranja en un titular se usa para **una palabra** (como "plata" en la portada), no para
  frases enteras.
- Las cifras en pesos dentro del texto van en `--brand-700`, en negrita (`highlightPesos`).

---

## 4. Forma, superficie y profundidad

| Elemento | Radio | Borde | Sombra |
|---|---|---|---|
| Botón y chip | `--radius-pill` | según variante | ninguna |
| Opción de respuesta | `--radius-lg` | 2 px `--border` → `--ink` al elegir | ninguna |
| Tarjeta de contenido | `--radius-lg` | `--border-hairline` | `--shadow-soft` |
| Tarjeta grande o marco de imagen | `--radius-card-lg` | `--border-hairline` | `--shadow-soft` |
| Bloque hundido | `--radius-md` | ninguno | ninguna, fondo `--paper-sunk` |

- Sombras: solo `--shadow-soft` (difusa, sin desplazamiento) sobre papel. `--shadow-md` se
  reserva para algo que flota de verdad (un popover, la ficha que arrastras).
- **Las ilustraciones no van metidas en cajas blancas.** Se posan directo sobre el papel, que es
  el mismo tono sobre el que están dibujadas.

---

## 5. Componentes base (`src/components/ui/`)

Cada uno se hace como en next-enterprise: `Componente.tsx` + `Componente.stories.tsx` +
`index.ts`, con las variantes declaradas arriba del archivo.

| Componente | Variantes | Notas |
|---|---|---|
| `Button` | `primary` (naranja), `secondary` (borde tinta), `ghost` (solo texto) · `md`, `lg` | Píldora, texto en tipo oración, `scale(var(--press-scale))` al presionar. Acepta `href` y entonces es un `<Link>`. Deshabilitado con `aria-disabled`, nunca oculto |
| `Card` | `raised` (blanca), `sunk` (papel hundido), `ink` (héroe oscuro) | `raised` lleva siempre filo más sombra suave |
| `Eyebrow` | `brand` (`--brand-700`), `muted` (`--ink-soft`) | El rótulo en mayúsculas |
| `Heading` | `display` (Bricolage), `title` (Montserrat bold) · `xl`, `lg`, `md` | Con `focusOnMount` recibe el foco sin mostrar anillo (para lectores de pantalla) |
| `Choice` | `idle`, `selected`, `correct`, `wrong`, `disabled` | La opción de respuesta, que se usa en la apuesta, en la prueba y en Elegir. Es un `<button>` real |
| `ProgressBar` | fina (6 px), media (10 px) | Pista `--paper-sunk`, relleno `--brand-600`, se mueve con `transform: scaleX` |
| `Pill` | `brand`, `gold`, `muted` | Chips de estado: racha, "Hecha", "3 min" |
| `Stat` | | Cifra en Bricolage más su rótulo. La cifra rueda con NumberFlow |

Los componentes de dominio (`widgets/`, `lesson/`, `path/`, `shell/`, `inicio/`, `prueba/`,
`progreso/`) **se arman con estos**. Un botón escrito a mano con `style={{…}}` dentro de un
widget es una deuda que hay que pagar.

---

## 6. Diseño de página

- Ancho máximo del contenido: `--page-max` (1200 px) en app y portada. Las lecciones usan una
  columna de 640 px (720 px con un diagrama ancho).
- Márgenes laterales en móvil: `--space-4`. No hay scroll horizontal a 390 px.
- Aire entre bloques: `--space-12` a `--space-16` en la app, `--band-gap` en la portada.
- La barra lateral de la app es papel, con el logo arriba (horizontal, 28 px de alto) y la
  sección activa marcada con `--brand-50` más texto `--brand-700`.
- El botón "Ayuda" es global y nunca tapa el botón principal (`useReservarEsquina`).

---

## 7. Movimiento

### 7.1 Reglas (de `AGENTS.md`, se mantienen)

- Solo `transform` y `opacity`. Única excepción: `pathLength` en SVG.
- Duraciones y curvas desde `src/lib/motion.ts` o `tokens.css`, nunca sueltas.
- `usePrefersReducedMotion()` en todo componente animado. Con movimiento reducido se quita el
  movimiento, nunca la información: el confeti no sale, pero el "¡Lo lograste!" sí.
- Ninguna entrada bloquea. Si alguien toca mientras algo entra, salta al final.

### 7.2 Qué herramienta para qué

| Necesidad | Herramienta | Por qué |
|---|---|---|
| Transiciones de pantalla, estados de botones y opciones, arrastrar | **Framer Motion** (`framer-motion`) | Ya está en el proyecto, con variantes en `motion.ts` |
| Secuencias atadas al scroll (portada) | **GSAP + ScrollTrigger** (`@/lib/gsap`) | Ver `docs/landing/GSAP.md` |
| Cifras que cambian (pesos, porcentajes, contadores) | **NumberFlow** (`@number-flow/react`) | Los dígitos ruedan: se ve que el número cambió y cuánto |
| Celebración al acertar o terminar | **canvas-confetti**, envuelto en `@/lib/celebrar` | Duolingo/Brilliant: la recompensa se siente. Colores de marca y oro |
| Gráficas que se tocan (curvas de inflación, interés) | **Mafs** (`mafs`) | Componentes React para matemática interactiva, al estilo Brilliant |
| Personaje con estados (futuro) | **Rive** | Lo que usa Brilliant. Requiere diseñar el archivo `.riv` de Monedita. Pendiente |

**Unity no se usa.** Una escena WebGL pesa más de 10 MB, tarda en cargar en celular y no se
integra con React ni con la accesibilidad del DOM. Todo lo que Bursa necesita cabe en SVG,
canvas y las librerías de arriba.

### 7.3 Vocabulario de movimiento

| Momento | Movimiento | Duración |
|---|---|---|
| Presionar un botón | `scale(0.97)` | `micro` |
| Elegir una opción | La opción se eleva 2 px y el borde pasa a tinta | `micro` |
| Cambio de paso en la lección | Desliza 24 px en la dirección del avance | `scene` |
| Revelar una idea | La frase entra desde 12 px abajo (`fadeUp`) | `scene` |
| Acierto | Check dibujado (`drawPath`) + Monedita salta (`hop`) + confeti corto | `element` + `story` |
| Error | `shake` de 0,32 s, sin rojo, con explicación y reintento | `element` |
| Cifra cambia | NumberFlow | la de la librería |
| Terminar la lección | Confeti grande + contadores que suben + Monedita celebra | `story` |

---

## 8. Anatomía de una lección (Duolingo + Brilliant)

Cada lección son pantallas cortas. **Todas piden un gesto.**

| # | Pantalla | Qué hace el usuario | Qué ve |
|---|---|---|---|
| 1 | **Gancho** | Lee la pregunta del temario | Titular grande en Bricolage, la estampa de la lección posada sobre el papel, Monedita |
| 2 | **Tu apuesta** | Elige qué cree que pasa (2–3 opciones) | Monedita reacciona. No hay respuesta mala: es predicción, y se retoma al final |
| 3 | **La idea** | Toca para revelar la idea, frase por frase | El concepto clave del temario en tarjeta durazno; la explicación entra por partes |
| 4 | **Un ejemplo de tu día** | Toca para avanzar el esquema | El esquema de `EjemploVisual` se arma paso a paso; las cifras ruedan con NumberFlow |
| 5 | **Ahora tú** | Resuelve el ejercicio (6 arquetipos de widget) | Feedback inmediato; al acertar, check más confeti corto |
| 6 | **Lo que te llevas** | Termina | Resumen, "¿acertaste tu apuesta?", celebración y "llevas N de 10" |

El contenido de la apuesta vive en `src/content/modulo-1/apuestas.ts`. `temario.ts` no se toca.

---

## 9. Ilustración e imagen

Se mantiene `docs/PERSONALIDAD-VISUAL.md`: caricatura plana, borde de tinta grueso, fondo de
papel, nada de 3D dentro de la app. La moneda 3D del héroe de la portada es la **única**
excepción: es una pieza de portada, no del producto.

- Las imágenes nuevas se generan con el prompt base de `PERSONALIDAD-VISUAL.md §4`, subiendo
  como referencia una ilustración existente. **Claude no las genera**: escribe el prompt y el
  dueño las produce.
- Diagramas y gráficas: siempre en código (SVG o Mafs), con tokens.

---

## 10. Voz y texto en la interfaz

Todo lo de `AGENTS.md § Contenido y tono`, y además:

- Botones con verbo y en tipo oración: "Continuar", "Comprobar", "Ver la respuesta",
  "Terminar lección". Nada de "OK" ni "Enviar".
- El progreso se nombra como logro: "Llevas 3 de 10".
- Si un botón está deshabilitado, se dice por qué, justo encima: "Resuelve el ejercicio para seguir".

---

## 11. Accesibilidad

- Contraste AA en todo el texto (las cifras medidas están en `tokens.css`).
- Foco visible con un anillo `--brand-600` de 2 px para teclado (`:focus-visible`). Un
  elemento enfocado por código (el título de un paso) **no** muestra anillo.
- Objetivos táctiles de al menos `--touch-min` (44 px).
- Todo lo que se arrastra tiene alternativa con teclado y con toque.
- Las celebraciones se anuncian con `aria-live="polite"`. El confeti es `aria-hidden`.

---

## 12. Lista de revisión de una pantalla

- [ ] Fondo papel, tarjetas blancas con filo y sombra suave.
- [ ] Un solo acento naranja.
- [ ] Titular en Bricolage; cuerpo, botones y rótulos en Montserrat; ninguna otra fuente.
- [ ] Botones en tipo oración, construidos con `ui/Button`.
- [ ] La pantalla pide un gesto (si es de lección).
- [ ] Cada animación comunica algo y respeta el movimiento reducido.
- [ ] Sin valores sueltos: todo sale de `tokens.css` y `motion.ts`.
- [ ] Probada a 1280 px, 390 px y con movimiento reducido (`npm run capture`).
