# Personalidad visual de Bursa (imágenes y videos generados)

Última revisión: 25 de septiembre de 2026. Aplica a todo lo que se genere con Higgsfield u otra
herramienta. Las gráficas y los diagramas **no se generan**: se dibujan en código con `tokens.css`,
para que sean exactos y se puedan tocar.

## 1. Por qué Duolingo y Brilliant se reconocen al instante

- **Duolingo:** un personaje que siempre tiene el mismo cuerpo, la misma paleta y la misma manera de
  moverse, y que reacciona a lo que haces. La personalidad está en el personaje, no en los fondos.
- **Brilliant:** los diagramas son planos, con líneas limpias y un solo color de acento, y se
  mueven cuando los tocas.

Bursa toma las dos cosas: un personaje único y diagramas que se tocan.

## 2. Los dos registros de Bursa

| Registro | Qué es | Cómo se hace |
|---|---|---|
| **Diagrama** | Gráficas, líneas de tiempo, ejes, guías punteadas | Código (SVG + `tokens.css`), plano, línea `--ink`, un acento por escena |
| **Ilustración** | Monedita, Bolsito y los objetos (empanada, alcancía, sobres, tarjeta) | Caricatura plana con borde de tinta; se genera a partir de una ilustración existente |

Nunca se mezclan un tercer y un cuarto estilo. Nada fotorrealista, nada de vidrio y nada de 3D:
Monedita es plana, así que todo lo que la rodea también lo es. (El 25 de septiembre se probó una
empanada en 3D suave y se descartó por eso.)

## 3. Reglas de la ilustración

1. **Monedita es la protagonista.** Es una moneda naranja de marca con borde de tinta grueso, ojos
   grandes con brillo, sonrisa pequeña, el símbolo de Bursa (la onda) en el cuerpo, brazos y
   piernas cortos. Nunca lleva ₿, $ ni el logo de otra marca.
2. **Trazo:** borde oscuro (`--ink`) grueso y constante, y esquinas redondeadas.
3. **Relleno:** plano, sin degradados, a lo sumo una sombra interior plana. La paleta es de
   durazno, naranja de marca, crema y dorado para las monedas.
4. **Fondo:** blanco o papel liso, sin escenario. Se integra con `mix-blend-mode: multiply` o con
   el fondo recortado.
5. **Actitud:** tranquila y curiosa. Monedita explica, señala, celebra con un salto corto o piensa
   con la mano en la barbilla. Nunca corre, no tiene prisa y no asusta.
6. **Movimiento en video:** un solo gesto por clip, cámara fija, de 3 a 5 segundos. Se reproduce una
   vez y se queda quieta en el último cuadro. Con movimiento reducido se muestra el cuadro final.
7. **Encuadre:** el sujeto ocupa del 60 al 70 % del cuadro, centrado. Nada de texto en la imagen.
8. **Nada dibujado a mano en código.** Un objeto (empanada, billete) siempre sale de una
   ilustración, no de un `<path>` improvisado.

## 4. Cómo se genera

Siempre se sube como referencia una ilustración existente del mismo estilo
(`public/illustrations/*-v2.webp` o `public/monedita/monedita.webp`), con Nano Banana 2
(1,5 créditos) y este texto:

```
Redraw {OBJETO / ACCIÓN} in exactly the same flat cartoon illustration style as the reference:
thick dark ink outline, flat warm fills, no gradients, no 3D, no photorealism.
Plain pure white background, no text, centered, fills 65% of frame.
```

## 5. Presupuesto

- Video por defecto: Kling 3.0 estándar sin sonido (7,5 créditos por clip de 5 s).
- Un clip a la vez; se revisa antes de pedir el siguiente.
- Antes de producir en serie conviene una **hoja de personaje** de Monedita (frente, perfil, tres
  expresiones), para que todos los clips salgan con el mismo cuerpo. Se pide solo con aprobación,
  porque consume créditos.
