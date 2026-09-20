# Prompts — Ola 0 (cimientos)

> ⚠️ **Registro histórico.** Estos prompts ya se ejecutaron y la revisión encontró defectos
> (localStorage fuera del try/catch en la tarea C; tipos incompatibles con framer-motion y
> variante `staggerChildren` inservible en la tarea A). **No relanzar tal cual:** la
> corrección está en [`PROMPT-CORRECCION-OLA-0.md`](./PROMPT-CORRECCION-OLA-0.md).

Tres tareas independientes. Lánzalas **a la vez** en el Agent Manager, una por agente.
Cada bloque de código es el prompt completo: se pega tal cual.

| Tarea | Modelo sugerido | Por qué |
|---|---|---|
| **A** | El más capaz disponible | Parece trivial, pero define los valores que heredan las 9 tareas siguientes |
| **B** | Uno rápido | Lógica pura con especificación cerrada |
| **C** | Uno rápido | Lógica pura con especificación cerrada |

**Antes de lanzar:**

1. **Haz un commit del estado actual** (`git add -A` y `git commit`). El repo solo tiene el
   commit inicial de `create-next-app`; casi todo el proyecto está sin confirmar. Sin un commit
   base, el `git diff --stat` de abajo mezcla tu trabajo previo con el de los agentes y no
   se puede leer.
2. `npm test` debe correr (aunque diga "no test files"). Es el único criterio de esta ola:
   no hay grabaciones. **No usar `npx vitest run` a secas**: arrastra el proyecto `storybook`,
   que necesita navegador.

**Al terminar las tres**, antes de la Ola 1:

1. `npm test` en verde, desde la raíz, con las tres tareas juntas.
2. `git diff --stat` debe mostrar **solo**: `tokens.css` (únicamente líneas añadidas) + 8 archivos
   nuevos (`motion`, `path-geometry`, `greeting`, `progress`, cada uno con su `.test.ts`).
   Si aparece `vitest.config.ts`, `package.json` o cualquier otro archivo, una tarea se salió
   de sus límites: relánzala en vez de arreglar el merge.
3. Revisa a mano los valores de `motion.ts` contra `PLAN-MODULO-1.md` §4.1.

---

## Tarea A — Tokens y utilidades de movimiento

```
Tarea A del plan de olas de Bursa — Ola 0, cimientos de movimiento.

Lee primero, en este orden:
  1. AGENTS.md  (reglas del repo — no negociables)
  2. docs/PLAN-MODULO-1.md  §4 completa (sistema de movimiento)
  3. docs/ANTIGRAVITY-WORKPLAN.md  §3 y §4 (Ola 0, fila A)

Construye:

1. src/styles/tokens.css — AÑADE al final del bloque :root los tokens de movimiento de
   PLAN §4.1: --ease-out-expo, --ease-out-quart, --ease-in-out, --duration-micro,
   --duration-element, --duration-scene, --duration-story, --stagger.
   Copia los valores literalmente. No modifiques NI UNA línea existente, incluido el bloque
   @media de prefers-reduced-motion.

2. src/lib/motion.ts — sin 'use client', sin hooks: solo datos y funciones puras.
   - DURATION (en segundos): micro 0.15, element 0.25, scene 0.4, story 1.0
   - EASE_OUT_EXPO [0.16,1,0.3,1], EASE_OUT_QUART [0.25,1,0.5,1], EASE_IN_OUT [0.76,0,0.24,1]
   - STAGGER 0.06
   - SPRING_DRAG (stiffness 400, damping 30), SPRING_THUMB (500, 35), SPRING_SOFT (120, 25),
     todos con type: 'spring'
   - DRAW_PATH_DURATION = 0.9  (PLAN §4.2, fila "Dibujo de la línea del camino"; constante
     con nombre aquí, NO un token nuevo)
   - Variants de framer-motion: fadeUp, staggerChildren, drawPath, shake, hoverLift.
       fadeUp           y 12→0 + opacity 0→1, DURATION.scene, EASE_OUT_EXPO
       staggerChildren  contenedor que escalona a sus hijos con STAGGER
       drawPath         pathLength 0→1, DRAW_PATH_DURATION, EASE_OUT_EXPO
       shake            x [0,-5,5,-4,4,0], 0.32 s — feedback de error, no castiga
       hoverLift        y -2, DURATION.micro, EASE_OUT_QUART
     Cada una lleva encima un comentario de 2-3 líneas: CUÁNDO usarla y CUÁNDO NO.
     Las tareas siguientes importan estas variantes en vez de inventar valores; los
     comentarios son lo que evita que las usen mal.
   - motionSafe(variants, reduced): función pura.
       reduced=false → devuelve la MISMA referencia que recibió.
       reduced=true  → devuelve, para cada variante, un equivalente que SOLO anima opacity
       en 0.1 s: sin desplazamiento, sin escalonado, sin dibujo, sin shake. Así el usuario
       no pierde la información de que algo cambió; pierde solo el movimiento.

3. src/lib/motion.test.ts — tests de vitest:
   a) Las constantes reflejan tokens.css: lee tokens.css con node:fs, extrae --duration-*,
      --stagger y los cubic-bezier, y compáralos con DURATION / STAGGER / EASE_*. Si alguien
      cambia un lado sin el otro, el test falla.
   b) Ninguna variante anima nada distinto de: opacity, x, y, scale, scaleX, scaleY, rotate,
      pathLength (más la clave `transition`). Debe fallar si aparece width, height, top,
      left, margin, boxShadow, etc.
   c) motionSafe(v, true) devuelve, para TODAS las variantes, solo opacity con duración 0.1.
   d) motionSafe(v, false) devuelve la misma referencia.

Solo puedes crear o editar estos archivos:
  src/styles/tokens.css (SOLO añadir), src/lib/motion.ts, src/lib/motion.test.ts
NO edites vitest.config.ts ni package.json: ya están preparados.
Cualquier otro archivo que creas necesitar: párate y pregunta.
Si te falta un valor o token que no está en PLAN §4.1: párate y pregunta. No lo inventes.

Valida con `npm test`. NO uses `npx vitest run` a secas: arrastra Storybook y necesita navegador.

Entrega:
  1. La salida completa de `npm test` en verde.
  2. La lista de variantes con su línea de "cuándo usarla".
  3. Cualquier valor que hayas tenido que decidir tú, dicho explícitamente.

Aviso: estos tests comprueban forma y coherencia, no que el movimiento se sienta bien.
Eso se juzga en la Ola 1 con grabaciones. No lo afirmes.
```

---

## Tarea B — Geometría del camino

```
Tarea B del plan de olas de Bursa — Ola 0, geometría del camino.

Lee primero, en este orden:
  1. AGENTS.md  (reglas del repo — no negociables)
  2. docs/PLAN-MODULO-1.md  §2 (la idea central), §3 (anatomía de /modulo/1), §5.2
  3. docs/ANTIGRAVITY-WORKPLAN.md  §3 y §4 (Ola 0, fila B)

Contexto: el camino de aprendizaje de Bursa es una gráfica de mercado — una línea quebrada
ascendente que conecta las 10 lecciones. Esta tarea es solo la matemática de esa línea.
Nada de React, nada de DOM.

Construye src/lib/path-geometry.ts — funciones puras, deterministas (prohibido Math.random y
Date), sin dependencias:

  export const NODE_SIZE = 44   // espeja --touch-min; comentario que lo diga
  export interface PathPoint { x: number; y: number }
  export interface PathViewport { width: number; height: number }
  export interface PathLayout {
    points: PathPoint[]
    width: number      // alto/ancho del lienzo que necesita el SVG
    height: number
    orientation: 'diagonal' | 'vertical'
  }

  getPathLayout(count, viewport): PathLayout
  getPathPoints(count, viewport): PathPoint[]     // = getPathLayout(...).points
  buildPathD(points): string                      // "M x y L x y ..." — segmentos RECTOS
  splitPathAt(points, completed): { done: PathPoint[]; locked: PathPoint[] }

Reglas de layout (coordenadas SVG: y crece hacia abajo; la lección 1 es el punto índice 0):
  - viewport.width >= 640 → 'diagonal'. Menos → 'vertical'.
  - Diagonal: x estrictamente creciente, y estrictamente decreciente (asciende de izquierda a
    derecha). Debe leerse como línea QUEBRADA, no como recta: los segmentos NO tienen todos la
    misma pendiente (cuando count >= 3). Una gráfica de mercado, no una regla.
  - Vertical: una sola columna con zigzag suave en x. La lección 1 abajo, y estrictamente
    decreciente hacia arriba. El alto NO sale del viewport: crece con count y se devuelve en
    layout.height. El ancho de layout.width es viewport.width.
  - Margen: todos los puntos a >= NODE_SIZE/2 + 24 de cada borde del lienzo.
  - Separación: la distancia entre CUALQUIER par de puntos es >= NODE_SIZE + 12, para que los
    nodos táctiles no se solapen.
  - count = 0 → []. count = 1 → un solo punto centrado.
  - count negativo o no entero, o viewport con width/height <= 0 o no finito → lanza RangeError.

splitPathAt(points, completed): `completed` = lecciones completadas.
  done  = points[0..completed] (llega hasta el nodo actual, índice `completed`)
  locked = points[completed..fin]
  Comparten el vértice del nodo actual para que no haya hueco al dibujar las dos capas.
  Clampea `completed` a [0, points.length - 1]. Devuelve copias, no muta la entrada.

Escribe src/lib/path-geometry.test.ts. Debe cubrir, como mínimo:
  - determinismo: dos llamadas con el mismo input dan el mismo resultado (deep equal)
  - count exacto de puntos; los casos 0 y 1
  - diagonal: monotonía estricta y NO colinealidad (count 10)
  - vertical: una columna, lección 1 más abajo, alto crece con count
  - márgenes y separación mínima, barridos con anchos 320-1920 y altos 400-1080, count 10
  - el corte de 640: 639 → vertical, 640 → diagonal
  - buildPathD: empieza con M, solo usa L (nunca C/Q/S), n puntos → 1 M + (n-1) L
  - splitPathAt: vértice compartido; completed=0; completed=count-1; clamp; no muta
  - RangeError en las entradas inválidas

Solo puedes crear o editar: src/lib/path-geometry.ts y src/lib/path-geometry.test.ts
NO edites vitest.config.ts ni package.json: ya están preparados.
Cualquier otro archivo que creas necesitar: párate y pregunta.

Valida con `npm test`. NO uses `npx vitest run` a secas: arrastra Storybook y necesita navegador.

Entrega: la salida completa de `npm test` en verde, y cualquier decisión que hayas tomado tú
donde esta especificación no fuera exacta.
```

---

## Tarea C — Saludo y progreso

```
Tarea C del plan de olas de Bursa — Ola 0, estado del saludo y progreso.

Lee primero, en este orden:
  1. AGENTS.md  (reglas del repo — no negociables)
  2. docs/PLAN-MODULO-1.md  §5.5 (el saludo) y §7 (estado y persistencia)
  3. docs/ANTIGRAVITY-WORKPLAN.md  §3 y §4 (Ola 0, fila C)

Contexto: el saludo tiene cuatro estados según el progreso del usuario. Esta tarea es SOLO la
lógica: qué estado toca y qué datos lo acompañan. Ningún texto de interfaz va en estos
archivos: el copy vive en el componente Greeting (otra tarea).

Sin React, sin DOM, sin dependencias. Funciones puras. `now` siempre entra como parámetro:
prohibido llamar a new Date() dentro de la lógica.

── src/lib/progress.ts ──

  export interface ModuleProgress {          // PLAN §7, con una salvedad
    moduleId: string
    completedLessons: number[]    // EN ORDEN DE FINALIZACIÓN. No se ordena nunca.
    lastVisitedLesson: number
    streakDays: number
    lastActiveDate: string | null // 'YYYY-MM-DD' local. null = nunca activo
    userName: string | null       // null = nunca se pidió; '' = eligió "prefiero sin nombre"
    namePrompted: boolean
    reviewedConcepts: number[]
  }

  emptyProgress(moduleId): ModuleProgress
  toDateKey(date): string
      'YYYY-MM-DD' con los componentes LOCALES (getFullYear/getMonth/getDate).
      NO uses toISOString(): es UTC y en Colombia (UTC-5) cambia de día a las 19:00.
  daysBetween(fromKey, toKey): number
      Días de CALENDARIO entre dos claves (no horas). Calcúlalo con Date.UTC de los
      componentes para que el horario de verano no lo desvíe.
  completeLesson(progress, lesson, now): ModuleProgress
      Inmutable (devuelve un objeto nuevo). Idempotente: completar dos veces no duplica.
      Añade al FINAL de completedLessons. Actualiza lastVisitedLesson y lastActiveDate.
      Racha: mismo día → no cambia (pero si streakDays era 0 pasa a 1); día siguiente → +1;
      hueco de más de 1 día, o primera vez → 1.
      Decisión ya tomada: "actividad" = COMPLETAR una lección. Visitar no cuenta.
  getCurrentStreak(progress, now): number
      streakDays si la última actividad fue hoy o ayer; si no, 0.
  getNextLesson(progress, totalLessons): number | null
      La lección más baja NO completada; null si están todas.
  loadProgress(moduleId, storage?) / saveProgress(progress, storage?)
      `storage` es Pick<Storage,'getItem'|'setItem'>; si no se pasa, usa globalThis.localStorage.
      Clave: `bursa:progress:v1:${moduleId}`.
      loadProgress NUNCA lanza: si falta el storage, getItem lanza, el JSON es inválido o no
      tiene la forma esperada, devuelve emptyProgress(moduleId). Sanea campo por campo.
      saveProgress NUNCA lanza: devuelve true si guardó, false si no.
      (localStorage lanza en modo privado; esto es una regla de AGENTS.md.)
  NO escribas aquí el hook de React (useProgress): lo hace otra tarea en src/lib/useProgress.ts.

── src/lib/greeting.ts ──

  export type GreetingState = 'first-time' | 'in-progress' | 'returning-late' | 'complete'
  export interface GreetingData {
    state: GreetingState
    userName: string | null       // recortado; '' o solo espacios → null
    completedCount: number
    totalLessons: number
    nextLesson: number | null
    reviewLesson: number | null   // solo distinto de null en 'returning-late'
  }

  getGreetingState(progress, now, totalLessons): GreetingData
  pickReviewConcept(progress): number | null
      La primera lección de completedLessons (orden de finalización) que NO esté en
      reviewedConcepts; null si no hay ninguna.

  Reglas de estado, en este orden de prioridad:
    1. completedCount === 0                      → 'first-time'
       (cuenta solo lecciones únicas dentro de 1..totalLessons)
    2. completedCount >= totalLessons            → 'complete'   (gana sobre 'returning-late')
    3. días de calendario desde lastActiveDate hasta hoy >= 3, Y existe algo que repasar
       (pickReviewConcept !== null)              → 'returning-late'
    4. cualquier otro caso                       → 'in-progress'
  Un lastActiveDate en el FUTURO (reloj movido) es 'in-progress', nunca un valor negativo raro.
  emptyProgress debe dar 'first-time': es lo que renderiza el servidor antes de leer storage.

Escribe los tests (src/lib/progress.test.ts y src/lib/greeting.test.ts). Como mínimo:
  - el corte de 3 días: hace 2 días → in-progress; hace 3 → returning-late
  - calendario, no horas: última actividad 2026-09-17 23:50, ahora 2026-09-20 00:05 → 3 días
    (aunque pasaron menos de 72 h); construye las fechas con el constructor LOCAL
    new Date(2026, 8, 20, 0, 5) para que el test no dependa de la zona horaria del equipo
  - cruce de mes y de año
  - complete gana sobre returning-late; returning-late sin nada que repasar cae en in-progress
  - lastActiveDate futuro
  - emptyProgress → first-time
  - toDateKey a las 23:30 locales sigue siendo el mismo día
  - completeLesson: inmutable, idempotente, orden de finalización, las tres ramas de la racha
  - getCurrentStreak vencida → 0
  - loadProgress/saveProgress con un storage falso que LANZA, con JSON corrupto, con forma
    incorrecta, y el camino feliz de ida y vuelta
  - userName: '' y '   ' → null en el saludo

Solo puedes crear o editar estos archivos:
  src/lib/progress.ts, src/lib/progress.test.ts, src/lib/greeting.ts, src/lib/greeting.test.ts
NO edites src/lib/types.ts, vitest.config.ts ni package.json.
Cualquier otro archivo que creas necesitar: párate y pregunta.

Valida con `npm test`. NO uses `npx vitest run` a secas: arrastra Storybook y necesita navegador.

Entrega: la salida completa de `npm test` en verde, y cualquier decisión que hayas tomado tú
donde esta especificación no fuera exacta.
```
