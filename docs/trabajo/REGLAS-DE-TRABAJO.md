# Reglas de trabajo con la IA

Acuerdos del dueño sobre cómo trabajan los agentes de IA (Claude) en Bursa. Las reglas del
código, el diseño y el tono están en `AGENTS.md`; aquí va el *cómo* se trabaja.

## 1. Quién piensa y quién programa

- **Opus planea, modelos livianos programan.** El modelo principal (Opus) entiende el pedido,
  diagnostica, decide el plan y revisa el resultado. La implementación se delega a un agente
  con un modelo más liviano (Sonnet o Haiku), con instrucciones precisas: qué archivos tocar,
  qué no tocar y cómo verificar.
- Opus **siempre revisa** lo que entrega el agente liviano antes de subirlo. Ejemplo real: el
  agente que hizo la secuencia de imágenes del celular dejó la animación congelada a medias con
  un scroll rápido; la revisión lo encontró y se corrigió antes de publicar.
- Motivo: gastar menos sin perder calidad.

## 2. Consultar antes de cambiar el rumbo

Se explica y se pregunta **antes** de:

- Descartar una herramienta o un camino que el dueño pidió (ejemplo real: dejar de usar
  Higgsfield para usar un render 3D propio; eso no se hace sin preguntar).
- Borrar archivos.
- Cambiar el enfoque de algo ya aprobado.

## 3. Regla de pagos y créditos

- **Antes de gastar créditos o plata se muestra el costo y se pregunta**, salvo que el dueño ya
  haya autorizado un monto concreto ("puedes usar los 20 créditos").
- Primero se consulta el precio (`get_cost` en Higgsfield) y se hace **una prueba** antes de
  gastar el resto. Si la prueba no convence, se para y se consulta.
- Se avisa cuando el saldo queda en cero.

## 4. Cómo mostrar el trabajo

- El dueño revisa en **Vercel** (el enlace de vista previa de la rama), no con grabaciones ni
  capturas que se le mandan. No se ponen agentes a grabar para mandarle videos.
- Pasar a producción (`main`) solo cuando el dueño lo pide.
- Mensajes claros y cortos, en español, sin jerga técnica sin explicar.

## 5. Decisiones con lógica

- Cada decisión se justifica: por qué esta herramienta y no otra, qué se gana y qué se pierde.
  Ejemplo: para que la animación del celular fuera fluida se eligió una secuencia de imágenes
  en vez de video, porque el iPhone no puede saltar rápido entre cuadros de un video.
- Si algo no se puede medir desde el entorno (por ejemplo, la fluidez en un iPhone real), se
  dice y la prueba del dueño manda.
