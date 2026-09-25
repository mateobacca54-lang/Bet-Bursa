# Plan maestro de Bursa

Última revisión: 25 de septiembre de 2026. Complementa a `PLAN-MODULO-1.md` (qué se enseña) y
`ANTIGRAVITY-WORKPLAN.md` (cómo se verifica). Las políticas de negocio viven en el documento
«Bursa · Política de monetización».

## Cómo se ejecuta

| Rol | Quién | Hace |
|---|---|---|
| Dirección | Opus | Decide, escribe los encargos, revisa cada entrega, hace el commit |
| Ejecución | Sonnet (agentes en paralelo) | Escribe código en archivos que no se pisan entre sí |
| Tareas mecánicas | Haiku | Capturas, renombres, verificaciones repetitivas |
| Medios | Higgsfield (MCP) | Clips e imágenes, uno a la vez, con costo consultado antes |

Reglas de ejecución:

- Cada tarea declara sus archivos. Dos agentes nunca tocan el mismo archivo.
- Ningún agente hace commit ni `next build`: Opus corre `npm test`, `tsc`, el build y las capturas, y recién ahí hace commit.
- Toda entrega de UI trae capturas de escritorio y móvil (AGENTS.md, Verificación).
- Higgsfield: Kling 3.0 estándar sin sonido (7,5 créditos por clip de 5 s) por defecto. Seedance 2.5 (35) solo si la calidad lo exige y con aprobación.

## Qué tomamos de las referencias

| Referencia | Lo que resuelve bien | Cómo se traduce en Bursa |
|---|---|---|
| Duolingo | Mascota con personalidad que reacciona a lo que haces; progreso como logro | Monedita reacciona (saluda, celebra, piensa) solo ante acciones del usuario |
| Brilliant | Se aprende tocando, no leyendo | Cada concepto tiene un widget; menos texto en la landing, más «pruébalo» |
| Headspace / Calm | Calma, cero urgencia, colores cálidos | Ya está en el tono; se refuerza con fondos papel y sombras suaves |
| Nu / Monzo | Finanzas explicadas en frases cortas, números grandes | Datos reales en grande con una frase de explicación (componente DatoReal) |
| Apple / Linear / Stripe | Profundidad por capas: planos, sombras, un solo foco por pantalla | Tarjetas elevadas sobre fondos hundidos; una idea por sección |
| Lemonade | Honestidad y precio claro | Planes y precio sin letra pequeña en la página de membresía |

## Prioridades

Revisión del 25 de septiembre de 2026. El orden importa: cada bloque se apoya en el anterior.
Los módulos van de últimos por decisión del dueño.

### Hecho

- Logo de Figma en toda la app, favicon, ícono de app y og.png.
- Datos públicos del Banco de la República en las lecciones 2, 3, 7 y 9, con un respaldo fechado.
- Monedita sin ₿; saludo en video en /inicio; el héroe con profundidad.
- Consentimiento de datos (Ley 1581) y /privacidad en borrador.
- Profundidad en Método y Lee la letra.
- Los módulos se nombran por lo que enseñan, no por número.
- Widget GraficaConectada con la empanada en 3D (todavía no está en ninguna lección).

### P0 · Cimientos (sin esto nada más se sostiene)

| Id | Tarea | Por qué | Bloqueo |
|---|---|---|---|
| 0.1 | **Limpieza**: 10 componentes muertos de la landing, 7 imágenes v1 (unos 8 MB), la demo /dev/ahorro con `three` y `animejs`, scripts `_tmp`, 3 planes viejos | Peso, confusión para quien lea el código, dependencias que no se usan | Aprobación del dueño para borrar |
| 0.2 | **CI en GitHub**: pruebas, tsc, lint y build en cada push | Hoy nada impide subir algo roto | — |
| 0.3 | **Vercel**: acceso, variables de entorno y dominio propio | Sin esto no se verifica lo publicado | Reconectar Vercel con el scope correcto |
| 0.4 | **Supabase en São Paulo**: tablas `perfiles`, `progreso` y `eventos` con RLS | Base para cuentas, medición y pagos | Pausar o borrar el proyecto vacío de Oregón (límite de 2 proyectos gratis) |
| 0.5 | **Correo de Bursa**: dominio con correo (Google Workspace o Zoho), envío transaccional con Resend y conector de Gmail | Contacto real en /privacidad, correos de bienvenida, cuentas | Crear el correo y conectar Gmail |

### P1 · La interfaz de inicio y la consistencia

| Id | Tarea | Hallazgo |
|---|---|---|
| 1.1 | **Una sola Monedita** | En la app es plana y naranja; en la landing, 3D y dorada. Duolingo tiene un solo búho. Hay que escoger una y regenerar la otra |
| 1.2 | **/inicio al volver** | Tras responder la apuesta e ir al camino, al volver a /inicio sale la misma apuesta. Verificar y mostrar un estado de regreso ("sigue donde ibas") |
| 1.3 | **Sin ceros para quien empieza** | "0 racha" y "0 de 10" con barra vacía el primer día. Mostrarlos desde la primera lección; antes, "10 lecciones de menos de 5 minutos" |
| 1.4 | **Ayuda tapa contenido en el celular** | El botón flotante "?" queda encima de la primera opción de la apuesta |
| 1.5 | **Sombra de Monedita** | Parece una barra de carga gris; debe ser una elipse suave o ninguna |
| 1.6 | **Mitad vacía en escritorio** | Debajo de la tarjeta no hay nada. Mostrar el camino o la siguiente lección |
| 1.7 | **Accesibilidad y rendimiento** | Lighthouse, contraste, foco y peso de imágenes |

### P2 · Cuentas, medición y comunidad

| Id | Tarea |
|---|---|
| 2.1 | Cuentas con Google y enlace al correo, desde la lección 2 |
| 2.2 | Progreso en el servidor y migración desde localStorage |
| 2.3 | Eventos en Supabase (lección terminada, regreso a 7 días); /api/medir escribe en la base de datos |
| 2.4 | Flujo de menores: año de nacimiento y autorización del acudiente |
| 2.5 | Redes: cuentas de Instagram, TikTok y Facebook a nombre de Bursa; programar y medir con Metricool (conector); TikTok también desde Higgsfield |
| 2.6 | Línea de contenido: 3 piezas por semana con la plantilla de `PERSONALIDAD-VISUAL.md` y la encuesta mensual que decide el siguiente módulo |

### P3 · Monetización

| Id | Tarea |
|---|---|
| 3.1 | Pasarela (tarjeta, PSE y Nequi), página de cuenta, cancelar en dos toques |
| 3.2 | Convenios: códigos por institución, panel docente, prueba inicial y final |

### P4 · Módulos (al final)

| Id | Tarea |
|---|---|
| 4.1 | GraficaConectada dentro de la lección 2 |
| 4.2 | Temario de «Tu plata en el día a día» (lo entrega el equipo) y sus lecciones |
| 4.3 | Widget Fichas (completar la regla) y el resto de la ruta de `RUTA-DE-APRENDIZAJE.md` |

## Decisiones pendientes del dueño

1. Aprobar la limpieza 0.1.
2. Qué Monedita queda (1.1).
3. Correo y dominio de Bursa (0.5).
4. Pausar el proyecto vacío de Supabase en Oregón (0.4).
5. Reconectar Vercel (0.3).
6. Pasarela de pagos: Wompi, PayU, Mercado Pago o ePayco.

Todo lo generado sigue `PERSONALIDAD-VISUAL.md`. Las gráficas y los diagramas se hacen en código, nunca con IA.
