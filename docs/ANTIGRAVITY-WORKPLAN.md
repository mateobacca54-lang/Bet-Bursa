# Plan de ejecución en Antigravity — Módulo 1

> **Qué construir** está en [`PLAN-MODULO-1.md`](./PLAN-MODULO-1.md). Ese documento no cambia.
> **Este documento es cómo ejecutarlo** con agentes en Antigravity: olas de trabajo
> paralelo, propiedad de archivos, y criterios de aceptación verificables en navegador.

---

## 1. Por qué Antigravity encaja con este proyecto

Todo el Módulo 1 es un trabajo de movimiento. Y el movimiento tiene un problema:
**no se puede revisar leyendo el diff.** Un agente puede escribir un `motion.div`
sintácticamente perfecto que en pantalla se ve mal, llega tarde, o se traba.

Antigravity resuelve exactamente eso: sus agentes manejan el navegador y entregan
**grabaciones y capturas** como parte del resultado, no solo código. Por eso en este
plan **ningún criterio de aceptación está escrito en prosa** — todos son artefactos
de navegador que el agente tiene que producir.

La otra pieza que se aprovecha es el **Agent Manager**: varias tareas de este módulo
son independientes entre sí y pueden correr en paralelo, siempre que ninguna dos toquen
el mismo archivo.

⚠️ **Verificar antes de empezar:** la configuración de Antigravity (dónde lee las reglas,
cómo se conecta la extensión de navegador, qué modelos hay disponibles) cambia rápido.
Confirmar contra la documentación actual del producto; lo que sigue asume `AGENTS.md`
como archivo de reglas porque es el estándar que ya usa este repo.

---

## 2. Preparación (una sola vez, tú, antes de lanzar agentes)

- [ ] Abrir `Beta Bursa/bursa-app` como workspace en Antigravity.
- [ ] `npm run dev` y **dejarlo corriendo** en `localhost:3000`. Los agentes necesitan
      la app viva para verificar; que cada uno levante su propio servidor es la forma
      más rápida de tener cinco puertos en conflicto.
- [ ] Conectar la extensión de navegador y comprobar que un agente puede abrir
      `localhost:3000` y tomar una captura. **No lanzar la Ola 0 hasta que esto funcione**
      — sin navegador, todo este plan se degrada a revisar diffs a ojo.
- [ ] **Si el navegador de Antigravity no funciona** (p. ej. el 404 al descargar el driver de
      Playwright desde `playwright.azureedge.net`): usar el plan B de la §5. La Ola 0 no lo
      necesita; la Ola 1 en adelante sí necesita una de las dos vías.
- [ ] Confirmar que `AGENTS.md` se está leyendo (ver §6).
- [ ] Hacer un commit del estado actual antes de la Ola 0, para poder revisar el diff de cada ola.
- [ ] Correr `/design-login` (ver decisión #3 del plan) si todavía está pendiente.

---

## 3. Reglas de paralelismo

Hay una sola regla y es la que evita el 90% de los desastres con agentes en paralelo:

> **Un archivo tiene un solo dueño por ola.**

Si dos tareas necesitan el mismo archivo, o van en olas distintas, o se fusionan en una.
`tokens.css` es el caso crítico: **lo toca la tarea A y nadie más, nunca.** Por eso la
Ola 0 existe y por eso la Ola 1 no puede empezar antes.

Dentro de una ola las tareas corren simultáneas. Entre olas hay una **revisión tuya**.
No es burocracia: es el único punto donde se puede corregir el rumbo del movimiento
antes de que tres tareas lo hereden mal.

---

## 4. Las olas

```
OLA 0 · Cimientos          A ──┐
(3 agentes en paralelo)    B ──┤
                           C ──┤
                               ↓  ← revisión tuya
OLA 1 · Superficie         D ──┤
(4 agentes en paralelo)    E ──┤
                           F ──┤
                           G ──┤
                               ↓  ← revisión tuya
OLA 2 · Integración        H (agente único)
                               ↓  ← revisión tuya
OLA 3 · Lección            I ──┤
(2 agentes en paralelo)    J ──┤
                               ↓  ← revisión tuya
OLA 4 · Widgets            K ──┤
(2 agentes en paralelo)    L ──┘
```

### Ola 0 — Cimientos

| Tarea | Objetivo | Dueño exclusivo de | Depende de |
|---|---|---|---|
| **A** | Tokens de movimiento + `motion.ts` | `src/styles/tokens.css`, `src/lib/motion.ts` | — |
| **B** | Geometría del camino | `src/lib/path-geometry.ts` + test | — |
| **C** | Estado, saludo y progreso | `src/lib/greeting.ts`, `src/lib/progress.ts` + tests | — |

Las tres son lógica pura. **Su criterio de aceptación no es una grabación sino tests
en verde** — es la única ola donde eso aplica. `npm test` pasa y la salida va
en el artefacto.

`npm test` corre solo el proyecto `unit` de vitest (node, sin navegador, busca
`src/**/*.test.ts`, alias `@/` resuelto). **No usar `npx vitest run` a secas:** eso
arrastra también el proyecto `storybook`, que sí necesita Chromium. `vitest.config.ts`
y `package.json` ya están preparados; **ninguna tarea los edita**.

Limitación honesta de esta ola: A define valores de movimiento (duraciones, curvas,
springs) y los tests solo pueden comprobar que existen y tienen la forma correcta, no
que **se sientan bien**. Eso se juzga en la Ola 1, con grabaciones.

A tiene un encargo adicional que no es código: escribir en `motion.ts` las variantes
reutilizables (`fadeUp`, `drawPath`, `shake`, `hoverLift`) y el helper `staggerDelay(i)`
para escalonar, con comentarios que expliquen **cuándo** usar cada una. No hay variante
`staggerChildren`: se descartó en la corrección de la Ola 0; cada hijo lleva su propio
`transition={{ delay: staggerDelay(i) }}`. Las olas siguientes las importan
en vez de inventar valores, y ahí es donde se gana la consistencia.

### Ola 1 — Superficie

| Tarea | Objetivo | Dueño exclusivo de | Depende de |
|---|---|---|---|
| **D** | `AppShell`, `Sidebar`, `StreakBadge`, `ProgressBar` | `src/components/shell/` (menos Greeting) | A |
| **E** | `LearningPath`, `PathLine`, `LessonNode`, `LessonPeek` | `src/components/path/` | A, B |
| **F** | `Greeting`, `RollingNumber`, `SpacedReview` | `src/components/shell/Greeting*`, `RollingNumber*`, `SpacedReview*` | A, C |
| **G** | `FloatingPapers` con parallax | `src/components/decor/` | A |

**Contenido ya resuelto:** `src/content/modulo-1/temario.ts` tiene las 10 lecciones (título,
gancho, concepto clave, aplicación práctica) copiadas literalmente del docx. E lo usa para los
peeks, F para el repaso y el saludo, H para la ruta. **Ninguna tarea lo edita.** Si un agente
necesita un texto que no está ahí, que pregunte; no lo inventa.

Cada tarea entrega sus componentes **solo en Storybook**, no montados en una página.
Esto es deliberado: así las cuatro pueden correr sin tocar `src/app/`, que queda entero
para la Ola 2. Storybook ya está configurado con el addon de a11y — cada story tiene que
pasarlo en verde.

**G es la tarea de riesgo.** El parallax de fondo es lo más fácil de hacer mal: se pasa
de sutil y marea, o no se nota y sobra. El tope de 12 px del plan no es negociable, y
si al revisarlo no aporta, se borra sin drama. Es decoración; el producto funciona sin ella.

### Ola 2 — Integración

| Tarea | Objetivo | Dueño exclusivo de | Depende de |
|---|---|---|---|
| **H** | Ruta `/modulo/1` componiendo D + E + F + G | `src/app/modulo/` | D, E, F, G |

Un solo agente, porque aquí es donde se decide la **secuencia** (saludo → camino →
nodos) y eso no se puede repartir. Antes de escribir la ruta tiene que leer
`node_modules/next/dist/docs/01-app/` — `params` es asíncrono en esta versión.

### Ola 3 — Motor de lección

| Tarea | Objetivo | Dueño exclusivo de | Depende de |
|---|---|---|---|
| **I** | `LessonPlayer` + los 5 pasos + ruta de lección | `src/components/lesson/`, `src/app/modulo/[m]/leccion/` | H |
| **J** | `NamePrompt` + cableado de `useProgress` end-to-end | `src/components/shell/NamePrompt*`, integración de progreso | H, C |

### Ola 4 — Widgets

| Tarea | Objetivo | Dueño exclusivo de | Depende de |
|---|---|---|---|
| **K** | `DragClassifier` + contenido L1 | `src/components/widgets/DragClassifier/`, `src/content/modulo-1/leccion-01*` | I |
| **L** | `AnimatedComparator` en modo predicción + contenido L3 | `src/components/widgets/AnimatedComparator/`, `src/content/modulo-1/leccion-03*`, `src/lib/types.ts` | I |

🚫 **K está bloqueada hasta que apruebes la decisión #1** del plan (la aplicación práctica
de la Lección 1). No lanzarla antes: el agente escribiría contenido que habría que tirar.

L es la única tarea que edita `types.ts` (añade `predictionMode`). Nadie más lo toca en
esa ola.

---

## 5. Criterios de aceptación: artefactos, no prosa

Cada tarea de las Olas 1–4 entrega estos artefactos. Si falta alguno, la tarea no está
terminada, aunque el código compile.

### Lo que toda tarea con UI debe entregar

1. **Grabación del gesto principal**, a velocidad real. No acelerada, no en cámara lenta.
2. **Captura con `prefers-reduced-motion: reduce` emulado** en DevTools —
   demostrando que el contenido sigue completo y legible, no que desapareció.
3. **Captura a 390 px de ancho** (móvil real, no el escritorio encogido).
4. **Captura del panel de a11y de Storybook en verde.**

### Cómo producirlos sin el navegador de Antigravity (plan B)

`scripts/capture.mjs` usa el Playwright que ya está instalado en el proyecto y graba la
misma página en los tres perfiles de golpe:

| Perfil | Qué es | Artefacto de arriba que cubre |
|---|---|---|
| `desktop` | 1280×800, movimiento normal | 1 — grabación del gesto |
| `reduced-motion` | 1280×800, `prefers-reduced-motion: reduce` emulado | 2 — captura con reduced-motion |
| `mobile-390` | 390×844, móvil con touch | 3 — captura a 390 px |

```
npm run capture -- --url http://localhost:6006/iframe.html?id=<story>&viewMode=story --name tarea-e
npm run capture -- --url http://localhost:3000/modulo/1 --name tarea-h --wait 8000
npm run capture -- --url <url> --name tarea-e --script scripts/gestos/e.mjs
```

- Sale en `artifacts/<name>/`: `<perfil>.webm`, `<perfil>.png` y `summary.json`. Los videos van
  a **velocidad real**. `artifacts/` está en `.gitignore`.
- Para un gesto concreto (hover, clic, arrastre, teclado) el agente escribe un módulo con
  `export async function run(page, ctx) {...}` y lo pasa con `--script`. `ctx.profile` y
  `ctx.reducedMotion` permiten adaptar el gesto (en móvil no hay hover).
  **Propiedad de archivos:** cada tarea puede crear además `scripts/gestos/<letra>.mjs`
  (p. ej. `scripts/gestos/e.mjs`) y ningún otro archivo de `scripts/`. No guardarlo dentro de
  `artifacts/<name>/`: `capture` borra esa carpeta al empezar cada ejecución.
- **Sale con código 1** si hay una excepción no capturada, si reduced-motion no quedó
  emulado, o si hay **scroll horizontal a 390 px**. Ese último chequeo se probó con una
  página deliberadamente rota para comprobar que detecta el fallo.
- Necesita el servidor ya corriendo (`npm run dev` o `npm run storybook`). Si no responde,
  falla con un mensaje claro; **no levantar uno propio**.
- **No cubre el artefacto 4** (panel de a11y de Storybook). Para eso, abrir Storybook a mano
  o correr el proyecto `storybook` de vitest, que sí usa el Playwright local.
- Los gestos de `--script` los escribe el agente, así que **un gesto mal escrito produce un
  video que no prueba nada**: revisar la grabación, no solo el `summary.json`.

### Por tarea

| Tarea | Artefacto que decide si está bien |
|---|---|
| **D** | Grabación del sidebar colapsando 260→72 px, y el foco de teclado recorriendo la navegación |
| **E** | Grabación de: la línea dibujándose de 0 a 1 → nodos entrando escalonados **detrás** del trazo → hover en nodo 3 abriendo el peek → clic en nodo bloqueado haciendo shake sin navegar |
| **F** | Grabación de los **4 estados** del saludo uno tras otro, y del `SpacedReview` entrando y colapsando al pulsar `Lo tengo` |
| **G** | Grabación de 6 s de la deriva en reposo, y del parallax siguiendo el cursor. **Más la misma grabación con el componente desmontado**, para poder comparar si aporta |
| **H** | **La grabación clave del módulo:** carga en frío de `/modulo/1`, del primer frame al reposo, sin cortes |
| **I** | Grabación del recorrido completo de la Lección 2, paso 1 al 5 |
| **J** | Grabación de: completar L2 → volver al camino → el tramo dibujándose y la cifra rodando. Y del `NamePrompt` con la ruta "Prefiero sin nombre" |
| **K** | Grabación de arrastre con mouse **y** del recorrido completo solo con teclado (Enter, flechas, Enter) |
| **L** | Grabación de: predecir arrastrando → revelación de la curva real por encima → feedback |

### Lo que ningún agente puede certificar

Un agente va a grabar el video y decir que funciona. Lo que no puede juzgar es si
**se siente bien**: si 400 ms es demasiado lento, si el escalonado se arrastra, si el
parallax marea. Eso lo decides tú viendo las grabaciones, y es la razón por la que hay
revisión entre olas.

Tres preguntas al revisar cada grabación:

1. ¿El movimiento **explica** algo, o solo adorna? Si adorna, se borra.
2. ¿Podría haber interactuado **mientras** la animación corría?
3. ¿La versión con reduced-motion **pierde información**, o solo pierde movimiento?
   Perder información es un fallo, no una degradación aceptable.

---

## 6. Reglas para los agentes

Van en `AGENTS.md` (ya actualizado en este repo). Si Antigravity resulta leer las reglas
desde otra ubicación, **copiar el bloque ahí** — no reescribirlo de memoria, que es como
se desincronizan.

Ninguna tarea repite las reglas en su prompt. El prompt dice *qué* construir; `AGENTS.md`
dice *cómo se construye en Bursa*. Si una tarea necesita romper una regla, eso es una
conversación contigo, no una excepción que el agente se concede.

---

## 7. Plantilla de prompt por tarea

Cada tarea del Agent Manager se lanza con este molde. Corto a propósito: el contexto
pesado está en los documentos, y repetirlo en el prompt solo genera versiones divergentes.

```
Tarea [ID] del plan de olas de Bursa.

Lee primero, en este orden:
  1. AGENTS.md            (reglas del repo — no negociables)
  2. docs/PLAN-MODULO-1.md      §[secciones relevantes]
  3. docs/ANTIGRAVITY-WORKPLAN.md  §4 (tu fila) y §5 (tus artefactos)

Construye: [objetivo de una línea, de la tabla de §4]

Solo puedes crear o editar archivos dentro de: [dueño exclusivo, de §4]
Cualquier otro archivo que creas necesitar: párate y pregunta. No lo edites.

Entrega los artefactos de §5 para esta tarea. La tarea no está terminada sin ellos.
Si una grabación muestra algo que no cuadra con el plan, dilo en vez de volver a grabar
hasta que salga bien.
```

### Ejemplo, tarea E

```
Tarea E del plan de olas de Bursa.

Lee primero, en este orden:
  1. AGENTS.md
  2. docs/PLAN-MODULO-1.md  §2 (la idea central), §3 (anatomía de /modulo/1),
     §4 (sistema de movimiento), §5.2 (componentes del camino)
  3. docs/ANTIGRAVITY-WORKPLAN.md  §4 (fila E) y §5

Construye: LearningPath, PathLine, LessonNode y LessonPeek — el camino como gráfica
de mercado, con sus 10 nodos y 3 estados. Solo stories de Storybook; no montes nada
en src/app/, esa es la Ola 2.

Importa getPathPoints de lib/path-geometry.ts y las variantes de lib/motion.ts.
No recalcules geometría ni inventes duraciones: si algo falta ahí, pregunta.

Solo puedes crear o editar archivos dentro de: src/components/path/
Cualquier otro archivo que creas necesitar: párate y pregunta.

Entrega los artefactos de §5 para E. La tarea no está terminada sin ellos.
```

---

## 8. Elección de modelo

No todas las tareas piden lo mismo:

- **Criterio fuerte** (E, F, H, L): el camino, el saludo, la secuencia de carga y la
  revelación del interés compuesto. Aquí la diferencia entre un modelo bueno y uno
  excelente se ve en pantalla. Usar el modelo más capaz disponible.
- **Andamiaje** (B, C, D, J): lógica pura y estructura bien especificada. Un modelo
  más rápido y barato basta.
- **A es la excepción engañosa**: parece trivial (escribir tokens), pero define los
  valores que heredan las nueve tareas siguientes. Tratarla como criterio fuerte.

---

## 9. Modos de fallo conocidos

| Síntoma | Causa | Qué hacer |
|---|---|---|
| Todo hace fade-in y se siente plano | El agente ignoró `motion.ts` y puso `opacity` a mano | Rechazar. La regla está en `AGENTS.md`; no negociar la excepción |
| Dos tareas de la misma ola en conflicto de merge | Se rompió la propiedad exclusiva de archivos | No arreglar el merge: relanzar la tarea intrusa con límites más estrechos |
| Valores hardcodeados (`#F96A34`, `250ms`) | El agente no encontró el token y lo inventó | Rechazar y añadir el token que faltaba en una tarea aparte, propiedad de A |
| La grabación se ve bien pero el video está acelerado | El agente quiso enseñar el resultado, no el comportamiento | Pedirla otra vez a velocidad real |
| Reduced-motion "funciona" porque no se ve nada | Se ocultó contenido en vez de quitarle movimiento | Fallo de accesibilidad, no de estilo. Rechazar |
| El agente dice "listo" sin artefactos | No leyó §5 | Devolverla. No revisar código de UI sin grabación |

---

*Complementa a `PLAN-MODULO-1.md`. Última actualización: 2026-09-20*
