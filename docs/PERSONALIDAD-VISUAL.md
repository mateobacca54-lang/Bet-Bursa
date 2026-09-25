# Personalidad visual de Bursa (imágenes y videos generados)

Última revisión: 25 de septiembre de 2026. Aplica a todo lo que se genere con Higgsfield u otra
herramienta. Las gráficas y los diagramas **no se generan**: se dibujan en código con `tokens.css`,
para que sean exactos y se puedan tocar.

## 1. Por qué Duolingo y Brilliant se reconocen al instante

- **Duolingo:** un personaje que siempre tiene el mismo cuerpo, la misma paleta y la misma manera de
  moverse, y que reacciona a lo que haces. La personalidad está en el personaje, no en los fondos.
- **Brilliant:** dos registros que nunca se mezclan. Los diagramas son planos, con líneas limpias y
  un solo color de acento. Los íconos y objetos son 3D suaves y brillantes, sobre fondo claro y sin
  escenario.

Bursa usa la misma división en dos registros.

## 2. Los dos registros de Bursa

| Registro | Qué es | Cómo se hace |
|---|---|---|
| **Diagrama** | Gráficas, líneas de tiempo, canastas, pilas de billetes que cambian | Código (SVG + `tokens.css`), plano, línea `--ink`, un acento por escena |
| **Personaje y objeto** | Monedita, Bolsito, objetos-ícono (empanada, alcancía, tarjeta) | Generado, 3D suave, con las reglas de abajo |

## 3. Reglas del registro generado

1. **Monedita es la protagonista.** Moneda dorada con el símbolo de Bursa en relieve, ojos grandes,
   brazos cortos. Nunca lleva ₿, $ ni el logo de otra marca.
2. **Material:** 3D suave, tipo arcilla pulida, sin texturas realistas. Bordes redondeados.
3. **Luz:** una luz cálida desde arriba a la izquierda y un brillo dorado suave alrededor. Sin
   sombras duras.
4. **Fondo:** blanco o papel liso (`--paper`), sin escenario. Así se integra con `mix-blend-mode:
   multiply` sobre cualquier superficie de la app.
5. **Paleta:** dorado de Monedita, naranja de marca y tinta. Otros colores solo si son del objeto
   (la empanada es dorada, la tarjeta es tinta).
6. **Actitud:** tranquila y curiosa. Monedita explica, señala, celebra con un salto corto o piensa
   con la mano en la barbilla. Nunca corre, no tiene prisa y no asusta.
7. **Movimiento en video:** un solo gesto por clip, cámara fija, de 3 a 5 segundos. Se reproduce una
   vez y se queda quieta en el último cuadro. Con movimiento reducido se muestra el cuadro final.
8. **Encuadre:** el personaje ocupa el 70 % del cuadro, centrado. Nada de texto en la imagen.

## 4. Plantilla de prompt

Siempre se sube la imagen de referencia (`public/monedita/monedita.webp`) y se usa este texto base.
Solo cambia la acción.

```
Soft 3D clay-like character: a friendly golden coin mascot with large eyes and short arms,
an embossed abstract symbol on its face (no letters, no currency signs). Warm key light from
top left, soft golden glow, no hard shadows. Plain pure white background, no scenery, no text.
Centered, character fills 70% of frame. Static camera.
Action: {UNA SOLA ACCIÓN, CALMADA, 3–5 s}.
```

Objetos-ícono (sin personaje):

```
Soft 3D clay-like icon of {OBJETO}, rounded edges, warm key light from top left, soft shadow
under the object, plain pure white background, no text, centered, fills 60% of frame.
```

## 5. Presupuesto

- Video por defecto: Kling 3.0 estándar sin sonido (7,5 créditos por clip de 5 s).
- Un clip a la vez; se revisa antes de pedir el siguiente.
- Antes de producir en serie conviene una **hoja de personaje** de Monedita (frente, perfil, tres
  expresiones), para que todos los clips salgan con el mismo cuerpo. Se pide solo con aprobación,
  porque consume créditos.
