# Documentación de Bursa

## 1. Qué es Bursa

Bursa es una escuela de dinero y mercados para jóvenes colombianos: lecciones cortas, con ejemplos
en pesos, para aprender a leer las decisiones que mueven la plata. Este repo es la app.

- Producción: https://bursa-six.vercel.app
- Repo: `mateobacca54-lang/Bet-Bursa` en GitHub

## 2. Empieza aquí

En este orden:

1. [`AGENTS.md`](../AGENTS.md) — las reglas del repo (diseño, movimiento, código, contenido, verificación).
2. [`PLAN-MODULO-1.md`](./PLAN-MODULO-1.md) — qué se construye.
3. [`ANTIGRAVITY-WORKPLAN.md`](./ANTIGRAVITY-WORKPLAN.md) — cómo se ejecuta y qué artefactos entregar.
4. [`trabajo/REGLAS-DE-TRABAJO.md`](./trabajo/REGLAS-DE-TRABAJO.md) — cómo se trabaja con la IA.

## 3. Mapa de carpetas

### `src/`

| Carpeta | Qué hay |
|---|---|
| `app/` | Rutas de Next.js (App Router): la portada (`page.tsx`), `/inicio`, `/modulo/1` y sus lecciones, `/progreso`, `/privacidad`, `/sobre`, y `/dev/*` (banco de pruebas interno, apagado en producción). |
| `components/landing/` | La landing pública: héroe (`HeroGaleria`), capítulos, `LeeLaLetra`, "Así se aprende" (`AsiSeAprende`), `CaminoParadas`, `DatosDeHoy`, navegación (`NavPildora`) y sus estilos. |
| `components/widgets/` | Los widgets interactivos de las lecciones: los 6 arquetipos cerrados en `WidgetType` (`src/lib/types.ts`) — `ConsequenceSlider`, `DragClassifier`, `ProportionBuilder`, `DocumentHotspot`, `AnimatedComparator`, `Elegir`. |
| `components/lesson/` | El reproductor de lecciones (`LessonPlayer`, `LessonSteps`, `PracticeWidget`) y los prompts de nombre/correo. |
| `content/modulo-1/` | El temario (`temario.ts`, no se edita a mano) y el contenido de las 10 lecciones del Módulo 1, más la prueba final. |
| `lib/` | Lógica pura (cálculos, geometría, selección de estado) con su test en vitest al lado de cada función, y los hooks compartidos (`usePrefersReducedMotion`, `useProgress`, etc.). |
| `styles/tokens.css` | La única fuente de valores de diseño: color, espaciado, radios, duración y curvas de animación. |

Además: `components/{shell,path,module,prueba,progreso,illus,decor,brand,ayuda,motion,inicio}/` para la barra y navegación, el camino de módulos, la prueba, el progreso, las ilustraciones, la decoración, la marca y utilidades de ayuda y movimiento.

### Fuera de `src/`

| Carpeta | Qué hay |
|---|---|
| `scripts/` | Herramientas de verificación en navegador: `capture.mjs` (capturas), `medir-solapes.mjs`, `exportar-animaciones.mjs`, `grabar-actividades.mjs`, `og.mjs`, `secuencia-celulares.mjs`, y los "gestos" de Playwright en `scripts/gestos/` (cada uno graba o revisa una interacción puntual). |
| `public/` | Activos estáticos: marca (`brand/`), fotos del equipo (`equipo/`), ilustraciones (`illustrations/`), medios de la landing (`landing/`), Monedita (`monedita/`) y objetos de las lecciones (`objetos/`). |

## 4. Documentos por tema

| Documento | De qué trata |
|---|---|
| **Producto y contenido** | |
| [`PLAN-MODULO-1.md`](./PLAN-MODULO-1.md) | Plan de desarrollo del Módulo 1: pantalla de camino + lecciones jugables, y el prompt ejecutable para un agente. |
| [`RUTA-DE-APRENDIZAJE.md`](./RUTA-DE-APRENDIZAJE.md) | Propuesta de cómo se nombran y organizan los módulos futuros (pendiente de aprobación del equipo). |
| **Diseño y marca** | |
| [`PERSONALIDAD-VISUAL.md`](./PERSONALIDAD-VISUAL.md) | Cómo se ve Bursa en imágenes y videos generados (Higgsfield): personaje propio y diagramas planos, inspirado en Duolingo y Brilliant. |
| [`PROMPTS-ASSETS-LANDING.md`](./PROMPTS-ASSETS-LANDING.md) | Los prompts usados para generar las imágenes editoriales de la portada. |
| **Landing** | |
| [`DIRECCION-LANDING.md`](./DIRECCION-LANDING.md) | Qué debe transmitir la primera pantalla de la landing y por qué no abre con un widget jugable (parcialmente reemplazado por `PLAN-LANDING-V3.md`). |
| [`PLAN-LANDING-V3.md`](./PLAN-LANDING-V3.md) | El plan vigente de la landing, "La galería de tu plata": por qué hizo falta una v3 y cómo se construyó. |
| [`landing/ASI-SE-APRENDE.md`](./landing/ASI-SE-APRENDE.md) | Cómo funciona la sección "Así se aprende en Bursa." (los dos celulares que giran con el scroll) y cómo rehacerla. |
| [`landing/GSAP.md`](./landing/GSAP.md) | Reglas de las apariciones al hacer scroll con GSAP: qué se anima, qué no, y `matchMedia` para movimiento reducido. |
| [`landing/LEE-LA-LETRA.md`](./landing/LEE-LA-LETRA.md) | Cómo funciona `LeeLaLetra` (la sección del papel de crédito), su versión original y el rediseño "El papel sobre la mesa". |
| **Trabajo y herramientas** | |
| [`ANTIGRAVITY-WORKPLAN.md`](./ANTIGRAVITY-WORKPLAN.md) | Cómo se ejecuta el trabajo con agentes en Antigravity: olas paralelas, propiedad de archivos y criterios de aceptación verificables en navegador. |
| [`trabajo/REGLAS-DE-TRABAJO.md`](./trabajo/REGLAS-DE-TRABAJO.md) | Acuerdos del dueño sobre cómo trabajan los agentes de IA: quién piensa y quién programa, y cuándo se pregunta antes de actuar. |
| [`trabajo/HERRAMIENTAS-Y-ACCESOS.md`](./trabajo/HERRAMIENTAS-Y-ACCESOS.md) | Dónde vive el proyecto (repo, Vercel, correo) y el flujo para publicar. |
| **Marketing** | |
| [`marketing/PLAN-INICIAL.md`](./marketing/PLAN-INICIAL.md) | Primera conversación sobre marketing: construir comunidad antes de tener la página lista. |
| **Archivo** | |
| [`archivo/README.md`](./archivo/README.md) | Qué hay en `docs/archivo/` y por qué: historia, no instrucciones vigentes. |
| [`archivo/PLAN-REDISENO-LANDING.md`](./archivo/PLAN-REDISENO-LANDING.md) | Propuesta de rediseño de la landing que llevó a `DIRECCION-LANDING.md` y luego a `PLAN-LANDING-V3.md`. |
| [`archivo/PLAN-IDENTIDAD-Y-ANIMACION.md`](./archivo/PLAN-IDENTIDAD-Y-ANIMACION.md) | Pedidos de identidad y animación de la landing (Ola 7), ya incorporados en versiones posteriores. |
| [`archivo/PLAN-MAESTRO.md`](./archivo/PLAN-MAESTRO.md) | Plan de fases (P0–P4) de una revisión general del proyecto, superado por documentos más recientes. |
| [`archivo/SPEC-LANDING-V2.md`](./archivo/SPEC-LANDING-V2.md) | Spec completa de la landing "v2", reemplazada por la v3; sus reglas de GSAP y de `LeeLaLetra` que seguían vigentes se copiaron a `docs/landing/`. |

## 5. Comandos

- `npm run dev` — levanta la app en desarrollo.
- `npm test` — corre la lógica pura (proyecto `unit` de vitest, sin navegador). **No uses `npx vitest run` a secas**: sin `--project unit` arrastra también los tests de Storybook, que necesitan Chromium.
- `npm run build` — build de producción.
- `npm run storybook` — Storybook para ver los componentes sueltos.
- `npm run capture` — genera los artefactos de navegador (capturas/grabaciones) que pide `ANTIGRAVITY-WORKPLAN.md` §5 cuando el navegador del IDE no funciona.
