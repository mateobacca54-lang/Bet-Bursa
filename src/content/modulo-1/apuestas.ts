// ============================================================
// apuestas.ts — la pantalla "Tu apuesta" de cada lección (DESIGN.md §8).
//
// Antes de explicar nada, la persona predice qué pasa. Es el truco de Brilliant:
// quien apostó quiere saber si acertó, y lee la explicación buscando la respuesta.
// No hay respuesta mala. Al final de la lección se retoma: "Apostaste X…".
//
// NO viene del temario (temario.ts no se toca). Cada pregunta sale de la explicación
// o del ejemplo de su propia lección, con las mismas cifras, para no inventar datos.
// ============================================================

export interface OpcionApuesta {
  id: string;
  texto: string;
}

export interface Apuesta {
  /** Número de lección, 1–10 */
  leccion: number;
  pregunta: string;
  opciones: readonly OpcionApuesta[];
  /** id de la opción que la lección termina mostrando como cierta */
  acierto: string;
  /** Una frase que cierra la apuesta en el resumen. Explica, no califica. */
  cierre: string;
}

export const APUESTAS_MODULO_1: readonly Apuesta[] = [
  {
    leccion: 1,
    pregunta: 'Si mañana nadie en Colombia recibiera billetes, ¿cuánto valdría tu billete de $50.000?',
    opciones: [
      { id: 'igual', texto: 'Lo mismo: $50.000' },
      { id: 'papel', texto: 'Casi nada: solo el papel' },
      { id: 'banco', texto: 'Lo que diga el banco' },
    ],
    acierto: 'papel',
    cierre: 'El billete vale porque todos confiamos en que otros lo van a recibir. Sin esa confianza, es papel.',
  },
  {
    leccion: 2,
    pregunta: 'Si los precios suben 6,5 % cada año, en 10 años tu almuerzo de $8.000 cuesta…',
    opciones: [
      { id: 'poco', texto: 'Unos $8.500' },
      { id: 'doble', texto: 'Unos $15.000' },
      { id: 'mucho', texto: 'Unos $40.000' },
    ],
    acierto: 'doble',
    cierre: 'Un 6,5 % al año parece poco, pero se acumula: en 10 años el almuerzo casi dobla su precio.',
  },
  {
    leccion: 3,
    pregunta: 'Guardas $100.000 al 20 % anual durante 5 años. ¿Con cuál terminas con más plata?',
    opciones: [
      { id: 'simple', texto: 'Con interés simple' },
      { id: 'compuesto', texto: 'Con interés compuesto' },
      { id: 'igual', texto: 'Terminan igual' },
    ],
    acierto: 'compuesto',
    cierre: 'Con el compuesto llegas a $248.832; con el simple, a $200.000. La diferencia es ganar sobre lo que ya ganaste.',
  },
  {
    leccion: 4,
    pregunta: 'Guardas $1.000.000 en una alcancía durante 5 años. Cuando lo sacas, ¿cuánto alcanza a comprar?',
    opciones: [
      { id: 'igual', texto: 'Lo mismo que hoy' },
      { id: 'menos', texto: 'Menos que hoy' },
      { id: 'mas', texto: 'Más que hoy' },
    ],
    acierto: 'menos',
    cierre: 'El millón sigue ahí, pero los precios subieron. Ahorrar lo protege de gastarlo; no lo protege de la inflación.',
  },
  {
    leccion: 5,
    pregunta: 'Un celular de $1.200.000 pagado a 24 cuotas termina costando…',
    opciones: [
      { id: 'igual', texto: 'Exactamente $1.200.000' },
      { id: 'mas', texto: 'Más de $1.200.000' },
      { id: 'menos', texto: 'Menos, porque son cuotas' },
    ],
    acierto: 'mas',
    cierre: 'Las cuotas llevan intereses: pagas más que el precio. La pregunta es si eso que pagas de más te deja algo.',
  },
  {
    leccion: 6,
    pregunta: 'Te llega la plata del mes. ¿Qué separas primero?',
    opciones: [
      { id: 'antojo', texto: 'Lo que me provoque este mes' },
      { id: 'sobra', texto: 'Lo fijo, y ahorro lo que sobre' },
      { id: 'primero', texto: 'Lo fijo y el ahorro, y con el resto lo variable' },
    ],
    acierto: 'primero',
    cierre: 'Cuando el ahorro va de último, casi siempre queda en cero. Por eso se aparta primero, como una cuenta fija más.',
  },
  {
    leccion: 7,
    pregunta: 'El banco te cobra una tasa por prestarte y te paga otra por guardar tu plata. ¿Cuál es más alta?',
    opciones: [
      { id: 'cobra', texto: 'La que te cobra por prestarte' },
      { id: 'paga', texto: 'La que te paga por guardarla' },
      { id: 'igual', texto: 'Son iguales' },
    ],
    acierto: 'cobra',
    cierre: 'Casi siempre te cobra más de lo que te paga. Esa diferencia es parte de cómo gana un banco.',
  },
  {
    leccion: 8,
    pregunta: 'Tienes plata que no vas a tocar en un año. ¿Dónde te pagan más por ella?',
    opciones: [
      { id: 'ahorros', texto: 'En una cuenta de ahorros' },
      { id: 'cdt', texto: 'En un CDT' },
      { id: 'colchon', texto: 'Debajo del colchón' },
    ],
    acierto: 'cdt',
    cierre: 'Un CDT paga más porque te comprometes a no sacar la plata antes del plazo.',
  },
  {
    leccion: 9,
    pregunta: 'Un crédito dice «6 meses sin pagar cuota». Cuando empiezas a pagar, lo normal es que debas…',
    opciones: [
      { id: 'igual', texto: 'Lo mismo que pediste' },
      { id: 'mas', texto: 'Más de lo que pediste' },
      { id: 'menos', texto: 'Menos, por el beneficio' },
    ],
    acierto: 'mas',
    cierre: 'Si el período de gracia capitaliza, el interés de esos meses se suma a tu deuda aunque no hayas gastado un peso más.',
  },
  {
    leccion: 10,
    pregunta: 'Tienes $500.000 que no necesitas ya. ¿De cuántas formas los puedes poner a crecer?',
    opciones: [
      { id: 'muchas', texto: 'Muchísimas: cada banco tiene la suya' },
      { id: 'dos', texto: 'Dos: prestarlos o ser dueño de algo' },
      { id: 'ninguna', texto: 'Ninguna sin mucho riesgo' },
    ],
    acierto: 'dos',
    cierre: 'Todo producto es una de dos: prestas tu plata (renta fija) o compras un pedazo de algo (renta variable).',
  },
];

export const apuestaDeLeccion = (leccion: number): Apuesta | null =>
  APUESTAS_MODULO_1.find((a) => a.leccion === leccion) ?? null;
