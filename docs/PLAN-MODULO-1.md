# Plan de desarrollo — Módulo 1: Fundamentos del Dinero

> Documento de trabajo para construir la primera experiencia completa de Bursa:
> pantalla de camino + 3 lecciones jugables.
> La Sección 11 contiene el prompt ejecutable listo para pasarle a un agente.

---

## 1. Fuentes de verdad

| Qué | Dónde | Estado |
|---|---|---|
| Temario y metodología | `Metodologia Bursa/Bursa_Temario_Modulo1_1.docx` | **Unidad temática cerrada.** No inventar contenido |
| Sistema de diseño | **Claude Design** (`claude.ai/design`) | Fuente de verdad. ⏳ Pendiente de leer |
| Tokens visuales | `src/styles/tokens.css` | Espejo local del sistema de diseño |
| Contratos de widgets | `src/lib/types.ts` | Ya define los 5 arquetipos |
| Widget de referencia | `src/components/widgets/ConsequenceSlider/` | Construido y funcionando |
| Contenido L2 | `src/content/modulo-1/leccion-02-inflacion.ts` | Construido |

### El sistema de diseño vive en Claude Design

`Proyecto Bursa/marca/` **queda fuera de juego como fuente para producto.** La identidad v1
que define ahí (tinta sobre papel, Fraunces + Newsreader, lacre `#7E2B33`) no gobierna la app.

La fuente de verdad visual es el proyecto de **Claude Design**, sincronizado contra
`src/styles/tokens.css`. Mientras tanto la app sigue con lo que ya está en `tokens.css`
— naranja `#F4501B/#F96A34` + Montserrat, superficie `#F2F4F7`.

⏳ **Bloqueado:** leer Claude Design requiere `/design-login` desde una sesión interactiva.
Hasta que se ejecute, `tokens.css` opera como fuente provisional. Cuando se lea el sistema
real, hay que reconciliar y anotar aquí qué cambió.

**Nota sobre el tono de voz:** las reglas de tono que usa este plan (tutear siempre;
ninguna palabra técnica sin explicar en la misma frase; empezar por algo que el usuario
ya vivió; sin épica y sin urgencia; admitir lo que no se sabe) salían de esa misma carpeta.
No están en conflicto con nada, así que se conservan — pero hay que confirmarlas contra
Claude Design cuando se pueda entrar.

### Lo que el temario no cubre

El docx cierra: objetivo, audiencia, duración, los 5 pasos de cada lección, los principios
(un concepto por lección, refuerzo espaciado, evaluación formativa, progresión gamificada),
y los 10 ganchos + conceptos + aplicaciones prácticas.

El docx **no** cubre: los ejemplos en pesos, los resúmenes de una línea, el saludo, los
textos de feedback ni la navegación. Todo eso se redacta siguiendo las reglas de tono.

---

## 2. La idea central

Platzi resuelve el camino como una **lista de cursos**. Bursa no debería copiarlo, porque
tiene una metáfora que Platzi no tiene disponible:

> **El camino de aprendizaje es una gráfica de mercado.**

Una línea quebrada ascendente — no una curva suave — que conecta las 10 lecciones.
Cada lección es un punto sobre la línea. El tramo recorrido está dibujado en naranja;
el tramo bloqueado es punteado gris. Al completar una lección, el siguiente tramo
**se dibuja** frente al usuario.

Esto hace tres cosas de una sola vez:

1. Es la estética de mercados financieros sin decoración añadida.
2. El progreso se siente, no se lee: la línea crece.
3. Enseña antes de enseñar — el usuario aprende a leer una gráfica solo por navegar.

De Platzi se toma la **gramática de movimiento** (cards inclinadas con parallax, hover lift,
entradas escalonadas, densidad oscura del contenido flotante), no la estructura ni el color.

De Brilliant se toma **una sola mecánica, aplicada en todas partes**:

> **Predecir antes de revelar.** El usuario nunca ve la respuesta correcta antes de
> haber comprometido una suya. Ningún widget de Bursa es un gráfico que solo se mira.

---

## 3. Mapa de pantallas

```
/                              Landing (existe, hay que rehacerla)
/modulo/1                      EL CAMINO  ← pantalla principal
/modulo/1/leccion/1            Lección 1 — ¿Qué es el dinero?
/modulo/1/leccion/2            Lección 2 — Inflación (widget ya existe)
/modulo/1/leccion/3            Lección 3 — Interés simple vs. compuesto
/dev/widgets                   Banco de pruebas (existe, mantener)
```

⚠️ **Next 16**: leer `node_modules/next/dist/docs/01-app/` antes de crear rutas.
En esta versión `params` es asíncrono — `const { id } = await params`. No asumir la API
de memoria.

### `/modulo/1` — anatomía

```
┌──────────────────────────────────────────────────┐
│ BURSA          racha 🔥3      módulo 1 · 0 de 10 │  header fijo
├──────────────────────────────────────────────────┤
│                                                  │
│   Hola, Mateo                                    │  saludo, Montserrat bold
│   Empieza por entender la plata que ya tienes.   │
│                                                  │
│      ╭─────────╮                                 │
│      │ recibo  │ ← papeles financieros flotantes │  fondo con parallax
│      ╰─────────╯    (inclinados, sombra suave)   │
│                                                  │
│                              ●10 ─ ─ ─           │
│                         ●9 ─╯                    │
│                    ●8 ─╯                         │  EL CAMINO
│              ● 7 ─╯                              │  línea quebrada
│         ●6 ─╯                                    │  ascendente
│    ●5 ─╯                                         │
│  ●4                                              │
│ ●3      ╭────────╮                               │
│ ●2      │ vela ▮ │                               │
│ ●1      ╰────────╯                               │
│                                                  │
│   [ Continuar con la lección 1 → ]               │
└──────────────────────────────────────────────────┘
```

- **Desktop**: camino en diagonal ascendente, izquierda→derecha.
- **Móvil**: el mismo camino en vertical, zigzag suave, ancho máx 1 columna.
- **Nodos**: círculo de 44 px (`--touch-min`) con número de lección.
  - Completado: relleno `--brand-600`, check.
  - Disponible: borde `--brand-600` de 2 px, relleno `--surface-raised`, con halo pulsante.
  - Bloqueado: relleno `--surface`, borde `--border`, candado, opacidad 0.5.
- **Hover en nodo disponible**: aparece una card con el **gancho** de esa lección
  (el temario ya trae los 10 ganchos escritos — se usan tal cual).
- **Papeles flotantes de fondo**: 4–6 fragmentos de información financiera
  (extracto bancario, gráfica de velas, recibo de tienda, titular de prensa).
  Son SVG/CSS puros, no imágenes. Decorativos → `aria-hidden="true"`.

---

## 4. Sistema de movimiento

Esta es la parte que hay que hacer bien. Todo lo demás es estructura.

### 4.1 Tokens de movimiento (añadir a `tokens.css`)

`tokens.css` ya tiene `--transition-fast/normal/slow` pero **no tiene curvas ni escalonado**,
y hoy todo usa `ease` genérico — que es por lo que el producto no se siente como Platzi.
Adición propuesta (aditiva, no rompe nada existente):

```css
/* ─── Curvas ─── */
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);    /* entradas, reveals */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);    /* hover, micro */
--ease-in-out:    cubic-bezier(0.76, 0, 0.24, 1);   /* transición de escena */

/* ─── Duraciones narrativas ─── */
--duration-micro:  150ms;  /* hover, press */
--duration-element: 250ms; /* card entra, feedback aparece */
--duration-scene:   400ms; /* cambio de paso, dibujo de tramo */
--duration-story:  1000ms; /* revelación del interés compuesto */

/* ─── Escalonado ─── */
--stagger: 60ms;
```

Springs (Framer Motion, no CSS):

```ts
export const SPRING_DRAG  = { type: 'spring', stiffness: 400, damping: 30 };
export const SPRING_THUMB = { type: 'spring', stiffness: 500, damping: 35 };
export const SPRING_SOFT  = { type: 'spring', stiffness: 120, damping: 25 }; // parallax
```

Guardarlos en `src/lib/motion.ts` junto con las variantes reutilizables.

### 4.2 Inventario: Platzi → Bursa

| Gesto en Platzi | Traducción a Bursa | Valores exactos |
|---|---|---|
| Cards de cursos inclinadas en el hero | Papeles financieros flotantes de fondo | `rotate` entre −6° y 6°, deriva `y: ±6px` en 6–9 s, loop, fases desfasadas |
| Parallax sutil al mover el mouse | Igual, sobre los papeles | máx **12 px** de desplazamiento, `SPRING_SOFT`, apagado en touch |
| Hover lift en card | Nodo del camino y cards de lección | `y: -2px`, `--shadow-sm` → `--shadow-md`, `--duration-micro`, `--ease-out-quart` |
| Card inclinada que se endereza en hover | Papel que se endereza al pasar por encima | `rotate: 0`, `scale: 1.02`, 200 ms |
| Entrada escalonada de la grilla | Nodos del camino apareciendo tras la línea | `--stagger` 60 ms, máx 8 elementos escalonados |
| Barra de progreso que se llena | Progreso del módulo y de los 5 pasos | `scaleX` con `transform-origin: left`, `--duration-scene` |
| Sidebar colapsable | Igual, pero solo con lo que existe | ancho 260↔72 px, `--ease-in-out`, 300 ms |
| Countdown de promo que corre | **No se copia.** Bursa no usa urgencia | — (regla de tono: sin urgencia artificial) |
| — (no existe en Platzi) | **Dibujo de la línea del camino** | SVG `pathLength: 0→1`, 900 ms, `--ease-out-expo` |

### 4.3 Reglas no negociables

1. **Solo `transform` y `opacity`.** Nunca animar `width`, `height`, `top`, `left`,
   `margin` o `box-shadow` en bucle. El dibujo de SVG (`pathLength`) es la única
   excepción aceptada.
2. **El movimiento explica o no existe.** Si una animación no comunica causa, estado
   o jerarquía, se borra.
3. **Nada bloquea al usuario.** Ninguna animación de entrada impide interactuar.
   Si el usuario hace clic durante el dibujo del camino, el dibujo salta al final.
4. **`prefers-reduced-motion` se respeta en JS, no solo en CSS.**
   `tokens.css` pone las transiciones CSS en 0 ms, pero **Framer Motion ignora eso**.
   Todo componente animado usa `useReducedMotion()` — como ya hace
   `LiveVisualization.tsx`. Bajo reduced motion:
   - Se apaga: parallax, flotación, dibujo de línea, escalonado.
   - Se conserva: cambios de opacidad de 100 ms, para que no se pierda la información
     de que algo cambió.
   - Nunca se elimina contenido, solo su desplazamiento.
5. **Feedback de error no castiga.** Shake corto (`x: [0,-5,5,-4,4,0]`, 320 ms) y color
   `--feedback-wrong`. Sin rojo agresivo, sin sonido, sin pérdida de progreso.
   (El temario lo exige: *evaluación formativa, no punitiva*.)

---

## 5. Componentes a construir

### 5.1 Shell de aplicación

| Componente | Ruta | Notas |
|---|---|---|
| `AppShell` | `src/components/shell/AppShell.tsx` | Header fijo + sidebar colapsable + main |
| `Sidebar` | `src/components/shell/Sidebar.tsx` | Inicio · Módulos · Progreso. Colapsa a 72 px |
| `StreakBadge` | `src/components/shell/StreakBadge.tsx` | Racha diaria (mecánica del temario) |
| `ProgressBar` | `src/components/shell/ProgressBar.tsx` | `scaleX`, reutilizable |

### 5.2 El camino

| Componente | Responsabilidad |
|---|---|
| `LearningPath` | Orquesta: calcula posiciones de nodos, renderiza SVG + nodos |
| `PathLine` | El `<path>` SVG. Dos capas: tramo completado (sólido) y bloqueado (punteado) |
| `LessonNode` | Nodo individual. Estados: `completed` / `available` / `locked` |
| `LessonPeek` | Card de hover con el gancho de la lección |
| `FloatingPapers` | Fondo decorativo con parallax. `aria-hidden` |

**Cálculo de posiciones:** función pura `getPathPoints(count, viewport)` en
`src/lib/path-geometry.ts`. Debe ser testeable sin DOM y devolver el mismo layout
para el mismo input — el camino no puede bailar entre renders.

### 5.3 Motor de lección

| Componente | Responsabilidad |
|---|---|
| `LessonPlayer` | Máquina de 5 pasos del temario. `AnimatePresence` entre pasos |
| `StepHook` | Paso 1 — gancho, tipografía grande, entrada desde abajo |
| `StepConcept` | Paso 2 — concepto |
| `StepExample` | Paso 3 — ejemplo local en pesos |
| `StepPractice` | Paso 4 — monta el widget según `widgetType` |
| `StepSummary` | Paso 5 — resumen de una línea + botón a la siguiente lección |

Transición entre pasos: `x: 24 → 0` + `opacity: 0 → 1`, `--duration-scene`, `--ease-out-expo`.
Salida en espejo. Barra de 5 segmentos arriba.

### 5.4 Widgets nuevos

`types.ts` ya define los contratos. Faltan dos implementaciones para este alcance:

**`DragClassifier`** (L1) — arrastrar items a zonas. `SPRING_DRAG` al soltar,
snap a la zona más cercana, item mal clasificado vuelve a su origen con el shake.
Debe tener **fallback de teclado**: seleccionar item con Enter, mover con flechas,
soltar con Enter. Sin esto no pasa a producción.

**`AnimatedComparator` en modo predicción** (L3) — esta es la pieza donde se nota
Brilliant:

1. Se muestra solo la línea de interés **simple**, completa.
2. El usuario **arrastra un punto** hasta donde cree que estará el interés compuesto
   a los 5 años. (Esto es predecir antes de revelar.)
3. Se dibuja la línea real con `pathLength` en `--duration-story`, pasando por encima
   de su predicción.
4. El feedback dice cuánto se acercó, no si "ganó".

Añadir a `AnimatedComparatorConfig` en `types.ts`:

```ts
/** Activa el modo predicción antes de revelar la serie */
predictionMode?: {
  seriesId: string;      // qué serie se oculta hasta la predicción
  atX: number;           // en qué punto del eje X se predice
  tolerancePercent: number;
  feedbackClose: string;
  feedbackFar: string;
};
```

Cada widget nuevo necesita: `.tsx`, `.stories.tsx`, `index.ts` — siguiendo exactamente
la estructura de `ConsequenceSlider/`.

---

### 5.5 El saludo

Platzi saluda con *"Hola mateo / Tienes objetivos por completar"*. Bursa no puede copiar eso:
**"tienes objetivos por completar" es una deuda pendiente**, y las reglas de tono prohíben
la urgencia y la culpa. Tampoco sirve el saludo por hora del día ("Buenos días") — lo hace
cualquier app y no dice nada de Bursa.

El saludo de Bursa hace tres trabajos: **orientar** (dónde estoy, qué sigue), **reconocer**
(volviste) y, a partir de la tercera lección, **enseñar** — porque el saludo es el lugar
natural para el *refuerzo espaciado* que el temario ya exige.

#### El nombre se pide después, no antes

Decisión: **no hay campo de nombre en la entrada.** Pedirle datos a alguien antes de darle
nada es exactamente lo que hacen los bancos, y Bursa se define por oposición a eso.

El nombre se pide **una sola vez, en el paso de resumen de la Lección 1** — cuando el
usuario ya recibió algo. Microcopy:

> **¿Cómo te decimos?**
> Se queda en este dispositivo. No te vamos a pedir nada más.
> `[ ________ ]`  `[ Listo ]`  `Prefiero sin nombre`

Si no hay nombre, el saludo omite la coma y el nombre. No se degrada feo, es otra frase.

#### Los cuatro estados

| Estado | Condición | Titular | Segunda línea | CTA |
|---|---|---|---|---|
| **0 · Primera vez** | Sin progreso | *Todo esto empieza con un billete que ya tienes en el bolsillo.* | Diez lecciones. Ninguna pasa de cinco minutos. | `Empezar por el principio` |
| **1 · En curso** | 1+ lección, < 3 días | *Hola, Mateo.* · *Bienvenido de vuelta.* | Llevas **2 de 10**. La que sigue es sobre interés compuesto. | `Seguir: Interés simple vs. compuesto` |
| **2 · Volvió tarde** | ≥ 3 días sin entrar | *Hola de nuevo, Mateo.* | Te quedaste en la lección 3. Antes de seguir, diez segundos de repaso. | `Repasar y seguir` |
| **3 · Módulo completo** | 10 de 10 | *Terminaste el Módulo 1, Mateo.* | Ya entiendes cómo funciona la plata. El Módulo 2 es sobre hacerla trabajar. | `Ver el Módulo 2` |

Reglas de redacción para estos textos:

- **Nunca** "te faltan 8 lecciones" (deuda). **Siempre** "llevas 2 de 10" (logro).
- **Nunca** "¡No pierdas tu racha!" (urgencia). El estado 2 no regaña: reconoce la ausencia
  y ofrece contexto.
- El dato concreto va en negrita dentro de la frase, no en una card aparte.
- La segunda línea siempre nombra **la lección siguiente por su tema**, no por su número.
  "La que sigue es sobre interés compuesto" orienta; "Lección 3" no.

#### El estado 2 es el refuerzo espaciado

El temario lo pide explícitamente:

> *"Antes de desbloquear la lección 4, el usuario repasa en 10 segundos el concepto clave
> de la lección 1 — no la lección completa, solo la idea."*

Ese repaso **vive en el saludo**, no en una pantalla aparte. Al entrar en estado 2, debajo
del saludo aparece una tarjeta de una sola frase con el concepto clave de una lección ya
vista, y un botón `Lo tengo`. Diez segundos, cero fricción, y el usuario vuelve a la línea
donde la dejó.

Componente: `SpacedReview` en `src/components/shell/`. Elige qué concepto repasar con una
función pura `pickReviewConcept(progress)` — la lección completada hace más tiempo que
todavía no se haya repasado. Testeable sin DOM.

#### Movimiento

El saludo entra **antes** que el camino; el camino se dibuja después. Esa secuencia es
deliberada: primero se te reconoce, después se te muestra el terreno.

```
0 ms     saludo: y 12 → 0, opacity 0 → 1   (--duration-scene, --ease-out-expo)
+80 ms   el nombre entra aparte, mismo gesto  ← hace que se sienta personal
+200 ms  segunda línea + CTA
+400 ms  la línea del camino empieza a dibujarse
+400 ms  nodos en stagger de 60 ms, siguiendo el dibujo
```

- La cifra de progreso (`2 de 10`) usa **rolling digits** cuando cambia al volver de una
  lección completada. Es el único momento donde el número se mueve solo.
- `SpacedReview` entra con `scale: 0.96 → 1` + fade, 250 ms, y sale colapsando la altura
  cuando el usuario pulsa `Lo tengo`.
- Bajo `prefers-reduced-motion`: todo aparece completo, sin escalonado ni rolling digits.

#### Componentes

| Componente | Responsabilidad |
|---|---|
| `Greeting` | Elige el estado 0–3 y renderiza. Sin lógica de progreso dentro |
| `SpacedReview` | Tarjeta de repaso de 10 segundos (estado 2) |
| `NamePrompt` | Se monta en `StepSummary` de la Lección 1, una sola vez |
| `RollingNumber` | Cifra que rueda al cambiar. Reutilizable (racha, progreso) |

La selección de estado es una función pura `getGreetingState(progress, now)` en
`src/lib/greeting.ts`, con test en vitest — incluyendo el corte de los 3 días y el caso
de progreso vacío en el primer render del servidor.

---

## 6. Contenido de las 3 lecciones

Archivos en `src/content/modulo-1/`, mismo formato que `leccion-02-inflacion.ts`.
Los textos de gancho, concepto y aplicación salen del temario — **no se inventan**.
Los de ejemplo y resumen se redactan siguiendo las reglas de tono (tutear, ninguna
palabra técnica sin explicar en la misma frase, empezar por algo que ya vivió,
sin épica y sin urgencia).

| # | Lección | Widget | Estado |
|---|---|---|---|
| 1 | ¿Qué es el dinero y por qué existe? | `DragClassifier` | Por construir |
| 2 | ¿Por qué tu plata vale menos cada año? | `ConsequenceSlider` | ✅ Widget listo, falta integrarlo |
| 3 | Interés simple vs. compuesto | `AnimatedComparator` + predicción | Por construir |
| 4–10 | — | — | Nodos bloqueados con su gancho visible |

### ⚠️ Desviación del temario que hay que aprobar

La aplicación práctica de L1 en el docx es *"Explica con tus palabras por qué el trueque
dejó de funcionar"* — texto libre, que no se puede evaluar sin un modelo de lenguaje
y rompe el bucle de feedback inmediato.

**Propuesta de reemplazo:** clasificar 6 intercambios cotidianos en dos zonas —
*"se puede resolver con trueque"* vs. *"necesita dinero"* (ej. cambiar una bici por un
celular / pagarle al conductor del bus / pagarle a un profesor). Enseña la doble
coincidencia de deseos por experiencia, y es evaluable al instante.

**Esto requiere tu visto bueno antes de escribir el contenido.** Si prefieres conservar
el texto libre, hay que decidir si se evalúa con LLM o si es una reflexión sin corrección.

---

## 7. Estado y persistencia

Sin backend todavía. Hook `useProgress` en `src/lib/progress.ts` sobre `localStorage`:

```ts
interface ModuleProgress {
  moduleId: string;
  completedLessons: number[];
  lastVisitedLesson: number;
  streakDays: number;
  lastActiveDate: string;      // ISO, para la racha y el corte de 3 días del saludo
  userName: string | null;     // null = nunca se pidió; '' = dijo "prefiero sin nombre"
  namePrompted: boolean;       // para no volver a preguntar jamás
  reviewedConcepts: number[];  // lecciones ya repasadas por SpacedReview
}
```

- Escribir con `try/catch`: `localStorage` lanza en modo privado.
- Leer en `useEffect`, no durante el render — evita el mismatch de hidratación de Next.
- Estado inicial del servidor = progreso vacío. El camino se dibuja con lo que llegue.

**Deuda explícita:** esto se pierde si el usuario cambia de dispositivo. Aceptable para
validar; hay que reemplazarlo por backend antes de tener usuarios reales.

---

## 8. Accesibilidad y rendimiento

- Todo nodo del camino es un `<button>` o `<Link>` real, nunca un `<div>` con `onClick`.
- Nodo bloqueado: `aria-disabled="true"` + `aria-label` que diga por qué está bloqueado.
- El camino completo tiene un `<ol>` equivalente visualmente oculto — un lector de
  pantalla no puede navegar un SVG decorativo.
- Foco visible siempre: ya hay regla global en `globals.css`, no anularla.
- Contraste mínimo 4.5:1. ⚠️ Verificar `--brand-600 #F4501B` sobre blanco — está en
  el límite para texto pequeño. Usar `--brand-700` para texto sobre fondo claro.
- El addon `@storybook/addon-a11y` ya está instalado: cada story nueva debe pasar en verde.
- `FloatingPapers` se desmonta bajo `prefers-reduced-motion`, no solo se congela.

---

## 9. Fases de ejecución

> **Estado (2026-09-20):** Fases 0, 1, 2 y 3 hechas y verificadas en navegador real: las lecciones 1, 2 y 3 se recorren
> de principio a fin (`/modulo/1` → `/modulo/1/leccion/N`) y el camino llega al nodo 4. Fase 4: landing `/` hecha; falta la
> revisión de movimiento en móvil real y las lecciones 4–10.
> Pruebas: `/dev/camino?done=2&name=1` (estados: `done=0..10`, `late=1`, `name=1`) y `/modulo/1` con el progreso real.
>
> **Dónde me aparté de este plan, y por qué:**
> - **Sidebar:** el ancho cambia al instante (260↔72), no animado. Animar `width` rompe la regla de solo transform/opacity y
>   obliga al camino a recalcular su geometría en cada cuadro. Lo que se anima es la opacidad de las etiquetas.
> - **`usePrefersReducedMotion`** propio en lugar del `useReducedMotion` de framer: el de framer causaba un error de
>   hidratación real (lo detectó la prueba en navegador). Regla actualizada en `AGENTS.md`.
> - **Escalonado:** no hay variante `staggerChildren`; cada hijo usa `staggerDelay(i)`. Los nodos entran *detrás del trazo*
>   invirtiendo la curva de easing (`timeForProgress`), no con retrasos lineales (que los dejaban atrasados).
> - **Camino vertical (móvil):** el zigzag se redujo al 60 % del ancho útil (a 100 % cruzaba la pantalla como un rayo) y no
>   lleva área bajo la curva. La lección 1 sigue abajo: el usuario escala. Decisión de diseño abierta, ver §10.
> - **Copy añadido que no estaba en el plan:** "Repaso de 10 segundos · lección N", "Sigue: {tema}", la leyenda del camino
>   (Hecha / Sigue / Por abrir), el rótulo tipo cotización "M1 · Fundamentos del dinero ▲ 20 %" y el título "Tu camino".
> - **Papeles flotantes:** deciden por *container query* (ancho del héroe), no por ancho de ventana: con la barra lateral
>   abierta el héroe mide 260 px menos que la pantalla.
> - **Práctica de L1 (decisión #1, tomada por delegación):** se implementó el reemplazo propuesto (clasificar 6 intercambios
>   en "trueque" vs. "necesita dinero"), no el texto libre del docx. El texto del docx sigue intacto en `temario.ts`.
> - **`DragClassifier` muestra una situación a la vez** (no una bandeja con las 6): con la bandeja, las zonas quedaban fuera
>   de pantalla mientras se arrastraba, sobre todo en móvil. Tres vías equivalentes: arrastrar, tocar ítem y luego zona,
>   o teclado. Tras 2 fallos con el mismo ítem se coloca solo y se explica (nadie se atasca).
> - **`AnimatedComparator`:** rango de 5 años al 20 % anual (simple $200.000 vs. compuesto $248.832); el punto es un
>   `role="slider"` con teclado; el veredicto dice cuánto se acercó, sin "ganar/perder".
> - **Lección 3 con datos cada cuarto de año** para que el compuesto se vea curvo y no quebrado.
> - **`ConsequenceSlider`/`FeedbackOverlay`** migrados a `usePrefersReducedMotion` (decisión #7 cerrada); barras del
>   `LiveVisualization` ancladas a su base (flotaban mientras animaban) y `height="auto"` inválido en el SVG corregido.
> - **`FeedbackOverlay`** se trae a la vista solo (`scrollIntoView`) porque la barra fija de la lección lo tapaba.
> - **Base móvil** (skill `mobile-native`): sin resaltado al tocar, `touch-action: manipulation`, `:hover` solo con puntero
>   fino, `dvh` en el shell, `viewport-fit=cover`.
> - **Landing (`/`):** imágenes de `Bursa\Fotos` (fuera del repo) — se usaron 8 de 19 (ver `public/landing/`). Se descartaron las que tienen
>   groserías, marcas de terceros (Goldman Sachs, BlackRock, "JP Morgan" mal escrito, marca de agua de pollinations.ai) o el
>   rostro de personas reales (Buffett, actores). Tamaños "display" = múltiplos de `--font-size-4xl` (no hay tokens mayores: **pendiente
>   confirmar con Claude Design**). Sin cifras de usuarios ni testimonios inventados. Las capturas del producto se regeneran con Playwright.
>   Derechos de las fotos por verificar antes de publicar. Con reduced-motion no hay sticky ni parallax.

Cada fase termina en algo que se puede ver en el navegador. No avanzar sin cerrar la anterior.

### Fase 0 — Cimientos de movimiento
- [x] Añadir tokens de movimiento a `tokens.css`
- [x] Crear `src/lib/motion.ts` con springs y variantes reutilizables
- [x] Crear `src/lib/path-geometry.ts` con `getPathPoints` + su test en vitest
- [x] Crear `src/lib/greeting.ts` con `getGreetingState` + `pickReviewConcept` + tests
- **Listo cuando:** los tests de geometría y de saludo pasan y `motion.ts` está importable.

### Fase 1 — El camino y el saludo
- [x] `AppShell` + `Sidebar` + `StreakBadge`
- [x] `Greeting` con los 4 estados + `RollingNumber`
- [x] `LearningPath`, `PathLine`, `LessonNode`, `LessonPeek`
- [x] `FloatingPapers` con parallax
- [x] Ruta `/modulo/1` con las 10 lecciones (solo la siguiente disponible; el resto bloqueadas por orden)
- **Listo cuando:** se abre `/modulo/1`, el saludo entra primero, la línea se dibuja después,
  los nodos entran escalonados, el hover muestra el gancho, un nodo bloqueado hace shake,
  y con reduced motion todo aparece instantáneo sin perder información.
  Los 4 estados del saludo se pueden ver en Storybook.

### Fase 2 — Motor de lección + L2
- [x] `LessonPlayer` con los 5 pasos y transiciones
- [x] Integrar el `ConsequenceSlider` existente en el paso 4
- [x] `NamePrompt` en el resumen de L1 + `SpacedReview` en el saludo
- [x] `useProgress` (hook y persistencia), conectado a completar lecciones reales
- **Listo cuando:** se puede recorrer la lección 2 de principio a fin, volver al camino,
  y ver el tramo nuevo dibujarse mientras la cifra de progreso rueda.

### Fase 3 — L1 y L3
- [x] `DragClassifier` + story + navegación por teclado
- [x] `AnimatedComparator` con modo predicción + story
- [x] Contenido de L1 y L3
- **Listo cuando:** las 3 lecciones se completan end-to-end y el camino llega al nodo 4.

### Fase 4 — Pulido
- [x] Rehacer `/` como landing (héroe con centro fijo y columnas laterales en parallax, manifiesto que se lee con el scroll, producto real en piezas, lección incrustada, camino, franja del mercado). `src/components/landing/`
- [x] Pasada de a11y (`axe-core`: 0 violaciones en la landing y en 11 estados de las lecciones)
- [ ] Revisión de movimiento en móvil real (no solo en el simulador)

---

## 10. Decisiones abiertas

| # | Decisión | Estado | Bloquea |
|---|---|---|---|
| 1 | Aplicación práctica de L1 (ver §6) | ✅ Implementado el reemplazo propuesto (por delegación); reversible: el texto libre sigue en `temario.ts` | — |
| 2 | El saludo y el nombre de usuario | ✅ Resuelto en §5.5 | — |
| 3 | Leer el sistema de diseño en Claude Design | ⏳ Requiere `/design-login` en sesión interactiva | Reconciliación de `tokens.css`. No bloquea Fase 0–1 |
| 4 | Confirmar las reglas de tono contra Claude Design | ⏳ Depende de #3 | Textos de Fase 2–3 |
| 5 | Backend de progreso | Aplazado a propósito | Después de validar |
| 6 | Camino vertical en móvil: ¿lección 1 abajo (el usuario "escala", metáfora de la gráfica) o arriba (orden de lectura, la actual queda a la vista)? Hoy: abajo. El botón del saludo ya lleva a la siguiente lección desde arriba | ⏳ Necesita tu criterio | Nada; es solo de gusto |
| 7 | `ConsequenceSlider` y `FeedbackOverlay` con el `useReducedMotion` de framer | ✅ Migrados a `usePrefersReducedMotion` | — |

---

## 11. Prompt ejecutable

> Copiar desde aquí para arrancar la Fase 0 y 1 en una sesión nueva.

```
Trabajas en bursa-app (Next 16, React 19, Tailwind 4, framer-motion 13.4, Storybook 10,
vitest). Lee docs/PLAN-MODULO-1.md completo antes de escribir una sola línea.

Antes de crear rutas, lee node_modules/next/dist/docs/01-app/ — esta versión de Next
tiene cambios que no están en tu entrenamiento; `params` es asíncrono.

Implementa las Fases 0 y 1 del plan: los cimientos de movimiento, el saludo, y la pantalla
del camino en /modulo/1.

Reglas que no se negocian:
- tokens.css es la fuente única de verdad. Nada de valores hardcodeados: ni colores,
  ni espaciados, ni duraciones. La única edición permitida a tokens.css es el bloque
  de tokens de movimiento de la §4.1, exactamente como está escrito ahí.
- Solo se animan transform y opacity. Única excepción: pathLength en SVG.
- Todo componente animado llama a useReducedMotion() de framer-motion y apaga parallax,
  flotación, dibujo y escalonado — conservando un cross-fade de 100ms para que no se
  pierda la información de que algo cambió. tokens.css pone las transiciones CSS en 0ms
  bajo reduced-motion, pero eso NO afecta a framer-motion.
- Los nodos del camino son <Link> o <button> reales, nunca divs con onClick.
  El camino lleva un <ol> equivalente visualmente oculto para lectores de pantalla.
- Cada componente nuevo sigue la estructura de components/widgets/ConsequenceSlider/:
  Componente.tsx + Componente.stories.tsx + index.ts.
- getPathPoints (lib/path-geometry.ts) y getGreetingState (lib/greeting.ts) son funciones
  puras con test en vitest.
- Los textos de las lecciones salen del temario (§6 del plan), no se inventan. Los del
  saludo están escritos literalmente en §5.5: úsalos tal cual, no los reescribas.
- Tono: tutear, ninguna palabra técnica sin explicar en la misma frase, sin épica y sin
  urgencia. Nunca "te faltan 8 lecciones"; siempre "llevas 2 de 10".
- No hay campo de nombre en la entrada. El nombre se pide una sola vez, al terminar la
  Lección 1. Sin nombre, el saludo es otra frase — no una frase con un hueco.
- La fuente de verdad visual es el proyecto de Claude Design, todavía no leído. Si algo
  te parece que falta en tokens.css, pregunta antes de inventar un valor.

Empieza por la Fase 0 y muéstrame los tests de path-geometry pasando antes de seguir
con la Fase 1. No avances de fase sin que la anterior se vea funcionando en el navegador.
```

---

*Última actualización: 2026-09-20*
