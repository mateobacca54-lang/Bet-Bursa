# Dirección de la landing de Bursa

25 de septiembre de 2026. **Propuesta pendiente del visto bueno del dueño.** Reemplaza la idea de
abrir la landing con un widget jugable, que el dueño rechazó con razón.

## 1. Qué tiene que transmitir la primera pantalla

Quien llega por primera vez decide en unos 5 segundos si Bursa es seria. Tiene 15 a 27 años, viene
de un video en redes y desconfía de todo lo que huela a "hazte rico". La primera impresión tiene
que decir tres cosas, en este orden:

1. **Esto es claro.** Una frase, sin jerga.
2. **Esto es serio y bonito.** Nivel de producto grande, no de proyecto escolar.
3. **Esto es para mí.** Colombia, pesos, cosas que ya vivo.

Lo que **no** debe decir: "juego", "infantil", "tarea" o "otra app de finanzas con números en rojo".

## 2. Por qué se descartó el héroe jugable

- **Pide trabajo antes de dar valor.** Quien llega todavía no sabe qué es Bursa y ya le piden
  arrastrar algo.
- **Se repite.** Quien vuelve cinco veces tendría que ver el mismo juego cinco veces.
- **Baja el tono.** Una empanada dibujada en la primera pantalla hace ver a Bursa como algo para
  niños.
- Brilliant lo puede hacer porque su producto *es* el juego y su marca ya es conocida. Bursa
  primero tiene que ganarse la confianza.

La interactividad se queda **dentro** de las lecciones, donde sí tiene sentido.

## 3. Lo que hacen bien las grandes y lo que tomamos

| Referencia | Qué hace | Qué tomamos |
|---|---|---|
| Apple | Un objeto como protagonista, tipografía enorme, un capítulo por pantalla, el scroll cuenta una historia y alterna capítulos claros y oscuros | Un objeto héroe (la moneda), capítulos anclados con scroll, un capítulo oscuro para dar ritmo |
| Nubank / Revolut | Muestran la app real en un celular y números grandes | Un capítulo con el celular mostrando una lección de verdad |
| Duolingo | El personaje es la memoria de la marca; una frase y dos botones | Monedita aparece como *revelación* del producto, no como decoración del héroe |
| Stripe / Linear | Un detalle visual firma que se repite en toda la página | La onda del logo como línea que atraviesa la página |

## 4. Dos registros visuales, cada uno en su lugar

| Dónde | Registro | Por qué |
|---|---|---|
| **Landing (presentación)** | Objetos premium en vidrio y oro, fotorrealistas, sobre papel, como la alcancía actual | Transmite calidad y confianza; es el primer contacto |
| **App (aprender)** | Monedita y las estampas planas con borde de tinta | Cercanía y juego cuando ya confías y estás aprendiendo |

El puente entre los dos es el capítulo del celular: ahí la landing muestra la app, y con ella a
Monedita. Nunca se mezclan en la misma escena.

## 5. La estructura: una historia en seis capítulos

El scroll hace el trabajo; el usuario no tiene que tocar nada. Todo movimiento explica algo
(AGENTS.md).

1. **Héroe.** Fondo papel y "Entiende tu plata." en tipografía enorme. Debajo, una línea y los dos
   botones. Detrás del texto, una sola moneda de vidrio y oro con la onda de Bursa grabada, quieta
   y bien iluminada. Nada más.
2. **"Tu plata se encoge" (capítulo oscuro).** Anclado. Al bajar, pasan los años de 2026 a 2036 y
   la moneda se encoge (`scale`), mientras un contador dice cuánto compran hoy $100.000 con la
   inflación real del Banco de la República. El movimiento *es* la explicación: más scroll, más
   años, menos plata. Cita la fuente al pie.
3. **"La misma plata, dos decisiones".** La alcancía de vidrio y la matera con la planta. Al bajar,
   las monedas se reparten entre las dos y cada lado dice qué pasa en 12 meses. Ya existe; se pule.
4. **"Lee la letra pequeña".** El documento del crédito; al bajar, se ilumina la cláusula que
   importa. Ya existe; se pule.
5. **"Así se aprende en Bursa".** Un celular con la app real. Al bajar, la pantalla pasa por los
   tres momentos de una lección: predices, lo ves, entiendes por qué. Aquí aparece Monedita por
   primera vez.
6. **La ruta, instituciones, preguntas y cierre.** La ruta con los nombres reales de los módulos;
   el cierre con Monedita saludando una vez.

## 6. Quien vuelve

- La landing detecta el progreso (localStorage, leído en `useEffect`). Si ya empezaste, el botón
  principal dice **"Sigue con la lección N"** y lleva directo, en el héroe y en la barra de arriba.
- No hay nada obligatorio que repetir: la historia se puede saltar con un scroll rápido.
- Con movimiento reducido, cada capítulo muestra su estado final, con la misma información.

## 7. Firma visual

- **La onda del logo** como un trazo fino que baja por la página y une los capítulos. Se dibuja
  con `pathLength` al hacer scroll.
- **Un capítulo oscuro** (fondo `--ink`) en medio de la página para dar ritmo, como Apple.
- **Tipografía**: Bricolage Grotesque enorme en los títulos de capítulo, una idea por pantalla.

## 8. Qué se produce y cuánto cuesta

| Pieza | Herramienta | Costo |
|---|---|---|
| Moneda de vidrio y oro con la onda (héroe y capítulo 2) | Nano Banana Pro, con la alcancía actual como referencia de estilo | 2–4 créditos |
| Celular con la app | Capturas reales de la app dentro de un marco de celular en código | 0 |
| Monedita saludando | Clip existente | 0 |

Sin video generado por ahora: el movimiento lo pone el scroll, no un clip.

## 9. Cómo sabremos que funciona

- En 5 segundos, 4 de 5 personas de 15 a 27 años saben decir qué es Bursa (prueba de 5 segundos).
- Clic en "Empieza gratis" desde la landing: medirlo antes y después del cambio (`/api/medir`).
- Lighthouse de rendimiento de 90 o más en celular: las imágenes pesadas no bloquean.
