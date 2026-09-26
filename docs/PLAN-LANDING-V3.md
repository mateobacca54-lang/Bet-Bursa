# Plan de la landing v3 — "La galería de tu plata"

26 de septiembre de 2026. **Propuesta, pendiente de aprobación del dueño.** Cuando se apruebe,
reemplaza las secciones 5, 7 y 8 de `docs/DIRECCION-LANDING.md`; lo demás de ese documento
(qué debe transmitir la primera pantalla, por qué no hay juego en el héroe, quien vuelve) sigue
vigente.

## 0. Por qué hace falta una v3

La v2 cuenta bien la historia, pero se siente básica, y el dueño tiene razón:

| Problema de la v2 | Qué lo causa |
|---|---|
| Los elementos se ven "de plantilla" | Títulos de 48–64 px con tracking normal, botones y tarjetas genéricos, todo centrado igual |
| Las animaciones "no generan nada" | Casi todo es aparecer al bajar. Solo el capítulo oscuro tiene un momento que se recuerda |
| Pensada para celular | La landing la va a usar más gente desde el computador. En 1440 px sobra aire muerto a los lados |
| Cada capítulo es una isla | No hay un hilo visual que una la página de principio a fin |

## 1. Qué tomamos de cada referencia

Las cuatro referencias que eligió el dueño (Apple, Tomorro, Dala, Ramp), filtradas por lo que le
sirve a Bursa. **Apple es la base**; las otras aportan una pieza cada una.

| Referencia | Qué tomamos | Qué NO tomamos |
|---|---|---|
| **Apple** (base) | El producto como evento visual en una galería blanca. Titulares enormes y compactos (80–120 px, peso 600, tracking negativo). Bandas que alternan papel y papel hundido. Tarjetas grandes de 28 px de radio, sin sombra. Barra de anclas por sección. Una cápsula flotante para el precio (para nosotros, "Gratis"). Un solo color de acción | El azul y la tipografía SF Pro (usamos nuestro naranja y Bricolage) |
| **Tomorro** | La barra de navegación como una píldora flotante. Una sola palabra del titular en el color de marca. Capturas del producto inclinadas 4–8° y apiladas para dar profundidad | El verde neón y las esferas degradadas de fondo |
| **Ramp** | La franja de "datos en vivo" en banda oscura: aquí, los indicadores reales del Banco de la República. Bordes finos en lugar de sombras. Composición editorial alineada a la izquierda | El amarillo y la tipografía de un solo peso |
| **Dala** | La jerarquía por tamaño y no por negrita: titulares gigantes al lado de un texto de cuerpo liviano y con mucho aire | El fondo negro total y las partículas |

**La regla que une las cuatro:** un solo color de acción (el naranja de Bursa, `--brand-600`), y
solo donde hay una acción o un dato. Todo lo demás es tipografía, papel y los objetos de vidrio y
oro. Ya es la regla de Bursa; la v3 la aplica con más disciplina.

## 2. El concepto: "La galería de tu plata"

Apple muestra su producto como una escultura en una galería. **El producto de Bursa es entender
la plata**, y ya tenemos su forma física: los objetos de vidrio y oro sobre el pedestal naranja con
la onda. La v3 convierte eso en el hilo de toda la página:

> Una galería blanca, un pedestal por idea. Al bajar, la cámara camina de un pedestal al siguiente:
> la moneda (qué es la plata), la moneda que se encoge (inflación), el frasco que crece (interés
> compuesto), el contrato (crédito), el celular (así se aprende). Cada objeto abre su capítulo.

Por qué funciona para Bursa:

- **Es la idea del video llamativo que tenía el dueño**, pero con una razón de ser: el recorrido
  de la cámara es el índice de lo que vas a aprender. El movimiento explica (regla de AGENTS.md).
- **Se reconoce sin ver el logo**, porque es el sistema de imagen que ya existe (mismo pedestal,
  misma luz, misma cámara).
- **Aguanta visitas repetidas**: no pide nada, no se repite como un juego, y un scroll rápido la
  salta.

## 3. Estructura de la página (primero escritorio, 1440 px)

| # | Sección | Qué pasa | Referencia |
|---|---|---|---|
| — | **Navegación en píldora** | Flotante, translúcida (`backdrop-filter`), con la marca, las anclas de sección y el botón principal. Una línea naranja fina marca en qué capítulo vas | Tomorro + Apple |
| 1 | **Héroe · la galería** | Anclado unas 2,5 pantallas. Titular gigante "Entiende tu **plata**." ("plata" en naranja) y, debajo, la moneda en su pedestal. Al bajar, la moneda gira de tres cuartos a frente (video recorrido por el scroll) y aparecen la frase y los dos botones. Cápsula flotante: "Gratis · 10 lecciones de 3 minutos" | Apple |
| 2 | **Datos de hoy** | Banda oscura (`--ink`) con los indicadores reales que ya trae `useIndicadores` del Banco de la República: inflación, tasa del Banco de la República, tasa de CDT, dólar (TRM) y tasa de usura. Cada uno con fuente y fecha, y una frase que lo explica ("la inflación es cuánto suben los precios en un año"). Estática: no hay cinta en movimiento, porque moverla no explica nada | Ramp |
| 3 | **Tu plata se encoge** | El video que ya existe, en bloque editorial: texto a la izquierda con el año y la cifra enormes, y la moneda entrando desde la derecha a escala grande | Apple (bloque editorial) |
| 4 | **Mira crecer tu plata** | Banda de papel hundido con una tarjeta enorme de 28 px de radio. Alcancía y frasco con la gráfica entre los dos (ya existe). **Nuevo:** tres píldoras para elegir cuánto apartas al mes ($50.000 / $100.000 / $200.000); las cifras y la gráfica se recalculan. Es la única interacción de la página y educa: ves que el interés compuesto crece más cuando apartas más | Apple (tarjeta) |
| 5 | **Lee la letra pequeña** | El contrato del crédito como objeto de la galería, inclinado. Al bajar se ilumina la cláusula que importa (ya existe; se rediseña) | Tomorro (inclinación) |
| 6 | **Así se aprende** | Carrusel horizontal de tarjetas grandes al estilo "Highlights" de Apple: una por momento de la lección (predices, lo ves, entiendes), con capturas reales **de escritorio y de celular**. Controles de puntos y pausa en una píldora. Cierra con la app en un portátil y un celular, lado a lado | Apple + Tomorro |
| 7 | **La ruta** | Los 10 módulos como una fila de pedestales pequeños (objetos nuevos de la misma serie). Los disponibles se ven completos; los que vienen se ven en silueta con "Próximamente" | Apple (galería) |
| 8 | **Instituciones** | Bloque editorial alineado a la izquierda, con tarjetas de borde fino | Ramp |
| 9 | **Preguntas** | Igual que hoy, con la tipografía nueva | — |
| 10 | **Cierre** | Monedita y la tarjeta de la primera lección (ya existe), con un titular final más grande | — |

**En celular** la galería se vuelve una columna: sin anclas largas, con el video a la mitad de
resolución (o imágenes fijas si la conexión es lenta) y el carrusel como deslizable nativo. La
información es la misma; solo cambia la puesta en escena.

## 4. Sistema visual (tokens nuevos que hay que aprobar)

AGENTS.md: `tokens.css` es la única fuente de valores y no se le añade nada sin aprobación. Estos
son los valores que la v3 necesita. **Ninguno se usa hasta que el dueño los apruebe** (y, si
aplica, se reflejen en el proyecto de Claude Design).

### 4.1 Tipografía

| Token propuesto | Valor | Uso |
|---|---|---|
| `--font-size-display-1` | `clamp(3.5rem, 7.5vw, 7.5rem)` (56–120 px) | Titular del héroe |
| `--font-size-display-2` | `clamp(2.75rem, 5vw, 5rem)` (44–80 px) | Titulares de capítulo |
| `--font-size-display-3` | `clamp(2rem, 3.2vw, 3rem)` (32–48 px) | Titulares de tarjeta |
| `--tracking-display` | `-0.035em` | Todo lo de 44 px para arriba (Apple usa -1,2 px a 80 px) |
| `--line-height-display` | `0.95` | Titulares gigantes, compactos como en Apple y Tomorro |
| `--font-weight-body-light` | `300` | Texto de cuerpo grande (18–21 px) junto a titulares enormes (idea de Dala) |

Tipografías: **Bricolage Grotesque se queda** para los titulares (es la voz de la marca).
**Decisión abierta:** Montserrat es ancha y hace que el texto de interfaz se vea menos preciso que
en Apple o Ramp. Propongo probar Inter o Geist para cuerpo y botones (ver §9, D2).

### 4.2 Forma, superficies y material

| Token propuesto | Valor | Uso |
|---|---|---|
| `--radius-card-lg` | `28px` | Tarjetas grandes de capítulo y marcos de imagen (Apple) |
| `--radius-pill` | ya existe | Botones, navegación y cápsulas: todos pasan a píldora |
| `--surface-glass` | `color-mix(in srgb, var(--paper) 72%, transparent)` | Fondo de la navegación flotante |
| `--blur-glass` | `20px` | `backdrop-filter` de la navegación. Estático: nunca se anima (solo se anima `transform` y `opacity`) |
| `--band-gap` | `clamp(6rem, 10vw, 9rem)` | Aire entre bandas en escritorio |

Las superficies ya existen y encajan con Apple: `--paper` hace de su blanco de galería y
`--paper-sunk` de su gris claro (#f5f5f7). El blanco puro (`--surface-raised`) queda para las
tarjetas sobre papel hundido.

### 4.3 Reglas de uso

- Un solo naranja de acción por pantalla: el botón principal, la palabra acentuada del titular o
  el dato vivo. Nunca los tres juntos en la misma vista.
- Sin sombras en tarjetas. La profundidad la dan el cambio de superficie, el borde fino y, en las
  capturas inclinadas, una sombra de contacto que ya es parte de la imagen.
- Alineación: el héroe va centrado (galería); los capítulos van en bloques editoriales alineados a
  la izquierda, con el objeto entrando desde el lado opuesto (Apple, Ramp).

## 5. Sistema de movimiento

La regla de siempre sigue: **el movimiento explica o no existe**, solo `transform` y `opacity`
(más `pathLength` en SVG, y el `currentTime` de los videos recorridos por el scroll), y
`prefers-reduced-motion` se respeta en JS con `usePrefersReducedMotion`.

La v3 se limita a **cinco tipos de movimiento**, cada uno con un trabajo:

| Tipo | Qué explica | Dónde |
|---|---|---|
| **Recorrido por scroll** (video o valor ligado al scroll) | El paso del tiempo o el recorrido de la cámara: más scroll, más años | Héroe, "se encoge", "crece" |
| **Anclaje de capítulo** | "Esto es una sola idea, quédate aquí" | Héroe, capítulos 3–5 |
| **Resorte al presionar** (escala 0,97 al pulsar, sin rebote) | Respuesta inmediata: el botón te oyó | Todos los botones y píldoras |
| **Transición de estado** (cruce de opacidad, 200–300 ms) | Cambió lo que estás viendo | Carrusel, píldoras de monto, pantalla del celular |
| **Máscara de línea en titulares** | Jerarquía: qué se lee primero | Solo en los titulares de capítulo, una vez |

Fuera de la lista, nada se mueve. Se acaba el "todo aparece al bajar".

**Scroll suave.** La queja de la gráfica que "se entrecorta" viene sobre todo de la rueda del
mouse, que avanza a saltos. Propongo **Lenis** solo en escritorio, apagado con movimiento reducido
y en pantallas táctiles (ver §9, D4). Es una dependencia nueva, por eso lo pregunto.

**Detalles de Apple que sí aplican** (del skill `apple-design`): la respuesta va en el
`pointerdown`, no al soltar; toda animación se puede interrumpir y salta al estado final si haces
clic; los resortes arrancan del valor actual en pantalla, nunca del destino.

## 6. Producción de imagen y video (Higgsfield)

Todo mantiene el sistema de imagen de `DIRECCION-LANDING.md` §8 (mismo pedestal con la onda,
vidrio y oro, luz cálida desde arriba a la izquierda, cámara a la altura del objeto).

| Pieza | Cómo se hace | Créditos (aprox.) |
|---|---|---|
| **Video del héroe** (la moneda gira de tres cuartos a frente) | Kling 3.0 desde la imagen actual de la moneda; se interpola y se codifica para recorrerlo con el scroll, igual que el de "se encoge" | ~9 |
| **Cuadros de la galería** (la cámara pasa de un pedestal al siguiente) | Un cuadro fijo por objeto con Nano Banana Pro (misma cámara), y videos de transición con cuadro inicial y final | ~12 imágenes + ~35 videos |
| **Objetos de la ruta** (10 módulos) | Nano Banana Pro, uno por módulo, con la moneda actual como referencia de estilo | ~20 |
| **Contrato del crédito** | Nano Banana Pro, objeto de papel sobre el pedestal | ~2 |

**Presupuesto:** quedan ~64 créditos y el total estimado ronda 78. Propongo hacerlo en dos tandas
(ver §9, D5): primero el héroe, el contrato y los 3 objetos de la ruta que ya tienen contenido;
la galería completa y el resto de objetos, cuando haya créditos.

**Capturas de la app:** reales siempre, nunca dibujadas. Escritorio a 1440 × 900 y celular a
390 × 844 a 3x, sacadas del build de producción (no del servidor de desarrollo) y enmarcadas en
marcos de dispositivo hechos con CSS a partir de los tokens.

## 7. Presupuesto de rendimiento

`DIRECCION-LANDING.md` §9 pide Lighthouse ≥ 90 en celular. En escritorio se permite más peso,
pero con estas reglas:

- **La pintura principal (LCP) es el titular, no el video.** El video del héroe carga después,
  con su póster ya en pantalla.
- **Video del héroe:** ≤ 1,5 MB en escritorio y ≤ 600 KB en celular (WebM + MP4, como el de
  "se encoge").
- **Galería completa:** ≤ 4 MB en total, por tramos: cada video se pide cuando su capítulo está a
  una pantalla de distancia.
- **Datos lentos** (`navigator.connection.saveData` o 2G/3G): imágenes fijas en vez de video,
  con la misma información.
- Imágenes con `sizes` correcto y calidad 90 (ya corregido en la v2).

## 8. Fases de trabajo

Cada fase se cierra con capturas a 1440 × 900 y 390 × 844, grabación a velocidad real y `npm test`
en verde (AGENTS.md, Verificación). Cada componente nuevo sigue la estructura de
`components/widgets/ConsequenceSlider/` y lleva su historia de Storybook. La lógica que se pueda
probar sin navegador va a `src/lib/` con su test.

### Fase 0 — Decisiones y tokens *(bloquea todo lo demás)*
- El dueño responde las decisiones de §9.
- Prueba de tipografía: una página de Storybook con el titular del héroe y un párrafo en las dos
  opciones de cuerpo (Montserrat e Inter/Geist) a 1440 px.
- PR con solo el cambio de `tokens.css` de §4, para aprobarlo por separado.
- Cuando el servidor MCP de refero esté disponible en una sesión nueva: tablero de referencias por
  sección (héroes de galería, bandas de datos, carruseles, navegación en píldora).
- **Entregable:** tokens aprobados y `DIRECCION-LANDING.md` actualizado.

### Fase 1 — Base del sistema
- `NavPildora`: navegación flotante translúcida, con anclas y el indicador del capítulo activo.
- Escala de titulares (`display-1` a `display-3`) aplicada a todos los capítulos.
- `BotonPildora` con el resorte al presionar, que reemplaza a `lp-btn`.
- `TarjetaGaleria` de 28 px y `BandaHundida`.
- Nuevos primitivos en `src/lib/motion.ts`: presets de resorte y una ayuda para ligar valores al
  scroll. Lenis, si se aprueba.
- **Criterio:** la landing actual se ve con el sistema nuevo, sin cambiar todavía el contenido.

### Fase 2 — Producción de assets (primera tanda)
- Video del héroe, contrato del crédito y los objetos de la ruta de los módulos con contenido.
- Capturas reales de escritorio y de celular.
- **Criterio:** cada imagen revisada sobre el papel, sin recuadro visible y centrada en el
  pedestal (lección de la v2).

### Fase 3 — Héroe · la galería
- Héroe anclado con el video recorrido por el scroll, el titular gigante con la palabra acentuada
  y la cápsula "Gratis".
- Póster fijo con movimiento reducido o datos lentos.
- **Criterio:** el titular es el LCP; con movimiento reducido se ve el estado final completo.

### Fase 4 — Datos de hoy y capítulos 3 a 5
- Banda "Datos de hoy" con `useIndicadores` (fuente y fecha visibles; sin cinta en movimiento).
- "Se encoge" en bloque editorial asimétrico.
- "Crece" dentro de la tarjeta grande, con las píldoras de monto. La lógica de recálculo va a
  `src/lib/crecimiento.ts` con test.
- "Letra pequeña" con el contrato como objeto inclinado.

### Fase 5 — Así se aprende
- Carrusel horizontal: teclado (flechas), puntos, pausa; con movimiento reducido no hay avance
  automático.
- La app en portátil y celular, con capturas reales.

### Fase 6 — Ruta, instituciones, preguntas y cierre
- La fila de pedestales de la ruta (disponibles completos, los que vienen en silueta).
- Instituciones en bloque editorial con tarjetas de borde fino.
- Cierre con el titular final más grande.

### Fase 7 — Control de calidad
- Lighthouse de escritorio y de celular dentro del presupuesto de §7.
- Accesibilidad: teclado en todo (carrusel, píldoras, anclas), foco visible, contraste medido.
- Safari: el recorrido por scroll de videos se comporta distinto en WebKit. Hay que probarlo en un
  Safari real, porque el entorno de pruebas solo tiene Chromium.
- Grabaciones a velocidad real de la página completa en escritorio y celular.

## 9. Decisiones que necesito del dueño

Cada una con mi recomendación. Hasta que no estén resueltas, no se empieza la Fase 1.

| # | Decisión | Opciones | Mi recomendación |
|---|---|---|---|
| **D1** | ¿Aprobamos el concepto "La galería de tu plata" como hilo de toda la página? | Sí / Solo en el héroe / Otro | **Sí.** Es el video llamativo que querías, y además ordena toda la página |
| **D2** | ¿Cambiamos la tipografía de cuerpo? | Montserrat (actual) / Inter / Geist | **Probar Inter o Geist** en la Fase 0 y decidir viendo las dos a 1440 px. Afecta también a la app, no solo a la landing |
| **D3** | ¿Aprobamos los tokens de §4? | Sí / Con cambios | Sí, después de verlos en la prueba de la Fase 0 |
| **D4** | ¿Agregamos Lenis (scroll suave en escritorio)? | Sí / No | **Sí**, solo escritorio y con salida para movimiento reducido. Es lo que más arregla la sensación de "entrecortado" |
| **D5** | ¿Hacemos la galería completa ahora o por tandas? | Todo ahora (~78 créditos) / Dos tandas | **Dos tandas.** Primero el héroe, el contrato y la ruta disponible |
| **D6** | ¿Añadimos las píldoras de monto en "Mira crecer tu plata"? | Sí / No, dejarlo solo con scroll | **Sí.** Es la única interacción, y enseña algo que el scroll solo no enseña |
| **D7** | ¿Cuántos indicadores lleva "Datos de hoy"? | Los dos que ya usa la landing (inflación, CDT) / Los cinco que trae `useIndicadores` (más tasa del Banco de la República, dólar y usura) | **Los cinco.** Ya vienen de fuente oficial, y la tasa de usura prepara el capítulo del crédito |
| **D8** | ¿La navegación muestra anclas a los capítulos? | Anclas por capítulo / Solo marca y botón | **Anclas.** En escritorio sobra espacio y ayudan a quien vuelve a saltar directo a lo que le interesa |

## 10. Lo que no cambia

- La historia y los datos reales (inflación y CDT del Banco de la República).
- El tono: tuteo, sin épica ni urgencia, ninguna palabra técnica sin explicar en la misma frase.
- Los ganchos y conceptos salen de `src/content/modulo-1/temario.ts`, copiados tal cual.
- Monedita solo aparece donde se muestra la app y en el cierre; nunca en la misma escena que los
  objetos de vidrio y oro (`DIRECCION-LANDING.md` §4).
- El naranja sigue siendo el único color de acción.
