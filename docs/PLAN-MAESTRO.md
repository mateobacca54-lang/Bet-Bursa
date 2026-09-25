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

## Fases

### Fase 0 · Hecho

- Logo aprobado en Figma en toda la app, favicon, ícono de app, og.png
- Datos públicos en lecciones 2, 3, 7 y 9 (Banco de la República) con respaldo fechado
- Monedita sin ₿; saludo en video al entrar a /inicio
- Héroe con profundidad (Monedita detrás, dato de hoy delante)

### Fase 1 · Pulido y cumplimiento (sin dependencias externas)

| Id | Tarea | Ejecuta | Archivos | Listo cuando |
|---|---|---|---|---|
| 1.1 | Profundidad en el resto de la landing: capas, menos vacío, una idea por sección | Sonnet | `src/components/landing/*` salvo el héroe | Capturas antes/después aprobadas |
| 1.2 | Consentimiento de datos (Ley 1581): casilla en el correo, página /privacidad en borrador, la API exige el consentimiento | Sonnet | `EmailPrompt`, `api/suscribir`, `app/privacidad` | Pruebas y captura; texto marcado para revisión legal |
| 1.3 | Clips: Monedita celebra (fin de lección) y el corrientazo que sube (lección 2) | Opus + Higgsfield | `public/monedita`, `LessonSteps` | ~15 créditos; reproducción única; reduced motion estático |
| 1.4 | Accesibilidad y rendimiento: Lighthouse, contraste, foco, peso de imágenes | Sonnet | Según hallazgos | Informe + correcciones |

### Fase 2 · Cuentas y medición (necesita decisión: proveedor)

| Id | Tarea | Ejecuta |
|---|---|---|
| 2.1 | Cuentas con Google y enlace al correo; desde la lección 2 | Sonnet |
| 2.2 | Progreso en servidor y migración desde localStorage | Sonnet |
| 2.3 | Eventos: lección terminada, regreso a 7 días; /api/medir con base de datos | Sonnet |
| 2.4 | Flujo de menores: año de nacimiento y autorización del acudiente | Sonnet |

### Fase 3 · Contenido (necesita el temario del equipo)

| Id | Tarea | Ejecuta |
|---|---|---|
| 3.1 | Módulo 2 «Tu primera tarjeta y tu primer sueldo»: temario lo entrega el equipo | Equipo |
| 3.2 | Lecciones jugables del Módulo 2 con los widgets existentes | Sonnet |

### Fase 4 · Monetización

| Id | Tarea | Ejecuta |
|---|---|---|
| 4.1 | Pasarela (tarjeta, PSE, Nequi), página de cuenta, cancelar en dos toques | Sonnet |
| 4.2 | Convenios: códigos por institución, panel docente, prueba inicial y final | Sonnet |

## Decisiones pendientes del equipo

1. ~~Proveedor de cuentas~~: **Supabase**, aprobado el 25 de septiembre. Falta conectar el conector y crear el proyecto.
2. Temario de «Tu plata en el día a día» (ver `RUTA-DE-APRENDIZAJE.md`).
3. Pasarela de pagos (Wompi, PayU, Mercado Pago o ePayco).
4. Acceso a Vercel: el conector entra como usuario, pero falta autorizar el equipo (scope `mateobacca54-3793`).

Los módulos se nombran por lo que enseñan, no por número (`RUTA-DE-APRENDIZAJE.md`). Todo lo generado sigue `PERSONALIDAD-VISUAL.md`.
