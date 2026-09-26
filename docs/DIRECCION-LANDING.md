# Dirección de la landing de Bursa

25 de septiembre de 2026. **Aprobada por el dueño el 25 de septiembre.** Reemplaza la idea de
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
   la moneda se encoge sobre su pedestal quieto (un video que el scroll recorre; cada año muestra el
   cuadro cuya área de moneda es la fracción de poder de compra que queda), mientras un contador dice cuánto compran hoy $100.000 con la
   inflación real del Banco de la República. El movimiento *es* la explicación: más scroll, más
   años, menos plata. Cita la fuente al pie.
3. **"Mira crecer tu plata"** (la firma interactiva). Apartas $100.000 cada mes. Al bajar pasan
   los meses: la alcancía suma lo guardado y el frasco crece con la tasa real de CDT, y la planta
   crece por etapas. Al final se ve la diferencia del interés compuesto. Reemplaza a "La misma
   plata, dos decisiones".
4. **"Lee la letra pequeña".** El documento del crédito; al bajar, se ilumina la cláusula que
   importa. Ya existe; se pule.
5. **"Así se aprende en Bursa".** Un celular con la app real, anclado en una sola pantalla. Al
   bajar, la pantalla pasa por los tres momentos de una lección: predices, lo ves, entiendes por
   qué; cada momento es también un botón. Aquí aparece Monedita por
   primera vez.
6. **La ruta, instituciones, preguntas y cierre.** La ruta con los nombres reales de los módulos;
   el cierre con Monedita saludando una vez y, al fondo, velas de mercado muy tenues que se
   iluminan cerca del cursor.

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

## 8. Sistema de imagen de la landing

Todas las imágenes de la landing comparten cuatro rasgos, para que se reconozcan como de Bursa sin
ver el logo:

1. **La base.** Cada objeto se para sobre el mismo pedestal redondo, naranja de marca, con la onda
   de Bursa grabada al frente.
2. **El material.** Vidrio transparente y oro pulido.
3. **La luz.** Cálida desde arriba a la izquierda, con sombra suave de contacto.
4. **La cámara.** A la altura del objeto, en tres cuartos, con el mismo encuadre en toda la serie.

En el capítulo claro las imágenes van con fondo transparente (el fondo papel se convirtió en alfa)
y recortadas centradas sobre el pedestal, así nunca se ve un rectángulo. En el capítulo oscuro, el
video se funde con una máscara radial.

| Archivo en `public/landing/` | Uso |
|---|---|
| `moneda.webp` | Héroe (con la onda grabada también en el pedestal) |
| `moneda-encoge.mp4` + `moneda-encoge-inicio.webp` / `-fin.webp` | Capítulo "Tu plata se encoge": video (Kling 3.0) que el scroll recorre; los .webp son el póster y el estado final con movimiento reducido |
| `frasco-1.webp` a `frasco-4.webp` | Capítulo "Mira crecer tu plata": la planta y las monedas crecen con el scroll |
| `alcancia.webp` | El mismo capítulo: la plata guardada sin intereses |

Generadas con Nano Banana Pro (2 créditos cada una, 14 en total), usando como referencia de
estilo la alcancía anterior y el símbolo del logo. Para una imagen nueva de la serie se sube una
de estas como referencia y se pide "misma cámara, mismo pedestal, solo cambia el objeto".

## 9. Cómo sabremos que funciona

- En 5 segundos, 4 de 5 personas de 15 a 27 años saben decir qué es Bursa (prueba de 5 segundos).
- Clic en "Empieza gratis" desde la landing: medirlo antes y después del cambio (`/api/medir`).
- Lighthouse de rendimiento de 90 o más en celular: las imágenes pesadas no bloquean.
