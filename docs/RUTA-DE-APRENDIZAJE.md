# Ruta de aprendizaje de Bursa

Última revisión: 25 de septiembre de 2026. **Propuesta de dirección, pendiente del visto bueno del
equipo.** El temario del primer módulo (`src/content/modulo-1/temario.ts`) no cambia. Los ganchos y
conceptos de los módulos nuevos los escribe el equipo a partir de esta ruta y no se inventan en código.

## 1. Los módulos tienen nombre, no número

"Módulo 2" no le dice nada a nadie. Cada módulo se llama como la pregunta que resuelve. El número
solo existe por dentro: en la ruta de la URL y en la base de datos.

- En pantalla: **Fundamentos del dinero**, **Cómo funciona la deuda**, etc.
- La prueba se llama "Prueba de Fundamentos del dinero", no "Prueba del Módulo 1".
- Cada módulo tiene un color de acento propio, tomado de `tokens.css` (se pide al diseño; no se inventa).

## 2. Para quién

| Momento de vida | Edad | Lo que ya vivió | Lo que le preocupa |
|---|---|---|---|
| Colegio | 15–17 | Mesada, onces, Nequi, rifas | Que la plata no le alcanza; qué estudiar |
| Universidad o técnico | 18–22 | Primer trabajo por horas, ICETEX, primera tarjeta | Deudas, pagar la carrera, independizarse |
| Primer sueldo | 22–27 | Contrato o prestación de servicios, arriendo | Qué le descuentan, ahorrar, invertir sin que lo estafen |

La ruta va de lo que todos viven (precios, presupuesto) a lo que solo le sirve a quien ya llegó ahí
(impuestos, bolsa, emprender). Así, cada módulo es más de nicho que el anterior y nadie ve primero
algo que todavía no le toca.

## 3. La ruta

Cada módulo trae entre 6 y 10 lecciones de menos de cinco minutos. Todo módulo tiene una
**interacción firma**: un widget en el que el concepto se entiende moviendo algo, al estilo Brilliant.

### Tronco común (todos)

| # | Nombre | La pregunta | Interacción firma | Dato público |
|---|---|---|---|---|
| 1 | **Fundamentos del dinero** | ¿Por qué la plata vale menos cada año? | Arrastras los años y ves cuántas empanadas alcanzas a comprar | Inflación (BanRep) |
| 2 | **Tu plata en el día a día** | ¿A dónde se va la plata del mes? | Repartes tu mesada o sueldo en bolsillos y ves qué pasa al final del mes | 4×1000 (DIAN) |
| 3 | **Cómo funciona la deuda** | ¿Cuánto termina costando esa compra a 24 cuotas? | Mueves el número de cuotas y la pila de intereses crece a la vista | Tasa de usura (Superfinanciera) |
| 4 | **Ahorrar con metas** | ¿Dónde guardo la plata para que no se derrita? | Comparas un colchón, una cuenta de ahorros y un CDT en la misma línea de tiempo | DTF y CDT (BanRep) |

### Rama "ya estoy trabajando"

| # | Nombre | La pregunta | Interacción firma | Dato público |
|---|---|---|---|---|
| 5 | **Tu primer sueldo** | ¿Por qué me llega menos de lo que dice el contrato? | Desarmas el sueldo: salud, pensión, prima y cesantías salen como bloques | Salario mínimo (Mintrabajo) |
| 6 | **Tu historial de crédito** | ¿Qué sabe un banco de mí antes de prestarme? | Tus decisiones mueven un puntaje de ejemplo, y cada una explica por qué | — |
| 7 | **Impuestos sin miedo** | ¿Me toca declarar renta? | Respondes cuatro preguntas y el árbol te dice si declaras | UVT (DIAN) |

### Rama "quiero que mi plata crezca"

| # | Nombre | La pregunta | Interacción firma | Dato público |
|---|---|---|---|---|
| 8 | **Cómo funciona invertir** | ¿Por qué hay inversiones que ganan más que otras? | Mezclas activos y ves el rango de resultados abrirse o cerrarse | Tasa de política (BanRep) |
| 9 | **La bolsa por dentro** | ¿Quién decide el precio de una acción? | Pones órdenes de compra y venta y ves cómo se forma el precio | Índice MSCI COLCAP (BVC) |
| 10 | **Que no te estafen** | ¿Cómo se ve una pirámide antes de caer? | Sigues la plata de una pirámide nivel por nivel hasta que no alcanza | Alertas (Superfinanciera) |

### Nicho (a pedido de la comunidad)

- **Emprender con números**: precio, margen y flujo de caja para quien vende por Instagram.
- **Cripto sin humo**: qué es, por qué sube y baja tanto y qué dice la ley en Colombia.
- **Plata en pareja y en familia**: cuentas compartidas, prestarle a un amigo, la natillera.

El orden de las ramas y los nichos se decide con datos. El módulo que más se pida en la comunidad
de redes (encuesta mensual) es el siguiente que se construye.

## 4. Cómo se enseña (lo que tomamos de Brilliant)

1. **Primero tocas, después lees.** Cada lección abre con algo que se mueve, no con un párrafo.
2. **Dos vistas conectadas.** Una gráfica y un objeto concreto cambian juntos: la línea de precios
   y la canasta de empanadas, o la curva de la deuda y la pila de billetes. Una línea punteada une
   el punto de la gráfica con el objeto, como en los ejemplos de Brilliant.
3. **Un solo color de acento por escena.** Lo que importa lleva el color del módulo; lo demás va en
   tinta y gris. Nunca dos cosas compiten por atención.
4. **Huecos para completar.** Al final, el usuario arma la regla con fichas ("la plata pierde ___ por
   año"), en vez de escoger en una lista.
5. **Predecir antes de ver.** Se mantiene lo que ya hace el paso de predicción de cada lección.

Los widgets existentes (`ConsequenceSlider`, `DragClassifier`, `ProportionBuilder`,
`AnimatedComparator`, `DocumentHotspot`, `Elegir`) cubren la mayoría de las interacciones firma.
Hacen falta dos nuevos: **GraficaConectada** (gráfica con una manija que mueve un objeto) y
**Fichas** (completar una regla con fichas).

## 5. Qué necesito del equipo

1. Visto bueno de los nombres y del orden del tronco común.
2. El temario del módulo 2, **Tu plata en el día a día**, con el mismo formato que el temario del
   primer módulo: gancho, concepto y aplicación práctica por lección.
3. El color de acento de cada módulo, definido en Claude Design y copiado a `tokens.css`.
