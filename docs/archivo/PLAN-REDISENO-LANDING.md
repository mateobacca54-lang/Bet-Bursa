# Plan de rediseño de la landing (`/`)

Estado: **propuesta, pendiente de decisiones del dueño** (ver §7). Redactado el 2026-09-23.
Referencias que dio el dueño: brilliant.org (estructura), tarjetas de Platzi (color por bloque), investing.com (cómo dosificar el naranja).

---

## 1. Diagnóstico de la landing actual (visto en el navegador a 800×600, no de memoria)

| # | Problema | Dónde |
|---|---|---|
| 1 | **Salto negro → papel → negro.** El héroe es `--ink` a sangre con un resplandor naranja; después viene papel, luego la tarjeta negra del camino, después el cierre negro y el pie negro. Son tres saltos de brillo que cansan la vista. | `landing.css` `.lp-hero`, `.lp-closing`, `.lp-footer` |
| 2 | **Las tarjetas flotantes del héroe TAPAN el titular** ("…iende tu plata" se lee a medias). Rompe la regla de que ningún adorno tape contenido. | `StickyHero.tsx` (`X_OFFSETS`/`Y_OFFSETS`) |
| 3 | **Resplandor naranja con un valor inventado** `rgba(255,107,0,.15)` escrito en línea. No sale de `tokens.css`. | `StickyHero.tsx:128` |
| 4 | **El naranja está en todas partes**: logo, 4 botones primarios, 6 rótulos pequeños (eyebrow), palabras resaltadas, pastillas y tarjetas enteras de fondo naranja. Cuando todo es naranja, nada destaca y cansa. | 40+ usos de `brand-*` en la landing |
| 5 | **Tres secciones con scroll secuestrado** (Manifesto palabra por palabra, "Aprendes haciendo" con escenas, la franja de mercados en horizontal). Hay que desplazarse mucho para recibir poca información. | `Manifesto`, `ProductBento`, `MarketStrip` |
| 6 | **Faltan las respuestas que busca quien llega.** Tres bloques explican *cómo* funciona y ninguno responde: ¿es gratis?, ¿para quién es?, ¿quién está detrás?, ¿qué sabré al terminar el camino?, ¿sirve para mi colegio o empresa? | toda la página |
| 7 | **Monedita no aparece en la landing.** Brilliant presenta a Koji y Duolingo a Duo en la segunda pantalla; nuestra guía solo aparece en `/inicio`. | — |

## 2. Qué hacen las páginas de aprendizaje con más tráfico (estructura leída de su HTML en vivo)

| Bloque | Brilliant | Duolingo | Khan Academy | Platzi |
|---|---|---|---|---|
| Héroe: promesa + CTA | ✓ + **dos puertas**: "Soy estudiante" / "Soy padre o docente" | ✓ + "Ya tengo cuenta" | ✓ | ✓ "Comienza cualquier ruta gratis" |
| Prueba de confianza | 3 tarjetas (acreditado, reseñas, alumnos) | "respaldado por la ciencia" | "contenido de confianza" | "+2000 cursos, 30 rutas" |
| Presenta al guía | **"Conoce a Koji"** con pestañas Math/Coding | Duo en toda la página | — | — |
| El método, con demo | tutor visual + ejercicio animado | "divertido, efectivo y gratis" | aprendizaje personalizado | — |
| Qué vas a aprender | materias en pestañas | idiomas | cursos | rutas en tarjetas de color |
| Para instituciones | escuelas | Duolingo for Schools | **sección entera para maestros** | empresas |
| Cierre + CTA | ✓ | ✓ | ✓ | planes |

**Lo común a todas:** en la primera pantalla responden qué es, para quién y cuál es el siguiente paso. Enseñan el producto en vez de describirlo. Presentan al guía. Hay una puerta aparte para quien compra (docente o institución). **Ninguna secuestra el scroll para contar el método.**

Para Bursa, la puerta de instituciones importa más que para ellas: el modelo es B2B2C (paga la caja de compensación, el colegio o la universidad).

## 3. Sistema de color: "papel, tinta y un solo naranja"

Regla **60 / 30 / 10**:

- **60 % papel**: `--paper` (sand-50) de fondo en TODA la página y tarjetas blancas con borde fino (`--border-hairline`). Nada de secciones negras a sangre.
- **30 % tinta**: el texto en `--ink`, con jerarquía por opacidad (`--ink-soft`). Esto ya está medido y funciona.
- **10 % naranja**, solo para tres cosas: **el botón principal, el estado "activo o hecho" y Monedita**. Es lo que hace Investing: el naranja solo aparece en su botón de oferta y el resto es neutro.

Cambios concretos:
- Logo en `--ink`, no naranja. Los rótulos pequeños (eyebrow) pasan a `--ink-soft`.
- Las palabras destacadas del titular se marcan con peso o subrayado de marcador, no con color.
- Los botones secundarios son contorno de tinta. Nunca dos botones naranjas juntos.
- Las tarjetas de color al estilo Platzi usan **tonos suaves** (`--sand-100`, `--gold-100`, `--scene-blue-50`), uno por módulo, con texto en tinta. Nada de tarjetas enteras naranja chillón.
- Oscuro: **como mucho un objeto oscuro deliberado** (una tarjeta, no una sección entera). El pie de página pasa a `--paper-sunk`.
- Se elimina el resplandor radial naranja.

## 4. Nueva estructura (de arriba abajo)

| # | Bloque | Qué responde | Contenido | Se reutiliza |
|---|---|---|---|---|
| 0 | **Barra** | — | Bursa · Aprender · Para instituciones · Quiénes somos · [Empezar] | `Landing.tsx` |
| 1 | **Héroe, en papel** | ¿Qué es? ¿Qué hago? | Titular a la izquierda. A la derecha, **un mini-ejercicio vivo** (predice → revela, un toque), como el cuadrado animado de Brilliant. Dos puertas: **"Empezar gratis"** y **"Soy docente o institución"**. Debajo: *Gratis · Sin crear cuenta · Ejemplos en pesos* | titular actual; widget de lección |
| 2 | **Confianza (3 tarjetas)** | ¿Me puedo fiar? | Solo datos verificables, sin cifras inventadas: *"10 lecciones listas"*, *"Gratis para ti, siempre"*, *"No es asesoría: te enseña a leer"* | — |
| 3 | **Conoce a Monedita** | ¿Cómo me enseñan? | Monedita + pestañas **Predices · Ves por qué · Repasas**. Cada pestaña muestra un recorte real de lección (el patrón "Meet Koji") | capturas de producto |
| 4 | **Pruébalo** | ¿Funciona conmigo? | La lección 3 incrustada, como está hoy. Es el mejor bloque de la página | `TryIt` tal cual |
| 5 | **El camino** | ¿Qué sabré al final? | Los **6 módulos** del Camino 1 en tarjetas de color suave (estilo Platzi). El Módulo 1 dice "Disponible" y los demás "En preparación". Al abrir el Módulo 1 se ven sus 10 temas (esto reemplaza las tarjetas flotantes del héroe) | `LearningPath`, `TopicSheet` |
| 6 | **Para colegios e instituciones** | ¿Sirve para mi grupo? | Una tarjeta: qué es Bursa para una institución + "Escríbenos" (correo de `/sobre`). Sin prometer nada que no exista | — |
| 7 | **Preguntas frecuentes** | Dudas antes de empezar | ¿Es gratis? ¿Necesito cuenta? ¿Qué edad? ¿Es asesoría financiera? ¿Qué datos guardan? (todo sale de `08-CUENTAS.md` y `06-PRODUCTO.md`) | — |
| 8 | **Cierre + pie** | — | "Empieza por lo que ya viviste" en una tarjeta. Pie en `--paper-sunk` con el aviso legal | texto actual |

**Se retiran:** `Manifesto` (el texto palabra por palabra), `ProductBento` con scroll secuestrado (su contenido pasa a los bloques 3 y 7) y `MarketStrip`. La idea de "la plaza, la tienda y la bolsa son lo mismo" se vuelve la tarjeta del Módulo 3 ("El mercado").

**Movimiento:** nada ligado al scroll. Solo entradas suaves (`Reveal`), Monedita saludando una vez y el mini-ejercicio del héroe. Todo respeta `prefers-reduced-motion`.

## 5. Librerías: qué sí y qué no

| Paquete | Veredicto | Por qué |
|---|---|---|
| **shadcn/ui** (sobre primitivas Radix) | **Sí, pieza por pieza** | El proyecto ya usa Tailwind 4, y `npx shadcn@latest add tabs accordion dialog` copia el código al repo, así que lo estilizamos con `tokens.css`. Lo necesitamos para las pestañas (bloque 3), el acordeón (bloque 7) y el diálogo. No hace falta clonar el repo de shadcn. |
| **@radix-ui/themes** | **No** | Trae un tema visual completo (colores, radios, tipografías) que choca con `tokens.css` y con la regla de AGENTS.md de no inventar valores. |
| **react-aria-components** | **Más adelante** | Es excelente para arrastrar y soltar accesible (serviría para `DragClassifier`). Meter dos librerías de primitivas a la vez duplica el trabajo. Se evalúa cuando se toquen los widgets de lección. |
| **anime.js / GSAP** | **No por ahora** | Ya tenemos Framer Motion. Una tercera librería de animación suma peso y hace que los movimientos se sientan de sitios distintos. GSAP (ya gratis, con sus plugins) solo se justifica para una escena con línea de tiempo larga, como una intro animada de Monedita. |

## 6. Hallazgos de `/web-design-guidelines` sobre la landing actual

```
src/components/landing/StickyHero.tsx:128 - radial-gradient con color hardcodeado (no es token)
src/components/landing/StickyHero.tsx:80 - flotación infinita >5 s sin pausa (sí respeta reduced-motion)
src/components/landing/StickyHero.tsx:~150 - tarjetas flotantes tapan el h1 a 800 px de ancho
src/components/landing/Landing.tsx:37 - anclas #como-funciona / #pruebalo sin scroll-margin-top y la barra es fija
src/components/landing/Landing.tsx:19 - falta enlace "saltar al contenido"
src/app/layout.tsx - falta <meta name="theme-color"> acorde a --paper
src/components/landing/ProductBento.tsx:105 - lectura de layout (getBoundingClientRect/offsetHeight) en cada goTo; aceptable, pero desaparece con el rediseño
src/components/landing/Manifesto.tsx - una línea de tiempo por palabra (~40 motion values); desaparece con el rediseño
src/components/landing/TryIt.tsx - ✓ pass
src/components/landing/PathPreview.tsx - ✓ pass
src/components/landing/TopicSheet.tsx - ✓ pass (botón real, foco devuelto)
```

## 7. Decisiones que necesita el dueño antes de construir

1. **¿Hay bloque "Para colegios e instituciones"** y segunda puerta en el héroe (como Brilliant)? Recomendado: sí, porque es el modelo de negocio.
2. **¿Qué va a la derecha del héroe?** (a) un mini-ejercicio vivo (recomendado); (b) Monedita grande; (c) una captura del producto.
3. **Tarjetas de los 6 módulos:** los módulos 2–6 están redactados pero **pendientes de aprobación**. ¿Se muestran sus títulos con "En preparación" o solo el Módulo 1?
4. **Datos de confianza:** ¿hay alguna cifra real con fuente (piloto, colegio, número de estudiantes)? Si no, van las 3 frases verificables del bloque 2.
5. Aprobar la adopción de shadcn/ui (§5).

## 8. Orden de trabajo (olas cortas, cada una se verifica sola)

| Ola | Qué | Quién | Se da por hecha cuando |
|---|---|---|---|
| R1 | Color: 60/30/10, quitar el resplandor, pie claro, logo y eyebrows en tinta | Claude | axe sin errores de contraste; capturas a 390, 1280 y 1920 sin secciones negras a sangre |
| R2 | Esqueleto nuevo: reordenar bloques, retirar Manifesto, Bento y MarketStrip, skip link, `scroll-margin-top`, theme-color | Claude | `tsc`, `eslint` y `vitest` en verde; la landing carga completa |
| R3 | Piezas nuevas acotadas: tarjetas de módulos, bloque Monedita con pestañas (shadcn), FAQ (acordeón) | Codex, un componente por tarea con contrato claro | story en Storybook de cada pieza + revisión |
| R4 | Héroe con mini-ejercicio y dos puertas | Claude | predecir → revelar funciona con teclado y toque |
| R5 | Verificación final | Claude | `npm run medir-solapes` (corrida acotada) en 0, `/web-design-guidelines` sin hallazgos nuevos, capturas en 3 anchos |

---

## 9. Decisiones del dueño (2026-09-23) y diseño en Figma

**Diseño:** https://www.figma.com/design/paQQjPBZ0Y4hNqLkCcuBWH (página "Landing": escritorio 1440; página "Logo — propuestas").

Decidido:
- **Instituciones: sí**, pero con honestidad: todavía no hay ninguna aliada. El bloque dice que *estamos buscando las primeras* y solo lista lo que ya existe (10 lecciones del M1, sin cuenta, gratis). No hay logos de aliados, no hay cifras y no se menciona el "modo salón".
- **Héroe con mini-ejercicio: sí.** Pregunta literal del temario (lección 3): *"$100.000 hoy o $100.000 en 10 años, ¿es lo mismo?"*. No usa cifras de Colombia, así que no necesita ⚠ VERIFICAR.
- **Fuera "Empieza el Módulo 1".** El botón principal en TODA la página dice **"Comienza tu camino"** (una sola acción con un solo nombre).
- **Confianza con frases, no con números** (aún no hay usuarios).
- Herramientas aprobadas: Figma y shadcn/ui.

### Textos (según `/design:ux-copy`)

| Elemento | Texto |
|---|---|
| H1 | Aprende a leer las decisiones que mueven tu plata. |
| Bajada | Lecciones de tres minutos con ejemplos en pesos. Primero predices, luego ves qué pasó y entiendes por qué. |
| CTA principal (todas las apariciones) | Comienza tu camino |
| CTA secundario del héroe | Soy docente o institución |
| Nota bajo los CTA | Gratis y sin crear cuenta. |
| Revelación del ejercicio | ¡Bien leído! Valen más hoy. Los precios suben con los años: dentro de 10 años esos $100.000 compran menos. Y si hoy los pones a crecer, llegan a ser más. |
| Promesas | Gratis para ti, siempre · Sin crear cuenta · Te enseña a leer, no a invertir |
| Monedita | Monedita te pregunta antes de explicarte. / No te da la respuesta de una. Te hace apostar primero, porque lo que predices y luego compruebas se te queda. |
| Pasos | Predices · Ves qué pasó · Entiendes por qué |
| Camino | Un camino de seis paradas. / Empiezas por la plata que manejas hoy y terminas leyendo con criterio las decisiones que mueven la economía. |
| Instituciones | ¿Enseñas en un colegio, una universidad o una caja de compensación? / Estamos buscando las primeras instituciones para llevar Bursa a sus grupos. Escríbenos y lo armamos contigo. [Escríbenos] |
| Preguntas | ¿De verdad es gratis? · ¿Tengo que crear una cuenta? · ¿Me van a decir en qué invertir? · ¿Cuánto dura cada lección? · ¿Para qué edad es? |
| Cierre | Tu primera lección dura tres minutos. [Comienza tu camino] |

Alternativas del CTA descartadas: "Empezar gratis" (repite lo que ya dice la nota de debajo), "Haz tu primera lección" (más largo y menos aspiracional), "Empieza el Módulo 1" (vetado por el dueño).

Reglas de `/frontend-design` aplicadas: sin rótulos en MAYÚSCULAS sobre cada título, sin una palabra del titular pintada de naranja, sin "→" en los botones, numeración solo donde hay secuencia (los 3 pasos) y un único momento memorable (el ejercicio del héroe).

### Logo: propuestas revisadas (página "Logo — propuestas")
- **A — BURSA en mayúsculas naranjas:** a 32 px no se lee, y es justo el naranja "gritón" que se quiere bajar.
- **B — "b" en cuadro + bursa.:** amable, pero el cuadro con una inicial y el punto final son fórmulas muy vistas.
- **C — Monedita como símbolo + "bursa" en minúsculas (Bricolage):** **recomendada.** Es lo más propio que tiene la marca, se reconoce a 32 px y une el logo con la guía. Es la que está puesta en la barra del diseño.
- **D — la "u" con cordón:** la idea (bursa = bolsa) es buena, pero a tamaño pequeño se lee como una taza o una sonrisa y hay que explicarla.

### Pendiente de confirmar con el dueño
- La elección de logo (A/B/C/D).
- Las respuestas de "¿Tengo que crear una cuenta?" y "¿Para qué edad es?" (en el diseño están cerradas a propósito).
- Mostrar los títulos de los módulos 2–6 (siguen pendientes de aprobación) con "En preparación".
- Las lecciones usan otro sistema (fondo gris `--surface`, rótulos en mayúsculas naranjas y un contorno de foco visible en el título al cargar): cuando la landing quede, ese mismo lenguaje tiene que llegar a las lecciones.
