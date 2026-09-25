# Plan — Identidad, animación con sentido y compañeros (Ola 7)

> Sale de la revisión del dueño del 2026-09-21. Complementa `PLAN-MODULO-1.md` (qué se construye) y
> `ANTIGRAVITY-WORKPLAN.md` (cómo se ejecuta). Aquí solo está lo nuevo: seis frentes, en orden.

## 0. Lo que pidió el dueño, tal cual

1. Las tarjetas nuevas gustaron, pero hay que **pulirlas todas**: el `%` se sale de su billete.
2. En la interfaz principal **quitar la animación ligada al scroll**: las tarjetas deben **flotar**, y al hacer clic
   **abrirse y dar información muy básica** del tema.
3. En **"Aprendes haciendo"**: al hacer scroll, los ítems de los lados **cambian** (desaparecen y aparecen otros,
   como en el héroe) y **van explicando cómo funciona la página**. El centro queda **estático**. El texto de
   "Con tu vida…" va **centrado** en su tarjeta.
4. En el **Módulo 1**: el camino como una **gráfica con subidas y bajadas**.
5. En **cada módulo y cada pregunta**: **animaciones o muñequitos** relacionados, en el espacio vacío.
6. **Estructurar todo en un plan y después desarrollarlo con Antigravity.**

## 1. Principios (lo que hace que esto no se vea genérico)

- **El movimiento explica o no existe** (AGENTS.md). Lo que flota en reposo se limita a lo que el dueño pidió (las
  tarjetas del héroe); todo lo demás se mueve porque el usuario hizo algo o porque *cambia de significado*.
- **Ningún adorno tapa contenido.** Se verifica midiendo, no a ojo (Ola 6).
- **Nada de información solo en movimiento.** Si algo aparece y desaparece con el scroll, su contenido completo
  también está disponible sin movimiento: móvil, `prefers-reduced-motion` y lectores de pantalla ven todo a la vez.
- **Compañeros con función:** Monedita y Bolsito señalan ("estás aquí"), reaccionan ("te vi") o ilustran el tema.
  No hay un muñeco decorativo por rellenar. El hombre del celular sigue fuera (decisión del dueño).
- **Todo dato es verdad.** Los textos que "explican cómo funciona" describen cosas que el producto ya hace.

## 2. Los seis frentes

### A · Estampas: pulir las nueve y sumar cuatro
- **Auditoría objetiva:** una prueba en navegador mide el `getBBox()` de cada escena y exige que quede dentro del
  lienzo con margen de 12 px. Es la única forma de que "se sale de la tarjeta" no vuelva a pasar sin que nadie lo vea.
- Corregir el `%` (era un `<text>` de 150 px que desbordaba el billete) y revisar el resto una por una.
- Cuatro escenas nuevas para las lecciones sin ilustración: 6 *Presupuesto*, 8 *Banco*, 9 *Birrete*, 10 *Semilla*.
  **Las dibuja Antigravity** (`EstampasExtra.tsx`); se revisan renderizadas antes de aceptarlas.
- `src/content/modulo-1/escenas.ts`: qué escena corresponde a cada lección 1–10 (una sola fuente).

### B · Héroe de la landing: flotan y se abren
- Se elimina el `sticky` y el parallax por scroll. El héroe pasa a medir una pantalla.
- Cada tarjeta es un `<button>`. En reposo **flota** (deriva de ±6 px con periodos distintos, desfasada); con
  `prefers-reduced-motion` no flota pero sigue siendo clicable.
- **Clic → se abre** un panel (`role="dialog"`, foco atrapado, Esc y clic fuera cierran, el foco vuelve a la tarjeta).
  Nace desde la posición de la tarjeta (solo `transform` y `opacity`). Contenido *muy básico*, literal del temario:
  la estampa grande, el estado, la **pregunta con la que arranca** (`hook`) y **la idea** (`keyConcept`).
- Tamaño de columna en función del alto de la ventana, para que 3 tarjetas quepan sin pisar la barra ni el titular.

### C · "Aprendes haciendo": escenas ligadas al scroll
- Sección con `sticky`: el **dispositivo del centro queda estático**; los laterales **cambian por escenas** (3), cada
  una con sus tarjetas entrando y saliendo en sentidos opuestos, como el héroe anterior.
- Escenas (todas describen algo que ya existe): **1 · Cómo es** (una idea por pantalla / predices antes de ver /
  con tu vida) · **2 · Cómo practicas** (arrastras, tocas o usas el teclado / si te equivocas te explicamos por qué /
  un repaso de diez segundos al volver) · **3 · Cómo avanzas** (tu avance es una gráfica / menos de cinco minutos por
  lección / se queda en tu dispositivo).
- "Con tu vida…" centrado vertical y horizontalmente. Móvil y `reduced-motion`: las tres escenas apiladas, completas.

### D · El camino como una gráfica de mercado con subidas y bajadas
- `getPathLayout` (diagonal) pasa de una línea que solo sube a una serie **determinista** con vaivén y tendencia
  general al alza: el primer punto es el mínimo y el último el máximo, en medio hay retrocesos.
- Se mantiene lo que ya se probaba: mismo resultado para la misma entrada, márgenes, separación mínima entre nodos.
  Se reemplaza la prueba de "monotonía estricta" por: *x estrictamente creciente, y con al menos 3 cambios de sentido,
  última lección más alta que la primera*.
- Vertical (móvil): el zigzag horizontal ya cumple esa idea; no se toca.

### E · Compañeros y estampas en los espacios vacíos
- **Camino:** Monedita marca "estás aquí" sobre el nodo actual (entra cuando el trazo llega); en el hueco superior
  izquierdo, la estampa del tema que sigue (solo si el hueco existe y no pisa la línea: se mide).
- **Lección:** cada lección muestra su estampa en el *gancho*, en el *concepto* y en el *ejemplo*; en el cierre,
  Monedita reacciona (`hop`). Ninguna pantalla se llena: la ilustración ocupa el espacio que ya estaba vacío.

### F · Verificación (no negociable)
`npm test`, stories en Chromium, `tsc`, `eslint`; medición de choques en 10 anchos; `getBBox` de las 13 estampas; axe
en landing, `/inicio`, camino y una lección; grabaciones `npm run capture` de B y C; y revisión independiente con
Antigravity (`--mode plan`, solo lectura) al terminar.

## 3. Olas y dueños de archivo

| Ola | Tareas | Dueño exclusivo de |
|---|---|---|
| **7.0 Cimientos** | A (pulido + prueba `getBBox` + `escenas.ts`), D (geometría + tests) | `illus/Estampa.tsx`, `content/modulo-1/escenas.ts`, `lib/path-geometry.ts` + test |
| **7.1 Piezas** *(en paralelo)* | A2 cuatro estampas · B héroe · C escenas | **Antigravity:** `illus/EstampasExtra.tsx` · **yo:** `landing/StickyHero.tsx`, `TopicSheet.tsx`, `ProductBento.tsx`, `landing.css`, `landing-data.ts` |
| **7.2 Integración** | E (camino y lección) | `path/LearningPath.tsx`, `lesson/LessonSteps.tsx` |
| **7.3 Cierre** | F | — |

## 4. Decisiones que necesitan al dueño

- Los textos de las tres escenas de "Aprendes haciendo" son redactados por el equipo (no vienen del temario).
- Si el camino vertical de móvil también debe tener subidas y bajadas en altura (hoy sube parejo y serpentea de lado).
- Si Bolsito entra ya como segundo compañero (hoy solo hay una pose de cada uno y ninguna de Bolsito recortada).

## 5. Resultado (2026-09-21)

Ejecutado por olas, con Antigravity dibujando las cuatro estampas nuevas y revisando el resultado al final.

| Frente | Estado | Cómo se comprobó |
|---|---|---|
| A · Estampas | ✅ 13 escenas, todas dentro del lienzo | `getBoundingClientRect` de cada escena contra el lienzo con 12 px de margen (no `getBBox`: ignora las transformaciones del grupo raíz) |
| B · Héroe | ✅ sin scroll, tarjetas flotan y se abren | Clic real: diálogo modal, foco atrapado, Esc, clic fuera, foco de vuelta; 0 choques en 10 tamaños de ventana |
| C · "Aprendes haciendo" | ✅ 3 escenas por scroll, centro estático | Se midió la posición del dispositivo en cada escena (idéntica); con `reduced-motion` las 9 tarjetas siguen visibles |
| D · Camino | ✅ gráfica con subidas y bajadas | 90 pruebas: x creciente, ≥3 retrocesos de ≥25 px, primero mínimo y último máximo, sin colisiones de la etiqueta |
| E · Compañeros | ✅ camino y pregunta de la lección | Se muestran solo si el espacio está libre (`isRectFree`) |

**Revisión independiente (Antigravity, `--mode plan`):** 6 hallazgos, todos aplicados: duraciones de reduced-motion escritas a mano
(ahora `REDUCED_DURATION` en `motion.ts`), el telón del panel era un `div` con `onClick` (ahora un `<button>`), la trampa de
foco no cubría el caso de foco fuera del panel, transiciones de color en componentes nuevos, y un `#000` en una máscara.
**Pendiente conocido:** los botones y enlaces antiguos (`.lp-btn`, `.bursa-nav-item`) siguen animando color; es anterior a esta
ola y no se tocó.

### Dónde me aparté del plan (frente E)
- **Monedita "estás aquí"**: en vez de pararla sobre el nodo actual —donde compite con la etiqueta "Sigue" y con la línea— va
  en la esquina de la ilustración del tema que sigue, en el hueco superior izquierdo. Cumple lo mismo (guía al usuario al
  tema siguiente) sin añadir otro obstáculo sobre la gráfica.
- **Estampa en la lección**: solo en el paso de la *pregunta* (el más vacío). En *concepto* y *ejemplo* hay texto que leer y
  añadirla lo habría recargado. En el cierre, Monedita celebra con un salto.
- **No verificado con captura**: el cierre de la lección (`Celebrate`) pasa `tsc`, ESLint y las pruebas de stories, pero no se
  grabó recorriendo los cinco pasos.

### Lo que salió mal en el camino (y por qué importa)
- Al darle subidas y bajadas a la línea, la etiqueta "Sigue: …" pasó a taparse con el nodo siguiente. Antes el lado derecho
  siempre estaba libre. Se resolvió con una función pura (`pickTagPlacement`) y más margen superior, no con un parche visual.
- Una etiqueta no tiene lado libre en la lección 1 por debajo de ~900 px de ancho: ahí se usa la posición anterior.
- El camino vertical (móvil) **no** tiene subidas y bajadas en altura; sigue serpenteando de lado. Ver decisiones abiertas.

## 6. Ola 8 — Dibujos dentro de las prácticas y carpeta Animaciones (2026-09-21)

Pedido del dueño con dos capturas (la pregunta y el ejemplo de la lección 2 casi vacíos): poner más información gráfica
—dibujitos y objetos— en las prácticas, y reunir todos los dibujos en una carpeta `Animaciones`.

- **Objetos** (`illus/Objetos.tsx`): 9 dibujitos cuadrados sin fondo (bici, bus, cromos, profesor, empanada, casa, almuerzo,
  billete, crecimiento), más `Pila` (torre de monedas) y `Marca` (✓ / ✗). Mismo trazo que las estampas.
- **Lección 1 · clasificar:** cada situación lleva el dibujo de su objeto, en la tarjeta y en la ficha ya colocada
  (`DragItem.icon`). **Lección 2 · slider:** el almuerzo sobre el precio (`ConsequenceSliderConfig.visual`).
  **Lección 3 · comparador:** tras predecir, dos pilas de monedas (interés simple y compuesto). Una moneda es la quinta parte
  del monto inicial, así que la altura es proporcional al valor real: salen 10 y 12 monedas para $200.000 y $248.832.
- **Pantalla del ejemplo:** esquema dibujado por lección (`lesson/EjemploVisual.tsx`): L1 bici ✗ / billete ✓ hacia el almuerzo;
  L2 el mismo almuerzo con "$8.000 · 2015" y luego "hoy ▲"; L3 la recta y la curva. Solo cifras que ya estaban en el texto.
- **`Animaciones/`** (junto a `Fotos` y `Personajes`): 13 estampas (4 formatos cada una), 9 objetos, Monedita, la imagen para
  compartir y 3 grabaciones. Se genera con `node scripts/exportar-animaciones.mjs` leyendo el render real, así que no se
  desincroniza. Los `.svg` llevan los colores resueltos y verificados (0 `var(` sin resolver).
- **Verificación:** 90 unitarias, 88 de stories, `tsc` y ESLint limpios, axe con 0 violaciones en 7 pantallas de lección
  (escritorio y 390 px) y sin scroll horizontal.
- **No cubierto:** el paso del *concepto* sigue sin dibujo (tiene texto que leer); las lecciones 4–10 aún no tienen contenido,
  así que sus esquemas del ejemplo y sus objetos de práctica se harán con ellas. El gesto de arrastrar del clasificador no se
  volvió a probar a mano tras añadir los dibujos (las 88 stories, que renderizan el clasificador, pasan).

*Creado y ejecutado el 2026-09-21.*
