Extraído de `docs/archivo/SPEC-LANDING-V2.md` el 26/09/2026.

# Apariciones al hacer scroll con GSAP (pedido del dueño, 2026-09-23)

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

(verificar: `MetodoDemo` ya no existe en el código — se eliminó en el commit `47f70fc` ("Eliminar código muerto: HeroScrollScene, MetodoDemo...") — así que la mención de arriba a "MetodoDemo" ya no aplica; hoy solo queda `LeeLaLetra` con movimiento propio de framer).

(verificar: la tabla dice que los `.lp-lead` aparecen con `y: 12 → 0` + autoAlpha, pero el propio `ApareceAlBajar.tsx` trae un comentario que dice lo contrario: "Los párrafos (.lp-lead) ya no aparecen al bajar: un fade por defecto no explica nada (docs/PLAN-LANDING-V3.md §5). Solo los titulares llevan máscara de línea." — es decir, hoy los `.lp-lead` no se animan).
