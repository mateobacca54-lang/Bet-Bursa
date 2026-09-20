<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Bursa — reglas del repo

Bursa es una escuela de dinero y mercados para jóvenes colombianos. Este repo es la app.

Antes de trabajar, lee `docs/PLAN-MODULO-1.md` (qué se construye) y
`docs/ANTIGRAVITY-WORKPLAN.md` (cómo se ejecuta y qué artefactos entregar).

## Diseño

- **`src/styles/tokens.css` es la única fuente de valores.** Ningún color, espaciado,
  radio, duración o curva se escribe a mano en un componente. Si necesitas un valor que
  no existe: **párate y pregunta**. No lo inventes.
- La fuente de verdad visual real es el proyecto de **Claude Design**; `tokens.css` es
  su espejo local. Por eso no se le añaden valores por cuenta propia.
- `Proyecto Bursa/marca/` (fuera de este repo) **no** gobierna la app. Ignórala.

## Movimiento

- Toda animación importa sus valores de `src/lib/motion.ts`. No se escriben duraciones
  ni curvas sueltas en los componentes.
- **Solo se animan `transform` y `opacity`.** Única excepción: `pathLength` en SVG.
  Nunca `width`, `height`, `top`, `left`, `margin` ni `box-shadow` en bucle.
- **El movimiento explica o no existe.** Si una animación no comunica causa, estado o
  jerarquía, bórrala. Fade-in por defecto en todo es un error, no un estilo.
- Ninguna animación de entrada bloquea la interacción. Si el usuario hace clic mientras
  algo entra, salta al estado final.
- **`prefers-reduced-motion` se respeta en JS, no solo en CSS.** `tokens.css` pone las
  transiciones CSS en 0 ms, pero **Framer Motion ignora eso por completo**. Todo
  componente animado llama a `usePrefersReducedMotion()` de
  `@/lib/usePrefersReducedMotion`. **No uses `useReducedMotion()` de `framer-motion`:** lee
  la media query en el primer render del cliente, el servidor no puede conocerla, y si
  difieren React descarta la hidratación ("Hydration failed"). Nuestro hook devuelve `false`
  durante la hidratación y el valor real justo después. (`ConsequenceSlider` y
  `FeedbackOverlay` aún usan el de framer: migrarlos cuando se toquen.)
  Bajo reduced motion se quita el movimiento, nunca la información.

## Código

- Cada componente sigue la estructura de `components/widgets/ConsequenceSlider/`:
  `Componente.tsx` + `Componente.stories.tsx` + `index.ts`.
- La lógica que se puede probar sin DOM va a `src/lib/` como función pura con test en
  vitest. Geometría, selección de estado y cálculo de progreso entran aquí.
- Nada interactivo es un `<div>` con `onClick`. `<button>` o `<Link>` reales, siempre.
- Todo elemento interactivo funciona con teclado. Un widget de arrastre sin ruta de
  teclado no está terminado.
- `localStorage` siempre dentro de `try/catch` y leído en `useEffect`, nunca durante el
  render — lanza en modo privado y rompe la hidratación.

## Contenido y tono

- Los ganchos, conceptos y aplicaciones prácticas salen del temario del Módulo 1 y ya están
  en `src/content/modulo-1/temario.ts`, copiados literalmente. **No se inventan ni se
  reescriben.** Ese archivo no lo edita ninguna tarea.
- Tutea siempre. Bursa no es un banco.
- Ninguna palabra técnica sin explicar en la misma frase.
- Empieza por algo que el usuario ya vivió: la empanada que subió, el préstamo a un amigo.
- **Sin épica y sin urgencia.** Ni "transforma tu futuro" ni "no te quedes atrás".
- El progreso se nombra como logro, nunca como deuda: "llevas 2 de 10", jamás
  "te faltan 8".
- El error no castiga: se explica y se puede reintentar. Sin rojo agresivo, sin perder
  progreso.

## Verificación

- El código de UI no está terminado sin los artefactos de navegador que pide
  `docs/ANTIGRAVITY-WORKPLAN.md` §5. Si el navegador del IDE no funciona, se producen con
  `npm run capture` (ver el plan B en esa misma sección).
- La lógica pura se valida con `npm test` (proyecto `unit`, sin navegador). No uses
  `npx vitest run` a secas: arrastra Storybook y necesita Chromium.
- Las grabaciones van a velocidad real. Nunca aceleradas.
- Si una grabación muestra algo que no cuadra con el plan, dilo. No vuelvas a grabar
  hasta que salga bien.
- Solo edita los archivos que tu tarea declara como suyos. Para cualquier otro:
  párate y pregunta.
